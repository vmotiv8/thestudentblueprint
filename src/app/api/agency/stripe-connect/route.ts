import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import { getAppUrl } from "@/lib/url"

/**
 * GET - Check Stripe Connect account status
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("organization_id, organization:organizations(stripe_connect_account_id)")
      .eq("id", adminId)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const org = admin.organization as unknown as { stripe_connect_account_id: string | null }
    const accountId = org?.stripe_connect_account_id

    if (!accountId) {
      return NextResponse.json({ connected: false })
    }

    const account = await stripe.accounts.retrieve(accountId)

    return NextResponse.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      account_id: accountId,
    })
  } catch (error) {
    console.error("Error checking Stripe Connect status:", error)
    return NextResponse.json({ error: "Failed to check account status" }, { status: 500 })
  }
}

/**
 * POST - Create a Stripe Connect account and return an onboarding link
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("organization_id, role, organization:organizations(id, name, stripe_connect_account_id, billing_email)")
      .eq("id", adminId)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["agency_admin", "agency_owner", "owner", "admin", "super_admin", "god"]
    if (!allowedRoles.includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const org = admin.organization as unknown as {
      id: string
      name: string
      stripe_connect_account_id: string | null
      billing_email: string | null
    }

    let accountId = org.stripe_connect_account_id

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: org.billing_email || undefined,
        business_profile: {
          name: org.name,
        },
        metadata: {
          organization_id: org.id,
        },
      })

      accountId = account.id

      // Save the account ID to the organization
      await supabase
        .from("organizations")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", org.id)
    }

    // Create an account link for onboarding
    const appUrl = getAppUrl()
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/agency/settings?tab=billing&connect=refresh`,
      return_url: `${appUrl}/agency/settings?tab=billing&connect=success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error("Error creating Stripe Connect account:", error?.message || error)
    const message = error?.type === 'StripePermissionError'
      ? "Your Stripe account doesn't have Connect permissions. Enable Connect in your Stripe Dashboard at https://dashboard.stripe.com/connect/overview"
      : error?.message || "Failed to create Stripe Connect account"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE - Disconnect Stripe Connect account
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("organization_id, role")
      .eq("id", adminId)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["agency_admin", "agency_owner", "owner", "super_admin", "god"]
    if (!allowedRoles.includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await supabase
      .from("organizations")
      .update({ stripe_connect_account_id: null })
      .eq("id", admin.organization_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting Stripe Connect:", error)
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 })
  }
}
