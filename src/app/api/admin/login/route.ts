import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { validateRequest, loginSchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Apply strict rate limiting for login attempts (5 per minute per IP)
  const rateLimitResponse = await applyRateLimit(request, 'strict', 'admin-login')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, loginSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data
    const supabase = createServerSupabaseClient()

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*, organization:organizations(*)')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    const redirectUrl = admin.role === 'super_admin' ? '/admin' : '/agency'
    
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        organization_id: admin.organization_id,
        organization: admin.organization,
        isSuperAdmin: admin.role === 'super_admin'
      },
      redirectUrl
    })

    response.cookies.set('admin_session', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
