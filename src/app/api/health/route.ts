import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check Supabase connectivity
    const { data: orgs, error: supabaseError } = await supabase
      .from("organizations")
      .select("id, name, subscription_status, max_students, current_students_count, max_admins, settings")

    if (supabaseError) {
      return NextResponse.json(
        { 
          status: "down", 
          message: "Database connection failed",
          details: supabaseError.message 
        },
        { status: 503 }
      )
    }

    const issues: any[] = []

    // Analyze organization health
    orgs?.forEach(org => {
      // Ignore platform owner
      if (org.settings?.platformOwner) return

      if (org.subscription_status !== 'active') {
        issues.push({
          type: "subscription",
          severity: "high",
          agency: org.name,
          agencyId: org.id,
          message: `Subscription is ${org.subscription_status}`
        })
      }

      if (org.current_students_count >= org.max_students) {
        issues.push({
          type: "capacity",
          severity: "medium",
          agency: org.name,
          agencyId: org.id,
          message: `Student limit reached (${org.current_students_count}/${org.max_students})`
        })
      } else if (org.current_students_count >= org.max_students * 0.9) {
        issues.push({
          type: "capacity",
          severity: "low",
          agency: org.name,
          agencyId: org.id,
          message: `Near student limit (${org.current_students_count}/${org.max_students})`
        })
      }

      // Note: current_admins_count not yet tracked in DB; skip admin capacity check
    })

    // Check Resend connectivity
    const resendApiKey = process.env.RESEND_API_KEY
    let emailStatus = "unknown"
    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          headers: {
            "Authorization": `Bearer ${resendApiKey}`
          }
        })
        if (res.ok) {
          emailStatus = "up"
        } else {
          emailStatus = "degraded"
          issues.push({
            type: "service",
            severity: "medium",
            agency: "System-wide",
            message: "Email service (Resend) is degraded or API key invalid"
          })
        }
      } catch {
        emailStatus = "down"
        issues.push({
          type: "service",
          severity: "high",
          agency: "System-wide",
          message: "Email service (Resend) is unreachable"
        })
      }
    } else {
      issues.push({
        type: "config",
        severity: "high",
        agency: "System-wide",
        message: "Resend API key is missing"
      })
    }

    const overallStatus = issues.some(i => i.severity === 'high') ? 'down' : 
                         issues.length > 0 ? 'degraded' : 'up'

    return NextResponse.json({
      status: overallStatus,
      message: overallStatus === 'up' ? "All systems operational" : `${issues.length} issues detected`,
      issues,
      services: {
        database: "up",
        email: emailStatus,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "down", 
        message: error.message || "Platform is experiencing issues",
        issues: [{
          type: "system",
          severity: "high",
          agency: "System-wide",
          message: error.message || "Critical system error"
        }]
      },
      { status: 500 }
    )
  }
}
