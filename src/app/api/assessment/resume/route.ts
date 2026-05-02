import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { validateRequest, assessmentResumeSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const validation = await validateRequest(request, assessmentResumeSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, code } = validation.data
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('students')
      .select(`
        id,
        full_name,
        email,
        unique_code,
        assessments (
          id,
          created_at,
          status,
          current_section,
          is_completed,
          payment_status,
          coupon_code,
          coupon_code_used,
          responses,
          basic_info,
          academic_profile,
          testing_info,
          extracurriculars,
          leadership,
          competitions,
          passions,
          career_aspirations,
          research_experience,
          summer_programs,
          special_talents,
          family_context,
          personality,
          personal_stories,
          time_commitment
        )
      `)

    // Schema ensures at least one of email/code is provided
    if (code) {
      query = query.eq('unique_code', code.toUpperCase())
    } else if (email) {
      query = query.eq('email', email.toLowerCase())
    }

    const { data: student, error } = await query.single()

    if (error || !student) {
      return NextResponse.json(
        { error: 'No assessment found with the provided details' },
        { status: 404 }
      )
    }

    const assessments = ((student.assessments as unknown[]) || []).sort((a: any, b: any) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )
    // Prefer in-progress/partial assessment, then most recent
    const assessment = (
      assessments.find((a: unknown) => {
        const s = (a as Record<string, unknown>).status
        return s === 'in_progress' || s === 'partial'
      }) ||
      assessments[assessments.length - 1]
    ) as Record<string, unknown> | undefined

    if (!assessment) {
      return NextResponse.json(
        { error: 'No assessment found' },
        { status: 404 }
      )
    }

    let hasPaid = false
    if (assessment.payment_status === 'paid' || assessment.payment_status === 'free' || assessment.coupon_code || assessment.coupon_code_used) {
      hasPaid = true
    } else {
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('email', student.email.toLowerCase())
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle()
      
      if (payment) {
        hasPaid = true
      }
    }

    return NextResponse.json({ 
      success: true,
      student: {
        fullName: student.full_name,
        email: student.email,
        uniqueCode: student.unique_code
      },
      assessment,
      hasPaid
    })

  } catch (error) {
    console.error('Error resuming assessment:', error)
    return NextResponse.json(
      { error: 'Failed to resume assessment' },
      { status: 500 }
    )
  }
}
