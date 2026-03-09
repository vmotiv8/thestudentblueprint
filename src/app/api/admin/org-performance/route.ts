import { NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminAuth } from "@/lib/admin-auth"

export async function GET() {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const [assessmentsRes, couponsRes] = await Promise.all([
      supabase
        .from("assessments")
        .select(`
          id,
          is_completed,
          competitiveness_score,
          coupon_code_used,
          payment_status,
          created_at
        `)
        .or('is_demo.is.null,is_demo.eq.false'),
      supabase
        .from("coupons")
        .select("*")
        .order("current_uses", { ascending: false })
    ])

    if (assessmentsRes.error) throw assessmentsRes.error
    if (couponsRes.error) throw couponsRes.error

    const assessments = assessmentsRes.data || []
    const coupons = couponsRes.data || []

    const orgPerformance = coupons.map((coupon) => {
      const couponAssessments = assessments.filter(
        (a) => a.coupon_code_used === coupon.code
      )

      const completedCount = couponAssessments.filter((a) => a.is_completed).length
      const avgScore = couponAssessments.filter((a) => a.competitiveness_score).length > 0
        ? Math.round(
            couponAssessments
              .filter((a) => a.competitiveness_score)
              .reduce((sum, a) => sum + (a.competitiveness_score || 0), 0) /
              couponAssessments.filter((a) => a.competitiveness_score).length
          )
        : 0

      const completionRate = couponAssessments.length > 0
        ? Math.round((completedCount / couponAssessments.length) * 100)
        : 0

      const revenueGenerated = coupon.discount_type === 'free' 
        ? 0 
        : coupon.discount_type === 'percentage'
        ? (499 * (100 - coupon.discount_value) / 100) * coupon.current_uses
        : (499 - coupon.discount_value) * coupon.current_uses

      return {
        id: coupon.id,
        organization: coupon.organization || 'Unknown',
        couponCode: coupon.code,
        studentsEnrolled: coupon.current_uses,
        completedCount,
        completionRate,
        avgCompetitivenessScore: avgScore,
        revenueGenerated: Math.round(revenueGenerated),
        isActive: coupon.is_active,
        createdAt: coupon.created_at,
      }
    })

    const totalRevenue = orgPerformance.reduce((sum, org) => sum + org.revenueGenerated, 0)
    const paidAssessments = assessments.filter((a) => a.payment_status === 'completed' || a.payment_status === 'paid').length
    const totalPaidRevenue = paidAssessments * 499

    return NextResponse.json({ 
      success: true, 
      orgPerformance: orgPerformance.sort((a, b) => b.studentsEnrolled - a.studentsEnrolled),
      totalRevenue: totalRevenue + totalPaidRevenue,
      totalCouponRevenue: totalRevenue,
      totalPaidRevenue,
    })
  } catch (error) {
    console.error("Error fetching org performance:", error)
    return NextResponse.json({ error: "Failed to fetch org performance" }, { status: 500 })
  }
}
