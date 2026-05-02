import { NextResponse } from 'next/server'
import { requireAdminContext } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'

const ALLOWED_DISCOUNT_TYPES = ['percentage', 'fixed', 'free'] as const
type CouponRow = Record<string, unknown> & {
  organization?: string | { name?: string | null; slug?: string | null } | null
}

function normalizeCouponCode(code: unknown) {
  return typeof code === 'string' ? code.trim().toUpperCase() : ''
}

function normalizeValidUntil(validUntil: unknown) {
  if (typeof validUntil !== 'string' || !validUntil.trim()) return null
  const value = validUntil.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59.999Z` : value
}

function isMissingOptionalCouponColumn(error: { message?: string; code?: string } | null) {
  return Boolean(
    error &&
      (error.code === 'PGRST204' ||
        error.message?.includes('description') ||
        error.message?.includes('notes') ||
        error.message?.includes('schema cache'))
  )
}

export async function GET(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    let expireQuery = supabase
      .from('coupons')
      .update({ is_active: false })
      .lt('valid_until', new Date().toISOString())
      .eq('is_active', true)

    if (!context.isSuperAdmin) {
      expireQuery = expireQuery.eq('organization_id', context.organization.id)
    }

    await expireQuery

    let query = supabase
      .from('coupons')
      .select('*, organization:organizations(name, slug)')
      .order('created_at', { ascending: false })

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    const { data: coupons, error } = await query

    if (error) {
      throw error
    }

    const normalizedCoupons = ((coupons || []) as CouponRow[]).map((coupon) => {
      const organization = coupon.organization
      return {
        ...coupon,
        organization: typeof organization === 'string'
          ? organization
          : organization?.name || context.organization.name,
        organization_slug: typeof organization === 'object' ? organization?.slug : undefined,
      }
    })

    return NextResponse.json({ coupons: normalizedCoupons }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    const {
      code,
      discount_type,
      discount_value,
      max_uses,
      valid_until,
      description,
      notes,
    } = await request.json()
    const normalizedCode = normalizeCouponCode(code)

    if (!normalizedCode) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const resolvedDiscountType = (discount_type || 'free') as string
    if (!ALLOWED_DISCOUNT_TYPES.includes(resolvedDiscountType as typeof ALLOWED_DISCOUNT_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid discount_type "${resolvedDiscountType}". Must be one of: ${ALLOWED_DISCOUNT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const numericDiscountValue = resolvedDiscountType === 'free'
      ? 100
      : Number(discount_value)
    if (!Number.isFinite(numericDiscountValue) || numericDiscountValue < 0) {
      return NextResponse.json(
        { error: 'Discount value must be a valid non-negative number' },
        { status: 400 }
      )
    }
    if (resolvedDiscountType === 'percentage' && numericDiscountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discounts cannot exceed 100%' },
        { status: 400 }
      )
    }

    const normalizedMaxUses = max_uses === null || max_uses === undefined || max_uses === ''
      ? null
      : Number(max_uses)
    if (normalizedMaxUses !== null && (!Number.isInteger(normalizedMaxUses) || normalizedMaxUses < 1)) {
      return NextResponse.json(
        { error: 'Max uses must be a positive whole number' },
        { status: 400 }
      )
    }

    const normalizedValidUntil = normalizeValidUntil(valid_until)
    if (normalizedValidUntil && Number.isNaN(new Date(normalizedValidUntil).getTime())) {
      return NextResponse.json(
        { error: 'Expiration date is invalid' },
        { status: 400 }
      )
    }

    const insertPayload = {
      organization_id: context.organization.id,
      code: normalizedCode,
      discount_type: resolvedDiscountType,
      discount_value: numericDiscountValue,
      max_uses: normalizedMaxUses,
      valid_until: normalizedValidUntil,
      is_active: true,
      ...(typeof description === 'string' && description.trim() ? { description: description.trim() } : {}),
      ...(typeof notes === 'string' && notes.trim() ? { notes: notes.trim() } : {}),
    }

    let { data: coupon, error } = await supabase
      .from('coupons')
      .insert(insertPayload)
      .select()
      .single()

    if (isMissingOptionalCouponColumn(error)) {
      const fallbackPayload = { ...insertPayload }
      delete fallbackPayload.description
      delete fallbackPayload.notes
      const fallback = await supabase
        .from('coupons')
        .insert(fallbackPayload)
        .select()
        .single()
      coupon = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error("Coupon creation error:", error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists for this organization' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, coupon })
  } catch (error) {
    console.error('Error creating coupon:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    let query = supabase.from('coupons').delete().eq('id', id)

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    const { error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { id, is_active } = await request.json()

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Coupon ID and status are required' }, { status: 400 })
    }

    let query = supabase
      .from('coupons')
      .update({ is_active })
      .eq('id', id)

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    const { error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating coupon:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}
