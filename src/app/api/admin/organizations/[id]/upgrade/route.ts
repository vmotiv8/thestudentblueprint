import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

const PLAN_LIMITS = {
  starter: { maxStudents: 100, maxAdmins: 5 },
  pro: { maxStudents: 500, maxAdmins: 15 },
  enterprise: { maxStudents: -1, maxAdmins: -1 }, // -1 means unlimited
}

/**
 * POST /api/admin/organizations/[id]/upgrade
 * Upgrade or downgrade an organization's plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify super admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, role")
      .eq("id", adminId)
      .single()

    if (adminError || !admin || (admin.role !== "super_admin" && admin.role !== "god")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { planType, maxStudents, maxAdmins, reason } = body

    if (!planType || !["starter", "pro", "enterprise"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Fetch current org
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, plan_type, max_students, max_admins")
      .eq("id", orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Get default limits for the plan or use custom if provided
    const planDefaults = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS]
    const newMaxStudents = maxStudents !== undefined ? maxStudents : planDefaults.maxStudents
    const newMaxAdmins = maxAdmins !== undefined ? maxAdmins : planDefaults.maxAdmins

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update({
        plan_type: planType,
        max_students: newMaxStudents,
        max_admins: newMaxAdmins,
      })
      .eq("id", orgId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log audit entry
    await supabase.from("audit_logs").insert({
      admin_id: admin.id,
      action: "upgrade_organization",
      entity_type: "organization",
      entity_id: orgId,
      details: {
        previous_plan: org.plan_type,
        new_plan: planType,
        previous_limits: { max_students: org.max_students, max_admins: org.max_admins },
        new_limits: { max_students: newMaxStudents, max_admins: newMaxAdmins },
        reason: reason || "Manual upgrade by super admin",
      },
    })

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: `Successfully ${org.plan_type === planType ? "updated limits for" : "upgraded to"} ${planType} plan`,
    })
  } catch (error) {
    console.error("Error upgrading organization:", error)
    return NextResponse.json({ error: "Failed to upgrade organization" }, { status: 500 })
  }
}
