import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { sendAgencyWelcomeEmail } from "@/lib/resend"

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
      .select("role")
      .eq("id", adminId)
      .single()

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: organizations, error } = await supabase
      .from("organizations")
      .select(`
        *,
        students:students(count),
        admins:admins(count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const orgsWithCounts = (organizations || []).map((org) => {
      const { students, admins, ...rest } = org as Record<string, unknown>
      const studentArr = students as { count: number }[] | undefined
      const adminArr = admins as { count: number }[] | undefined
      return {
        ...rest,
        student_count: studentArr?.[0]?.count ?? 0,
        admin_count: adminArr?.[0]?.count ?? 0,
      }
    })

    return NextResponse.json({ organizations: orgsWithCounts })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    const message = error instanceof Error ? error.message : 'Failed to fetch organizations'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("role")
      .eq("id", adminId)
      .single()

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, slug, billingEmail, planType, maxStudents, maxAdmins, assessmentPrice, planPrice, trialDays, billingType } = await req.json()

    if (!billingEmail) {
      return NextResponse.json({ error: "Billing email is required to create agency admin" }, { status: 400 })
    }

    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", normalizedSlug)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 400 })
    }

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", billingEmail)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 400 })
    }

    // Calculate trial end date
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + (trialDays || 14))

    const { data: org, error } = await supabase
      .from("organizations")
      .insert([
        {
          name,
          slug: normalizedSlug,
          billing_email: billingEmail,
          plan_type: planType,
          max_students: maxStudents,
          max_admins: maxAdmins,
          plan_price: planPrice,
          assessment_price: assessmentPrice || 499,
          billing_type: billingType || 'subscription',
          subscription_status: billingType === 'one_time' ? 'active' : 'trial',
          trial_ends_at: billingType === 'one_time' ? null : trialEndDate.toISOString(),
          primary_color: "#1e3a5f",
          secondary_color: "#c9a227",
        },
      ])
      .select()
      .single()

    if (error) throw error

    const setupToken = randomBytes(32).toString("hex")
    const setupExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Generate a temporary password and hash it
    const tempPassword = randomBytes(12).toString("base64url").slice(0, 12)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const { data: newAdmin, error: adminError } = await supabase
      .from("admins")
      .insert([
        {
          organization_id: org.id,
          email: billingEmail,
          role: "agency_owner",
          is_active: true,
          password_hash: passwordHash,
          password_setup_token: setupToken,
          password_setup_expires: setupExpires.toISOString(),
        },
      ])
      .select()
      .single()

    if (adminError) {
      await supabase.from("organizations").delete().eq("id", org.id)
      throw adminError
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thestudentblueprint.com"
    const loginUrl = `${baseUrl}/admin/login`

    try {
      await sendAgencyWelcomeEmail(billingEmail, name, loginUrl, tempPassword)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return NextResponse.json({ success: true, organization: org, admin: newAdmin })
  } catch (error: any) {
    console.error("Error creating organization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("role")
      .eq("id", adminId)
      .single()

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...raw } = body

    if (!id) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const allowedFields = [
      "name", "slug", "billing_email", "plan_type", "max_students", "max_admins",
      "assessment_price", "plan_price", "subscription_status", "primary_color", "secondary_color",
      "logo_url", "trial_ends_at", "is_active", "billing_type"
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in raw) updates[key] = raw[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    if (updates.slug) {
      const normalizedSlug = (updates.slug as string).toLowerCase().replace(/[^a-z0-9-]/g, '-')
      updates.slug = normalizedSlug

      const { data: existing } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", normalizedSlug)
        .neq("id", id)
        .single()

      if (existing) {
        return NextResponse.json({ error: "Organization slug already exists" }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: admin } = await supabase
      .from("admins")
      .select("role")
      .eq("id", adminId)
      .single()

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Check if it's the platform owner
    const { data: org } = await supabase
      .from("organizations")
      .select("settings")
      .eq("id", id)
      .single()

    if (org?.settings?.platformOwner) {
      return NextResponse.json({ error: "Cannot delete the platform owner organization" }, { status: 400 })
    }

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting organization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
