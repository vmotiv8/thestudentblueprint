import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getAdminAuth } from "@/lib/admin-auth"
import { logAction } from "@/lib/audit"
// Partner invite emails not yet implemented for this project

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET() {
  const auth = await getAdminAuth()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerSupabaseClient()

  const { data: partners, error } = await supabase
    .from("referral_partners")
    .select(`
      *,
      referral_discount_tiers (id, label, discount_percent, discounted_price),
      referral_students (id, payment_status, completed, sale_amount),
      referral_commissions (id, commission_amount, paid_out)
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute aggregated stats per partner
  const partnersWithStats = (partners || []).map((p) => {
    const students = p.referral_students || []
    const commissions = p.referral_commissions || []
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      organization: p.organization,
      referral_code: p.referral_code,
      discount_tier_id: p.discount_tier_id,
      status: p.status,
      can_view_results: p.can_view_results || false,
      created_at: p.created_at,
      tier: p.referral_discount_tiers,
      student_count: students.length,
      completed_count: students.filter((s: { completed: boolean }) => s.completed).length,
      total_revenue: students
        .filter((s: { payment_status: string }) => s.payment_status === "paid")
        .reduce((sum: number, s: { sale_amount: number | null }) => sum + (s.sale_amount || 0), 0),
      unpaid_balance: commissions
        .filter((c: { paid_out: boolean }) => !c.paid_out)
        .reduce((sum: number, c: { commission_amount: number }) => sum + (c.commission_amount || 0), 0),
      total_earned: commissions
        .reduce((sum: number, c: { commission_amount: number }) => sum + (c.commission_amount || 0), 0),
    }
  })

  // Compute global stats
  const stats = {
    totalActivePartners: partnersWithStats.filter((p) => p.status === "active").length,
    totalStudents: partnersWithStats.reduce((sum, p) => sum + p.student_count, 0),
    totalCompleted: partnersWithStats.reduce((sum, p) => sum + p.completed_count, 0),
    totalRevenue: partnersWithStats.reduce((sum, p) => sum + p.total_revenue, 0),
  }

  return NextResponse.json({ partners: partnersWithStats, stats })
}

export async function POST(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, email, organization, discount_tier_id, referral_code } = await request.json()

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Check for duplicate email
  const { data: existing } = await supabase
    .from("referral_partners")
    .select("id")
    .eq("email", email.toLowerCase())
    .single()

  if (existing) {
    return NextResponse.json({ error: "A partner with this email already exists" }, { status: 400 })
  }

  // Generate or validate referral code
  let code = referral_code?.toUpperCase().replace(/[^A-Z0-9]/g, "") || ""
  if (!code) {
    // Auto-generate with collision check
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateReferralCode()
      const { data: codeExists } = await supabase
        .from("referral_partners")
        .select("id")
        .eq("referral_code", code)
        .single()
      if (!codeExists) break
    }
  } else {
    // Check collision for custom code
    const { data: codeExists } = await supabase
      .from("referral_partners")
      .select("id")
      .eq("referral_code", code)
      .single()
    if (codeExists) {
      return NextResponse.json({ error: "This referral code is already taken" }, { status: 400 })
    }
  }

  if (code.length < 4 || code.length > 8) {
    return NextResponse.json({ error: "Referral code must be 4-8 characters" }, { status: 400 })
  }

  // Get tier info for the email
  const { data: tier } = await supabase
    .from("referral_discount_tiers")
    .select("label, discount_percent, discounted_price")
    .eq("id", discount_tier_id)
    .single()

  // Insert the partner
  const { data: partner, error } = await supabase
    .from("referral_partners")
    .insert({
      name,
      email: email.toLowerCase(),
      organization: organization || null,
      referral_code: code,
      discount_tier_id: discount_tier_id || null,
      status: "invited",
      created_by: auth.adminId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // TODO: Send invite email to partner

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "create_referral_partner",
    entityType: "referral_partner",
    entityId: partner.id,
    details: { name, email, organization, referral_code: code, tier: tier?.label },
  })

  return NextResponse.json({
    success: true,
    partner: {
      ...partner,
      tier,
      student_count: 0,
      completed_count: 0,
      total_revenue: 0,
      unpaid_balance: 0,
      total_earned: 0,
    },
  })
}

export async function PATCH(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, status, discount_tier_id, can_view_results, resend_invite } = await request.json()
  if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()

  if (resend_invite) {
    const { data: partner } = await supabase
      .from("referral_partners")
      .select("email, name, referral_code")
      .eq("id", id)
      .single()

    if (partner) {
      // TODO: Send invite email to partner
      console.log("Resend invite requested for:", partner.email)
    }
    return NextResponse.json({ success: true })
  }

  const updateData: Record<string, unknown> = {}
  if (status !== undefined) updateData.status = status
  if (discount_tier_id !== undefined) updateData.discount_tier_id = discount_tier_id
  if (can_view_results !== undefined) updateData.can_view_results = can_view_results

  const { error } = await supabase
    .from("referral_partners")
    .update(updateData)
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "update_referral_partner",
    entityType: "referral_partner",
    entityId: id,
    details: updateData,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()

  // referral_students and referral_commissions have ON DELETE CASCADE,
  // so deleting the partner will clean up related rows automatically
  const { error } = await supabase
    .from("referral_partners")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "delete_referral_partner",
    entityType: "referral_partner",
    entityId: id,
  })

  return NextResponse.json({ success: true })
}
