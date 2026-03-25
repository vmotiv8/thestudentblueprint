import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { resend } from "@/lib/resend"
import { createServerSupabaseClient } from "@/lib/supabase"
import { buildOrgAssessmentUrl } from "@/lib/url"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "The Student Blueprint <onboarding@resend.dev>"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const org = await verifyApiKey(apiKey)
    if (!org) {
      return NextResponse.json({ error: "Invalid API key or inactive subscription" }, { status: 401 })
    }

    const { email, first_name, coupon_code, message } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // 1. License Enforcement Check
    if (org.max_students !== -1 && org.current_students_count >= org.max_students) {
      return NextResponse.json({ 
        error: "License limit reached. Please upgrade your plan." 
      }, { status: 403 })
    }

    const assessmentBaseUrl = buildOrgAssessmentUrl(org.slug, undefined, null, org.free_assessments)
    const assessmentUrl = (!org.free_assessments && coupon_code)
      ? `${assessmentBaseUrl}?code=${coupon_code}`
      : assessmentBaseUrl

    // 2. Prepare White-labeled Email
    const fromName = org.custom_email_from || org.name
    const fromEmail = DEFAULT_FROM_EMAIL.includes("<") 
      ? `${fromName} ${DEFAULT_FROM_EMAIL.substring(DEFAULT_FROM_EMAIL.indexOf("<"))}`
      : `${fromName} <${DEFAULT_FROM_EMAIL}>`

    try {
      await resend.emails.send({
        from: fromEmail,
        to: [email],
        replyTo: org.custom_email_reply_to || undefined,
        subject: `Invitation from ${org.name} - Your College Success Roadmap`,
        html: `
          <h1>Hello ${first_name ? escapeHtml(first_name) : ""}!</h1>
          <p>You have been invited by ${escapeHtml(org.name)} to take a student assessment.</p>
          ${message ? `<p>Message: ${escapeHtml(message)}</p>` : ""}
          <p><a href="${assessmentUrl}">Click here to start your assessment</a></p>
        `
      })

      // 3. Atomically increment student count to prevent race conditions
      await supabase.rpc('increment_students_count', { org_id: org.id, amount: 1 })

      await supabase.from("usage_logs").insert({
        organization_id: org.id,
        metric: "api_assessment_invite",
        count: 1,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      })

      return NextResponse.json({ success: true, message: "Invitation sent" })
    } catch (error) {
      console.error("API Invite Error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
