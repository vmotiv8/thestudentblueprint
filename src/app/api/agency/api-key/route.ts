import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { randomBytes } from "crypto"

export async function POST() {
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

    // Only allow agency_admin or super_admin to generate API keys
    if (admin.role !== "agency_admin" && admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Generate a secure API key
    const apiKey = `sb_live_${randomBytes(24).toString('hex')}`

    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update({ api_key: apiKey })
      .eq("id", admin.organization_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, api_key: apiKey })
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
