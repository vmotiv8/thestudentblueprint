import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import Stripe from 'stripe'

const PLAN_LIMITS: Record<string, { students: number; admins: number; features: object }> = {
  starter: { 
    students: 100, 
    admins: 5, 
    features: { white_label: false, api_access: false, custom_emails: false } 
  },
  pro: { 
    students: 500, 
    admins: 15, 
    features: { white_label: false, api_access: false, custom_emails: true } 
  },
  enterprise: { 
    students: -1, 
    admins: -1, 
    features: { white_label: true, api_access: true, custom_emails: true, remove_branding: true } 
  },
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  status: string
) {
  const supabase = createServerSupabaseClient()
  const metadata = subscription.metadata
  const organizationId = metadata?.organization_id

  if (!organizationId) {
    console.error('No organization_id in subscription metadata')
    return
  }

  const planType = metadata?.plan_type || 'starter'
  const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.starter

  const updateData: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    subscription_status: status === 'active' || status === 'trialing' ? 'active' : status,
    plan_type: planType,
    max_students: limits.students,
    max_admins: limits.admins,
    features: limits.features,
    updated_at: new Date().toISOString(),
  }

  if (planType === 'enterprise') {
    updateData.remove_branding = true
  }

  const { error } = await supabase
    .from('organizations')
    .update(updateData)
    .eq('id', organizationId)

  if (error) {
    console.error('Failed to update organization:', error)
    throw error
  }

}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Idempotency check — skip if we already processed this event
  try {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single()

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
    }
  } catch {
    // Table may not exist yet — proceed without idempotency
  }


  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await handleSubscriptionChange(subscription, 'active')
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, subscription.status)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, 'canceled')
        break
      }

      case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
          if (invoice.subscription) {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription)
          const organizationId = sub.metadata?.organization_id
          if (organizationId) {
            await supabase
              .from('organizations')
              .update({ subscription_status: 'past_due' })
              .eq('id', organizationId)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
          if (invoice.subscription) {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription)
          const organizationId = sub.metadata?.organization_id
          if (organizationId) {
            await supabase
              .from('organizations')
              .update({ subscription_status: 'active' })
              .eq('id', organizationId)
          }
        }
        break
      }

      default:
    }

    // Mark event as processed
    try {
      await supabase.from('webhook_events').insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      })
    } catch {
      // Non-critical — table may not exist
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
