import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { getOriginFromRequest } from '@/lib/url'
import { validateRequest, checkoutSchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  // Apply standard rate limiting for checkout (30 per minute per IP)
  const rateLimitResponse = await applyRateLimit(request, 'standard', 'checkout')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, checkoutSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, organization_slug, referral_code } = validation.data

    const organization = organization_slug
      ? await getOrganizationBySlug(organization_slug)
      : await getDefaultOrganization()

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // If org has free assessments, no checkout needed
    if (organization.free_assessments) {
      return NextResponse.json(
        { error: 'Assessments are free for this organization', free: true },
        { status: 400 }
      )
    }

    const assessmentPrice = Number(organization.assessment_price)
    if (!organization.assessment_price || !isFinite(assessmentPrice) || assessmentPrice <= 0) {
      return NextResponse.json(
        { error: 'Assessment pricing not configured for this organization' },
        { status: 400 }
      )
    }

    // Stripe minimum is $0.50; cap at $10,000
    if (assessmentPrice < 0.5 || assessmentPrice > 10000) {
      return NextResponse.json(
        { error: 'Assessment price is outside the allowed range ($0.50 - $10,000)' },
        { status: 400 }
      )
    }

    // Check for referral discount
    let finalPrice = assessmentPrice
    let referralPartnerId: string | null = null

    if (referral_code) {
      const supabase = createServerSupabaseClient()
      const { data: partner } = await supabase
        .from('referral_partners')
        .select(`
          id,
          referral_code,
          status,
          discount_tier:referral_discount_tiers (
            id,
            discount_percent,
            discounted_price,
            is_active
          )
        `)
        .eq('referral_code', referral_code)
        .in('status', ['active', 'invited'])
        .single()

      if (partner) {
        const tier = Array.isArray(partner.discount_tier) ? partner.discount_tier[0] : partner.discount_tier
        if (tier?.is_active && tier.discounted_price != null) {
          finalPrice = Number(tier.discounted_price)
          referralPartnerId = partner.id
        }
      }
    }

    const priceInCents = Math.round(finalPrice * 100)
    const origin = getOriginFromRequest(request)

    // Build Stripe checkout session options
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${organization.name} Student Assessment`,
              description: 'Comprehensive college readiness assessment with personalized roadmap',
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&org=${organization.slug}`,
      cancel_url: `${origin}/payment/cancel?org=${organization.slug}`,
      metadata: {
        product: 'assessment',
        organization_id: organization.id,
        organization_slug: organization.slug,
        ...(referral_code ? { referral_code } : {}),
        ...(referralPartnerId ? { referral_partner_id: referralPartnerId } : {}),
      },
    }

    // If the org has a Stripe Connect account, route payments to it
    if (organization.stripe_connect_account_id) {
      const session = await stripe.checkout.sessions.create(sessionParams, {
        stripeAccount: organization.stripe_connect_account_id,
      })
      return NextResponse.json({ url: session.url })
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
