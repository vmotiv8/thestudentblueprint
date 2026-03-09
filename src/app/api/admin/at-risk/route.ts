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
        organization_id,
        current_section,
        is_completed,
        competitiveness_score,
        created_at,
        updated_at,
        basic_info,
        gap_analysis,
        students (
          id,
          full_name,
          email,
          current_grade
        )
      `)
      .eq("is_completed", false)
      .or('is_demo.is.null,is_demo.eq.false')

    // Filter by organization if not super admin
    if (!auth.isSuperAdmin) {
      query = query.eq("organization_id", auth.organizationId)
    }

    const { data: assessments, error } = await query
      .order("updated_at", { ascending: true })

    if (error) {
      console.error("At-risk fetch error:", error)
      throw error
    }

    const now = new Date()

    const atRiskStudents = (assessments || [])
      .filter((a) => {
        if (!a.updated_at) return false
        const updatedAt = new Date(a.updated_at)
        if (isNaN(updatedAt.getTime())) return false
        
        const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000))
        
        return daysStuck >= 3 || (a.competitiveness_score !== null && a.competitiveness_score !== undefined && a.competitiveness_score < 60)
      })
      .map((a) => {
        const updatedAt = new Date(a.updated_at!)
        const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000))
        
        const studentData = Array.isArray(a.students) ? a.students[0] : a.students
        
        const email = a.basic_info && typeof a.basic_info === 'object' && 'email' in a.basic_info 
          ? (a.basic_info as { email: string }).email 
          : studentData?.email || ''
        
        const gapAnalysis = a.gap_analysis && typeof a.gap_analysis === 'object' && 'missingElements' in a.gap_analysis
          ? (a.gap_analysis as { missingElements: string[] }).missingElements || []
          : []

        const risks = []
        if (daysStuck >= 3) risks.push(`Stuck on section ${a.current_section} for ${daysStuck} days`)
        if (a.competitiveness_score !== null && a.competitiveness_score !== undefined && a.competitiveness_score < 60) risks.push(`Low score: ${a.competitiveness_score}`)
        if (gapAnalysis.length > 3) risks.push(`${gapAnalysis.length} major gaps`)

        return {
          id: a.id,
          name: studentData?.full_name || 'Unknown',
          email,
          grade: studentData?.current_grade || 'Unknown',
          currentSection: a.current_section,
          daysStuck,
          competitivenessScore: a.competitiveness_score,
          majorGaps: gapAnalysis.length,
          risks,
          lastUpdated: a.updated_at,
        }
      })

    return NextResponse.json({ 
      success: true, 
      atRiskStudents: atRiskStudents.sort((a, b) => b.daysStuck - a.daysStuck)
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error("Error fetching at-risk students:", error)
    return NextResponse.json({ error: "Failed to fetch at-risk students" }, { status: 500 })
  }
}
