import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { getOriginFromRequest } from '@/lib/url'
import { validateRequest, checkoutSchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { createServerSupabaseClient } from '@/lib/supabase'

function getDiscountedPrice(basePrice: number, discountType: string, discountValue: number) {
  if (discountType === 'free') return 0
  if (discountType === 'percentage') {
    return Math.max(0, basePrice * (1 - discountValue / 100))
  }
  if (discountType === 'fixed') {
    return Math.max(0, basePrice - discountValue)
  }
  return basePrice
}

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

    const { email, organization_slug, referral_code, coupon_code } = validation.data

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

    const supabase = createServerSupabaseClient()

    // Check for referral discount
    let finalPrice = assessmentPrice
    let referralPartnerId: string | null = null
    let appliedCouponCode: string | null = null

    if (referral_code) {
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

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, max_uses, current_uses, valid_until')
        .eq('code', coupon_code)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .maybeSingle()

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }

      const couponPrice = getDiscountedPrice(
        assessmentPrice,
        coupon.discount_type,
        Number(coupon.discount_value || 0)
      )

      if (couponPrice <= 0) {
        return NextResponse.json({
          free: true,
          coupon: coupon.code,
          error: 'This coupon makes the assessment free. Continue through the coupon flow instead of payment.',
        })
      }

      finalPrice = Math.min(finalPrice, couponPrice)
      appliedCouponCode = coupon.code
    }

    if (finalPrice < 0.5 || finalPrice > 10000) {
      return NextResponse.json(
        { error: 'Discounted assessment price is outside the allowed range ($0.50 - $10,000)' },
        { status: 400 }
      )
    }

    const priceInCents = Math.round(finalPrice * 100)
    const origin = getOriginFromRequest(request)
    const successUrl = new URL(`${origin}/payment/success`)
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
    successUrl.searchParams.set('org', organization.slug)
    if (appliedCouponCode) successUrl.searchParams.set('coupon', appliedCouponCode)

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
      success_url: successUrl.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}'),
      cancel_url: `${origin}/payment/cancel?org=${organization.slug}`,
      metadata: {
        product: 'assessment',
        organization_id: organization.id,
        organization_slug: organization.slug,
        ...(referral_code ? { referral_code } : {}),
        ...(referralPartnerId ? { referral_partner_id: referralPartnerId } : {}),
        ...(appliedCouponCode ? { coupon_code: appliedCouponCode } : {}),
        original_price: assessmentPrice.toFixed(2),
        final_price: finalPrice.toFixed(2),
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
