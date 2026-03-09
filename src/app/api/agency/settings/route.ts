import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("organization_id")
      .eq("id", adminId)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", admin.organization_id)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Compute real student count instead of trusting the stored counter
    const { count } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", admin.organization_id)

    return NextResponse.json({ organization: { ...org, current_students_count: count ?? org.current_students_count } })
  } catch (error) {
    console.error("Error fetching agency settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("organization_id, role")
      .eq("id", adminId)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow agency owners/admins to update settings
    const allowedRoles = ["agency_admin", "agency_owner", "owner", "admin", "super_admin", "god"]
    if (!allowedRoles.includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    // Whitelist allowed fields to update
    const allowedFields = [
      "name",
      "logo_url",
      "primary_color",
      "secondary_color",
      "billing_email",
      "custom_email_from",
      "custom_email_reply_to",
      "remove_branding",
      "webhook_url",
      "domain",
      "enabled_sections",
      "onboarding_completed",
      "assessment_price"
    ]

    const updates: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // Validate assessment_price if provided
    if (updates.assessment_price !== undefined) {
      const price = Number(updates.assessment_price)
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Assessment price must be a positive number" }, { status: 400 })
      }
      updates.assessment_price = price
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", admin.organization_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, organization: updatedOrg })
  } catch (error) {
    console.error("Error updating agency settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
