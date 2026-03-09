import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { validateRequest, otpVerifySchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Apply strict rate limiting for OTP verification (5 per minute per IP)
  const rateLimitResponse = applyRateLimit(request, 'strict', 'otp-verify')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, otpVerifySchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, otp } = validation.data
    const supabase = createServerSupabaseClient()

    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('is_used', false)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    const expiresAt = new Date(otpRecord.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      )
    }

    await supabase
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id)

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        email,
        unique_code,
        assessments (
          id,
          current_section,
          is_completed,
          payment_status,
          coupon_code_used,
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
      .eq('email', email)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const assessment = (student.assessments as unknown[])?.[0] as Record<string, unknown> | undefined
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'No assessment found' },
        { status: 404 }
      )
    }

    let hasPaid = false
    if (assessment.payment_status === 'paid' || assessment.coupon_code_used) {
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
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
