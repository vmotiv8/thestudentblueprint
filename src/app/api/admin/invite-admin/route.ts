import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendAdminInviteEmail } from '@/lib/resend'
import { validateRequest, inviteAdminSchema } from '@/lib/validations'
import { getAdminAuth } from '@/lib/admin-auth'
import { canAddAdmin } from '@/lib/plan-enforcement'

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'god' && auth.role !== 'super_admin' && auth.role !== 'agency_owner' && auth.role !== 'owner') {
      return NextResponse.json({ error: 'Insufficient permissions to invite other admins' }, { status: 403 })
    }

    const validation = await validateRequest(request, inviteAdminSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, fullName, role } = validation.data
    const supabase = createServerSupabaseClient()

    // Plan limit enforcement (skip for super admins)
    if (!auth.isSuperAdmin && auth.organizationId) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, subscription_status, trial_ends_at, billing_type, max_admins')
        .eq('id', auth.organizationId)
        .single()

      if (orgData) {
        const limitCheck = await canAddAdmin(orgData)
        if (!limitCheck.allowed) {
          return NextResponse.json({ error: limitCheck.reason }, { status: 403 })
        }
      }
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 })
    }

    // Generate a cryptographically secure temporary password
    const tempPassword = randomBytes(12).toString('base64url').slice(0, 12)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    // Create the new admin under the same organization
    const displayName = fullName || email.split('@')[0]
    const nameParts = displayName.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    const { data: newAdmin, error: createError } = await supabase
      .from('admins')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        role,
        organization_id: auth.organizationId,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating admin:', createError)
      return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
    }

    // Send invitation email with credentials
    try {
      await sendAdminInviteEmail(email, role, tempPassword, auth.adminEmail)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: `Admin invitation sent to ${email}`,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    })
  } catch (error) {
    console.error('Error inviting admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
