import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminAuth } from '@/lib/admin-auth'

export async function GET(request: Request) {
  const auth = await getAdminAuth()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partner_id')

    if (!partnerId) {
      return NextResponse.json({ error: 'partner_id is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: commissions, error } = await supabase
      .from('referral_commissions')
      .select(`
        *,
        referral_student:referral_students (
          student_email,
          student_name,
          payment_status,
          sale_amount,
          created_at
        )
      `)
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ commissions: commissions || [] })
  } catch (error) {
    console.error('[Admin/Commissions] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized — super admin required' }, { status: 403 })
  }

  try {
    const { partner_id } = await request.json()

    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get all unpaid commissions for this partner
    const { data: unpaid } = await supabase
      .from('referral_commissions')
      .select('id, commission_amount')
      .eq('partner_id', partner_id)
      .eq('paid_out', false)

    if (!unpaid || unpaid.length === 0) {
      return NextResponse.json({ error: 'No unpaid commissions found' }, { status: 400 })
    }

    const totalAmount = unpaid.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
    const commissionIds = unpaid.map(c => c.id)

    // Mark all as paid
    const { error: updateError } = await supabase
      .from('referral_commissions')
      .update({
        paid_out: true,
        paid_out_at: new Date().toISOString(),
        paid_out_by: auth.adminId,
      })
      .in('id', commissionIds)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      cleared_count: commissionIds.length,
      cleared_amount: Math.round(totalAmount * 100) / 100,
    })
  } catch (error) {
    console.error('[Admin/Commissions] PATCH Error:', error)
    return NextResponse.json({ error: 'Failed to clear commissions' }, { status: 500 })
  }
}
