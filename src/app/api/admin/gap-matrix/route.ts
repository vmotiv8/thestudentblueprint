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

    let query = supabase
      .from("assessments")
      .select(`
        id,
        status,
        competitiveness_score,
        basic_info,
        academic_profile,
        testing_info,
        leadership,
        research_experience,
        gap_analysis,
        students (
          id,
          full_name,
          email,
          current_grade
        )
      `)
      .order("created_at", { ascending: false })
      .or('is_demo.is.null,is_demo.eq.false')

    if (!auth.isSuperAdmin) {
      query = query.eq("organization_id", auth.organizationId)
    }

    const { data: assessments, error } = await query

    if (error) {
      console.error("Gap matrix fetch error:", error)
      throw error
    }

    const gapMatrix = assessments?.map((a: Record<string, unknown>) => {
      const student = a.students as { id: string; full_name: string; email: string; current_grade: string } | null
      const email = a.basic_info && typeof a.basic_info === 'object' && 'email' in a.basic_info
        ? (a.basic_info as { email: string }).email
        : student?.email || ''
      
      const gpa = a.academic_profile && typeof a.academic_profile === 'object' && 'weightedGPA' in a.academic_profile
        ? (a.academic_profile as { weightedGPA: string }).weightedGPA
        : null

      const testScores = a.testing_info && typeof a.testing_info === 'object'
        ? a.testing_info as { satScore?: string; actScore?: string }
        : {}

      const hasLeadership = a.leadership && typeof a.leadership === 'object' && 'positions' in a.leadership
        ? Array.isArray((a.leadership as { positions: unknown[] }).positions) && (a.leadership as { positions: unknown[] }).positions.length > 0
        : false

      const hasResearch = a.research_experience && typeof a.research_experience === 'object' && 'hasResearch' in a.research_experience
        ? (a.research_experience as { hasResearch: boolean }).hasResearch
        : false

      const gapAnalysis = a.gap_analysis && typeof a.gap_analysis === 'object' && 'missingElements' in a.gap_analysis
        ? (a.gap_analysis as { missingElements: string[] }).missingElements || []
        : []

      const missingElements = []
      if (!hasLeadership) missingElements.push('Leadership')
      if (!hasResearch) missingElements.push('Research')
      if (!testScores.satScore && !testScores.actScore) missingElements.push('Test Scores')
      if (gapAnalysis.length > 0) missingElements.push(...gapAnalysis.slice(0, 3))

      const recommendedServices = []
      if (!hasLeadership) recommendedServices.push('Leadership Development')
      if (!hasResearch) recommendedServices.push('Research Mentorship')
      if (!testScores.satScore && !testScores.actScore) recommendedServices.push('SAT/ACT Prep')
      if (a.competitiveness_score && Number(a.competitiveness_score) < 70) recommendedServices.push('Profile Building')
      if (gapAnalysis.some((g: string) => g.toLowerCase().includes('essay'))) recommendedServices.push('Essay Coaching')

      return {
        id: a.id,
        name: student?.full_name || 'Unknown',
        email,
        grade: student?.current_grade || 'Unknown',
        gpa: gpa || '—',
        testScores: testScores.satScore || testScores.actScore || '—',
        competitivenessScore: a.competitiveness_score || 0,
        missingElements: [...new Set(missingElements)],
        recommendedServices: [...new Set(recommendedServices)],
        isCompleted: a.status === 'completed',
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      gapMatrix: gapMatrix.filter(s => s.missingElements.length > 0)
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error("Error fetching gap matrix:", error)
    return NextResponse.json({ error: "Failed to fetch gap matrix" }, { status: 500 })
  }
}
