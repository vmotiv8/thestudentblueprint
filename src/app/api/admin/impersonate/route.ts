import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * POST /api/admin/impersonate
 * Allows super admins to impersonate an agency admin for support/testing
 *
 * Request body: { organizationId: string }
 *
 * This stores the original super admin ID so they can return to their session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify the current user is a super admin
    const { data: currentAdmin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, role")
      .eq("id", adminSession)
      .eq("is_active", true)
      .single()

    if (adminError || !currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (currentAdmin.role !== "super_admin" && currentAdmin.role !== "god") {
      return NextResponse.json({ error: "Only super admins can impersonate" }, { status: 403 })
    }

    const { organizationId } = await request.json()

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Get the organization and find an agency owner/admin to impersonate
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Find the agency owner or first admin for this org
    const { data: targetAdmin, error: targetError } = await supabase
      .from("admins")
      .select("id, email, role")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .in("role", ["owner", "agency_owner", "agency_admin", "admin"])
      .order("role", { ascending: true }) // owner comes first
      .limit(1)
      .single()

    if (targetError || !targetAdmin) {
      return NextResponse.json({
        error: "No admin found for this organization. Create an admin first."
      }, { status: 404 })
    }

    // Store impersonation cookies
    const response = NextResponse.json({
      success: true,
      organization: org,
      impersonating: {
        id: targetAdmin.id,
        email: targetAdmin.email,
        role: targetAdmin.role,
      }
    })

    // Set the impersonation session
    response.cookies.set("admin_session", targetAdmin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 4, // 4 hours max for impersonation
      path: "/",
    })

    // Store original super admin ID so they can return
    response.cookies.set("impersonator_id", currentAdmin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
      path: "/",
    })

    // Log this action for audit
    await supabase.from("audit_logs").insert({
      admin_id: currentAdmin.id,
      action: "impersonate_start",
      entity_type: "organization",
      entity_id: organizationId,
      details: {
        super_admin_email: currentAdmin.email,
        target_admin_email: targetAdmin.email,
        organization_name: org.name,
      },
    })

    return response
  } catch (error) {
    console.error("Impersonation error:", error)
    return NextResponse.json({ error: "Failed to impersonate" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/impersonate
 * Ends impersonation and returns to super admin session
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const impersonatorId = cookieStore.get("impersonator_id")?.value
    const currentSession = cookieStore.get("admin_session")?.value

    if (!impersonatorId) {
      return NextResponse.json({ error: "Not currently impersonating" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verify the impersonator is still a valid super admin
    const { data: superAdmin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, role")
      .eq("id", impersonatorId)
      .single()

    if (adminError || !superAdmin) {
      // Clear cookies and redirect to login
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 })
      response.cookies.delete("admin_session")
      response.cookies.delete("impersonator_id")
      return response
    }

    if (superAdmin.role !== "super_admin" && superAdmin.role !== "god") {
      const response = NextResponse.json({ error: "Invalid impersonation state" }, { status: 403 })
      response.cookies.delete("admin_session")
      response.cookies.delete("impersonator_id")
      return response
    }

    // Log the end of impersonation
    await supabase.from("audit_logs").insert({
      admin_id: superAdmin.id,
      action: "impersonate_end",
      entity_type: "admin",
      entity_id: currentSession || "unknown",
      details: {
        super_admin_email: superAdmin.email,
      },
    })

    // Restore original super admin session
    const response = NextResponse.json({
      success: true,
      restored: {
        id: superAdmin.id,
        email: superAdmin.email,
      }
    })

    response.cookies.set("admin_session", superAdmin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.delete("impersonator_id")

    return response
  } catch (error) {
    console.error("End impersonation error:", error)
    return NextResponse.json({ error: "Failed to end impersonation" }, { status: 500 })
  }
}

/**
 * GET /api/admin/impersonate
 * Check current impersonation status
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const impersonatorId = cookieStore.get("impersonator_id")?.value

    if (!impersonatorId) {
      return NextResponse.json({ impersonating: false })
    }

    const supabase = createServerSupabaseClient()

    const { data: superAdmin } = await supabase
      .from("admins")
      .select("id, email, first_name, last_name")
      .eq("id", impersonatorId)
      .single()

    return NextResponse.json({
      impersonating: true,
      originalAdmin: superAdmin ? {
        id: superAdmin.id,
        email: superAdmin.email,
        name: `${superAdmin.first_name || ''} ${superAdmin.last_name || ''}`.trim() || superAdmin.email,
      } : null,
    })
  } catch (error) {
    console.error("Check impersonation error:", error)
    return NextResponse.json({ impersonating: false })
  }
}
