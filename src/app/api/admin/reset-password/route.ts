import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/resend'
import { buildUrl } from '@/lib/url'
import { applyRateLimit } from '@/lib/rate-limit'
import { validateRequest, emailSchema } from '@/lib/validations'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: emailSchema,
})

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, 'strict', 'reset-password')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, resetPasswordSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email } = validation.data
    const supabase = createServerSupabaseClient()

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, is_active')
      .eq('email', email)
      .single()

    if (error || !admin || !admin.is_active) {
      return successResponse
    }

    // Generate a secure reset token and set expiry to 1 hour
    const token = randomBytes(32).toString('base64url')
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_setup_token: token,
        password_setup_expires: expires,
      })
      .eq('id', admin.id)

    if (updateError) {
      console.error('Failed to store reset token:', updateError)
      return successResponse
    }

    const resetUrl = buildUrl(`/admin/setup-password?token=${token}`)
    await sendPasswordResetEmail(admin.email, resetUrl)

    return successResponse
  } catch (error) {
    console.error('Error in password reset:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
