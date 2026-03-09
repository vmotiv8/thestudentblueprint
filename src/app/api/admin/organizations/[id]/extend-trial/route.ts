import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * POST /api/admin/organizations/[id]/extend-trial
 * Extend an organization's trial period
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
    const { days, reason } = body

    if (!days || typeof days !== "number" || days < 1 || days > 365) {
      return NextResponse.json({ error: "Days must be between 1 and 365" }, { status: 400 })
    }

    // Fetch current org
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, trial_ends_at, subscription_status")
      .eq("id", orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Calculate new trial end date
    const currentTrialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : new Date()
    const baseDate = currentTrialEnd > new Date() ? currentTrialEnd : new Date()
    const newTrialEnd = new Date(baseDate)
    newTrialEnd.setDate(newTrialEnd.getDate() + days)

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update({
        trial_ends_at: newTrialEnd.toISOString(),
        subscription_status: "trial",
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
      action: "extend_trial",
      entity_type: "organization",
      entity_id: orgId,
      details: {
        previous_trial_ends_at: org.trial_ends_at,
        new_trial_ends_at: newTrialEnd.toISOString(),
        days_extended: days,
        reason: reason || "Manual trial extension by super admin",
      },
    })

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: `Trial extended by ${days} days. New end date: ${newTrialEnd.toLocaleDateString()}`,
    })
  } catch (error) {
    console.error("Error extending trial:", error)
    return NextResponse.json({ error: "Failed to extend trial" }, { status: 500 })
  }
}
