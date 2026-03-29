import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const rateLimitResponse = await applyRateLimit(request, 'strict', 'partner-login')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: partner, error } = await supabase
      .from('referral_partners')
      .select('id, name, email, referral_code, status, password_hash')
      .eq('email', email.toLowerCase().trim())
      .in('status', ['active', 'invited'])
      .single()

    if (error || !partner || !partner.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, partner.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await supabase
      .from('referral_partners')
      .update({ last_login: new Date().toISOString(), status: 'active' })
      .eq('id', partner.id)

    const response = NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        referral_code: partner.referral_code,
      },
      redirectUrl: '/partner'
    })

    response.cookies.set('partner_session', partner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error) {
    console.error('Partner login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
