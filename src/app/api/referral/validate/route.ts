import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { applyRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const rateLimitResponse = await applyRateLimit(request, 'standard', 'referral-validate')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase().trim()

    if (!code || code.length < 4 || code.length > 10) {
      return NextResponse.json({ valid: false })
    }

    const supabase = createServerSupabaseClient()

    const { data: partner } = await supabase
      .from('referral_partners')
      .select(`
        id,
        name,
        referral_code,
        status,
        discount_tier_id,
        discount_tier:referral_discount_tiers (
          id,
          label,
          discount_percent,
          discounted_price,
          is_active
        )
      `)
      .eq('referral_code', code)
      .in('status', ['active', 'invited'])
      .single()

    if (!partner) {
      return NextResponse.json({ valid: false })
    }

    const tier = Array.isArray(partner.discount_tier) ? partner.discount_tier[0] : partner.discount_tier

    return NextResponse.json({
      valid: true,
      partner_name: partner.name,
      partner_id: partner.id,
      referral_code: partner.referral_code,
      discount_percent: tier?.is_active ? tier.discount_percent : 0,
      discounted_price: tier?.is_active ? tier.discounted_price : null,
      tier_label: tier?.is_active ? tier.label : null,
    })
  } catch (error) {
    console.error('[Referral Validate] Error:', error)
    return NextResponse.json({ valid: false })
  }
}
