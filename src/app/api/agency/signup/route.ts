import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateRequest, agencySignupSchema } from "@/lib/validations"
import { provisionOrganization } from "@/lib/organization/provisioning"
import { applyRateLimit } from "@/lib/rate-limit"
import { sendAgencyWelcomeEmail } from "@/lib/resend"
import { buildAgencyUrl } from "@/lib/url"

export async function POST(request: NextRequest) {
  // Rate limit signup attempts
  const rateLimitResponse = await applyRateLimit(request, 'strict', 'agency-signup')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const validation = await validateRequest(request, agencySignupSchema)
    if (!validation.success) {
      return validation.error
    }

    const { name, email, password, agency_name, slug } = validation.data

    // Use the provisioning system to create everything
    const result = await provisionOrganization({
      name: agency_name,
      slug,
      ownerEmail: email,
      ownerPassword: password,
      ownerName: name,
      planType: 'starter',
      trialDays: 14,
    })

    if (!result.success || !result.admin) {
      return NextResponse.json(
        { error: result.error || "Failed to create account" },
        { status: 400 }
      )
    }

    // Send welcome email (fire-and-forget)
    sendAgencyWelcomeEmail(
      email,
      agency_name,
      buildAgencyUrl(),
      password,
      name
    ).catch((err) => console.error('Failed to send welcome email:', err))

    // Set Session Cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", result.admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json({
      success: true,
      organization: result.organization,
      redirect: "/agency/onboarding"
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
