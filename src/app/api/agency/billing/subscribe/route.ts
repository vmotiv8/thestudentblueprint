import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOriginFromRequest } from '@/lib/url'
import { getAdminAuth } from '@/lib/admin-auth'

const PLAN_PRICES: Record<string, { price: number; students: number; admins: number }> = {
  starter: { price: 9900, students: 100, admins: 5 },
  pro: { price: 29900, students: 500, admins: 15 },
  enterprise: { price: 99900, students: -1, admins: -1 },
}

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { organization_id, plan_type, billing_email } = await request.json()

    if (!organization_id || !plan_type) {
      return NextResponse.json(
        { error: 'organization_id and plan_type are required' },
        { status: 400 }
      )
    }

    // Ensure the admin belongs to the requested organization (unless super admin)
    if (!auth.isSuperAdmin && auth.organizationId !== organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const plan = PLAN_PRICES[plan_type]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be starter, pro, or enterprise' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, billing_email, stripe_customer_id, plan_price, billing_type')
      .eq('id', organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (organization.billing_type === 'one_time') {
      return NextResponse.json(
        { error: 'One-time license organizations cannot use subscription checkout. Please contact your account manager.' },
        { status: 403 }
      )
    }

    let customerId = organization.stripe_customer_id
    const customerEmail = billing_email || organization.billing_email

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: organization.name,
        metadata: { organization_id },
      })
      customerId = customer.id

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organization_id)
    }

    const origin = getOriginFromRequest(request)

    // Use org's custom plan_price if set, otherwise fall back to default plan price
    const unitAmount = organization.plan_price
      ? Math.round(organization.plan_price * 100)
      : plan.price

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Agency ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)} Plan`,
              description: plan.students === -1
                ? 'Unlimited students & admins, white-labeling features'
                : `Up to ${plan.students} students, ${plan.admins} admins`,
            },
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      client_reference_id: organization_id,
      subscription_data: {
        metadata: {
          organization_id,
          plan_type,
          max_students: plan.students.toString(),
          max_admins: plan.admins.toString(),
        },
      },
      success_url: `${origin}/agency/settings?tab=billing&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/agency/settings?tab=billing&status=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
