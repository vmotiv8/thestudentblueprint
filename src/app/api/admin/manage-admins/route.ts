import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminAuth } from "@/lib/admin-auth"
import { canAddAdmin } from '@/lib/plan-enforcement'
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendAdminInviteEmail } from "@/lib/resend"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("admins")
      .select("id, email, first_name, last_name, role, is_active, created_at, organization_id")
      .order("created_at", { ascending: false })

    // Filter by organization if not super admin
    if (!auth.isSuperAdmin) {
      query = query.eq("organization_id", auth.organizationId)
    }

    const { data: admins, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, admins })
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch admins" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only super admins or agency admins with same org can create
    const { email, first_name, last_name, role, organization_id } = await request.json()

    const targetOrgId = auth.isSuperAdmin ? organization_id : auth.organizationId

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Plan limit enforcement (skip for super admins)
    if (!auth.isSuperAdmin && targetOrgId) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, subscription_status, trial_ends_at, billing_type, max_admins')
        .eq('id', targetOrgId)
        .single()

      if (orgData) {
        const limitCheck = await canAddAdmin(orgData)
        if (!limitCheck.allowed) {
          return NextResponse.json({ error: limitCheck.reason }, { status: 403 })
        }
      }
    }

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      )
    }

    const tempPassword = randomBytes(16).toString('base64url')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const { data: newAdmin, error: insertError } = await supabase
      .from("admins")
      .insert({
        email: email.toLowerCase().trim(),
        first_name: first_name || null,
        last_name: last_name || null,
        password_hash: hashedPassword,
        role: role,
        organization_id: targetOrgId,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Send invitation email
    try {
      await sendAdminInviteEmail(email, role, tempPassword, auth.adminEmail)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json({
      success: true,
      admin: newAdmin,
    })
  } catch (error) {
    console.error("Error inviting admin:", error)
    return NextResponse.json(
      { success: false, error: "Failed to invite admin" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("id")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    if (adminId === auth.adminId) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Check permissions
    if (!auth.isSuperAdmin) {
      const { data: targetAdmin } = await supabase
        .from("admins")
        .select("organization_id")
        .eq("id", adminId)
        .single()
      
      if (!targetAdmin || targetAdmin.organization_id !== auth.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const { error: deleteError } = await supabase
      .from("admins")
      .delete()
      .eq("id", adminId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing admin:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove admin" },
      { status: 500 }
    )
  }
}
