import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import { provisionOrganization } from "@/lib/organization/provisioning"
import { sendAgencyWelcomeEmail } from "@/lib/resend"
import { buildAgencyUrl, getOriginFromRequest } from "@/lib/url"
import { applyRateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"

// Volume pricing tiers
function getPricePerStudent(qty: number): number {
  if (qty >= 1000) return 100
  if (qty >= 100) return 150
  if (qty >= 50) return 200
  if (qty >= 25) return 250
  if (qty >= 10) return 300
  return 350
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request, 'strict', 'agency-get-started')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { name, email, password, agency_name, slug, quantity } = body

    // Validate required fields
    if (!email || !password || !agency_name || !slug || !quantity) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (quantity < 1 || quantity > 10000) {
      return NextResponse.json({ error: "Quantity must be between 1 and 10,000" }, { status: 400 })
    }

    // Calculate pricing
    const pricePerStudent = getPricePerStudent(quantity)
    const totalCents = quantity * pricePerStudent * 100

    // Normalize slug
    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    // Check for existing slug/email
    const supabase = createServerSupabaseClient()

    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", normalizedSlug)
      .single()

    if (existingOrg) {
      return NextResponse.json({ error: "This URL slug is already taken. Please choose a different one." }, { status: 400 })
    }

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: "An account with this email already exists. Please login instead." }, { status: 400 })
    }

    // Provision the organization
    const result = await provisionOrganization({
      name: agency_name,
      slug: normalizedSlug,
      ownerEmail: email,
      ownerPassword: password,
      ownerName: name,
      planType: 'starter',
      trialDays: 0, // No trial — they're paying upfront
      maxStudents: quantity,
      billingType: 'one_time',
    })

    if (!result.success || !result.organization || !result.admin) {
      return NextResponse.json({ error: result.error || "Failed to create account" }, { status: 500 })
    }

    // Update the org with the license details
    await supabase
      .from("organizations")
      .update({
        subscription_status: 'active',
        billing_type: 'one_time',
        max_students: quantity,
        plan_price: quantity * pricePerStudent,
        assessment_price: pricePerStudent,
      })
      .eq("id", result.organization.id)

    // Create Stripe checkout session for the license purchase
    const origin = getOriginFromRequest(request)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Student Assessment Licenses (${quantity} students)`,
              description: `${quantity} student assessment licenses at $${pricePerStudent}/student`,
            },
            unit_amount: pricePerStudent * 100,
          },
          quantity: quantity,
        },
      ],
      customer_email: email,
      success_url: `${origin}/get-started/success?session_id={CHECKOUT_SESSION_ID}&org=${normalizedSlug}`,
      cancel_url: `${origin}/get-started?cancelled=true`,
      metadata: {
        product: 'agency_licenses',
        organization_id: result.organization.id,
        admin_id: result.admin.id,
        quantity: quantity.toString(),
        price_per_student: pricePerStudent.toString(),
      },
    })

    // Set session cookie so they're logged in after payment
    const cookieStore = await cookies()
    cookieStore.set("admin_session", result.admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    // Send welcome email (fire-and-forget)
    sendAgencyWelcomeEmail(
      email,
      agency_name,
      buildAgencyUrl(),
      password,
      name
    ).catch((err) => console.error('Failed to send welcome email:', err))

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      organization: { id: result.organization.id, slug: normalizedSlug },
    })
  } catch (error) {
    console.error("Get-started error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
