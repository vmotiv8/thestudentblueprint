import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendOTPEmail } from '@/lib/resend'
import { validateRequest, otpSendSchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { randomInt } from 'crypto'

function generateOTP(): string {
  // Use cryptographically secure random number generation
  return randomInt(100000, 999999).toString()
}

export async function POST(request: Request) {
  // Apply strict rate limiting for OTP requests (5 per minute per IP)
  const rateLimitResponse = await applyRateLimit(request, 'strict', 'otp-send')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, otpSendSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email } = validation.data
    const supabase = createServerSupabaseClient()

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (studentError || !student) {
      // Return a generic response to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists, an OTP has been sent'
      })
    }

    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        email: email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString()
      })

    if (otpError) {
      console.error('Error creating OTP:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    const emailResult = await sendOTPEmail(email, student.full_name, otpCode)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent to your email'
    })

  } catch (error) {
    console.error('Error in OTP send:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
