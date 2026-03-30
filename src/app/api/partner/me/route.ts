import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPartnerAuth } from '@/lib/partner-auth'

export async function GET() {
  const auth = await getPartnerAuth()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()

    // Get partner with tier
    const { data: partner } = await supabase
      .from('referral_partners')
      .select('*, discount_tier:referral_discount_tiers(*)')
      .eq('id', auth.partnerId)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Get referred students with their assessment status
    const { data: rawStudents } = await supabase
      .from('referral_students')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .order('created_at', { ascending: false })

    // Enrich with actual assessment data (completion status, assessment ID for results link)
    const students = await Promise.all((rawStudents || []).map(async (rs) => {
      if (!rs.student_email) return rs

      // Find the student and their latest assessment
      const { data: studentRecord } = await supabase
        .from('students')
        .select(`
          id,
          assessments (
            id,
            status,
            student_archetype,
            competitiveness_score,
            completed_at
          )
        `)
        .eq('email', rs.student_email)
        .maybeSingle()

      const assessments = (studentRecord?.assessments || []) as { id: string; status: string; student_archetype: string | null; competitiveness_score: number | null; completed_at: string | null }[]
      const latestAssessment = assessments.sort((a, b) =>
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
      )[0]

      return {
        ...rs,
        assessment_id: latestAssessment?.id || null,
        assessment_status: latestAssessment?.status || 'not_started',
        student_archetype: latestAssessment?.student_archetype || null,
        competitiveness_score: latestAssessment?.competitiveness_score || null,
        completed_at: latestAssessment?.completed_at || null,
      }
    }))

    // Get commissions
    const { data: commissions } = await supabase
      .from('referral_commissions')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .order('created_at', { ascending: false })

    // Get payment info
    const { data: paymentInfo } = await supabase
      .from('referral_payment_info')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .single()

    // Compute stats
    const totalEarned = (commissions || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0)
    const unpaidBalance = (commissions || []).filter(c => !c.paid_out).reduce((sum, c) => sum + (c.commission_amount || 0), 0)
    const totalPaidOut = totalEarned - unpaidBalance

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        referral_code: partner.referral_code,
        status: partner.status,
        discount_tier: Array.isArray(partner.discount_tier) ? partner.discount_tier[0] : partner.discount_tier,
      },
      stats: {
        totalStudents: (students || []).length,
        completedStudents: (students || []).filter(s => s.completed).length,
        totalEarned: Math.round(totalEarned * 100) / 100,
        unpaidBalance: Math.round(unpaidBalance * 100) / 100,
        totalPaidOut: Math.round(totalPaidOut * 100) / 100,
      },
      students: students || [],
      commissions: commissions || [],
      paymentInfo: paymentInfo || null,
    })
  } catch (error) {
    console.error('[Partner/Me] Error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
