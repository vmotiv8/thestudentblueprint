import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, first_name, last_name, role, organization_id, organization:organizations(*)')
      .eq('id', adminId)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        fullName: [admin.first_name, admin.last_name].filter(Boolean).join(' ') || null,
        role: admin.role,
        organization_id: admin.organization_id,
        organization: admin.organization,
        isSuperAdmin: admin.role === 'super_admin'
      }
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
