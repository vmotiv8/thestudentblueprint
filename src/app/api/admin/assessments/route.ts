import { NextResponse } from 'next/server'
import { requireAdminContext } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    let query = supabase
      .from('assessments')
      .select(`
        id,
        organization_id,
        student_id,
        status,
        payment_status,
        payment_intent_id,
        coupon_code,
        amount_paid,
        started_at,
        completed_at,
        expires_at,
        responses,
        scores,
        report_data,
        created_at,
        updated_at,
        student:students (
          id,
          email,
          first_name,
          last_name,
          phone,
          grade_level,
          school_name,
          parent_email,
          parent_phone,
          metadata,
          created_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    // Exclude demo assessments from dashboard listings
    query = query.or('is_demo.is.null,is_demo.eq.false')

    const { data: assessments, error, count } = await query

    if (error) {
      throw error
    }

    const total = count ?? 0
    return NextResponse.json({ assessments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching assessments:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}
