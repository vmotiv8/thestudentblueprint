import { NextResponse } from 'next/server'
import { requireAdminContext } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    await supabase
      .from('coupons')
      .update({ is_active: false })
      .lt('valid_until', new Date().toISOString())
      .eq('is_active', true)
      .eq('organization_id', context.organization.id)

    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    const { data: coupons, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ coupons }, {
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

    const { code, discount_type, discount_value, max_uses, valid_until } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        organization_id: context.organization.id,
        code: code.toUpperCase().trim(),
        discount_type: discount_type || 'free',
        discount_value: discount_value || 0,
        max_uses: max_uses || null,
        valid_until: valid_until || null,
        is_active: true
      })
      .select()
      .single()

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
