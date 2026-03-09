import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminAuth } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('id', auth.adminId)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', auth.adminId)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Invalidate the current session — force re-login with new password
    const cookieStore = await cookies()
    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully. Please log in again.' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
