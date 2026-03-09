import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getAdminAuth } from "@/lib/admin-auth"

export async function GET() {
  try {
    const auth = await getAdminAuth()

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: org, error } = await supabase
      .from("organizations")
      .select("settings, name, slug, primary_color, secondary_color, assessment_price, remove_branding, custom_email_from, custom_email_reply_to")
      .eq("id", auth.organizationId)
      .single()

    if (error) throw error

    return NextResponse.json({ settings: org })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdminAuth()

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!auth.isSuperAdmin) {
      return NextResponse.json({ error: "Only super admins can modify platform settings" }, { status: 403 })
    }

    const body = await request.json()

    // Only allow updating specific safe fields
    const allowedFields = [
      "settings", "name", "primary_color", "secondary_color",
      "assessment_price", "remove_branding", "custom_email_from",
      "custom_email_reply_to"
    ]
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowedFields) {
      if (key in body) {
        updateData[key] = body[key]
      }
    }

    const supabase = createServerSupabaseClient()
    const { data: settings, error } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", auth.organizationId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
