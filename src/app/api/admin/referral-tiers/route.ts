import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getAdminAuth } from "@/lib/admin-auth"
import { logAction } from "@/lib/audit"

export async function GET() {
  const auth = await getAdminAuth()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerSupabaseClient()

  const { data: tiers, error } = await supabase
    .from("referral_discount_tiers")
    .select("*")
    .order("discount_percent", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tiers })
}

export async function POST(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { label, discount_percent } = await request.json()

  if (!label || !discount_percent) {
    return NextResponse.json({ error: "Label and discount percent are required" }, { status: 400 })
  }

  if (discount_percent < 1 || discount_percent > 100) {
    return NextResponse.json({ error: "Discount must be between 1 and 100" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data: tier, error } = await supabase
    .from("referral_discount_tiers")
    .insert({ label, discount_percent })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "create_referral_tier",
    entityType: "referral_discount_tier",
    entityId: tier.id,
    details: { label, discount_percent },
  })

  return NextResponse.json({ success: true, tier })
}

export async function PATCH(request: Request) {
  const auth = await getAdminAuth()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (!auth.isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }

  const { id, label, discount_percent, is_active } = await request.json()
  if (!id) return NextResponse.json({ error: "Tier ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const updateData: Record<string, unknown> = {}
  if (label !== undefined) updateData.label = label
  if (discount_percent !== undefined) updateData.discount_percent = discount_percent
  if (is_active !== undefined) updateData.is_active = is_active

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  console.log("[Referral Tiers] PATCH update:", { id, updateData })

  const { data: updated, error } = await supabase
    .from("referral_discount_tiers")
    .update(updateData)
    .eq("id", id)
    .select()

  if (error) {
    console.error("[Referral Tiers] PATCH error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("[Referral Tiers] PATCH result:", updated)

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "update_referral_tier",
    entityType: "referral_discount_tier",
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
  if (!id) return NextResponse.json({ error: "Tier ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()

  // Check if any partner is using this tier
  const { data: partners } = await supabase
    .from("referral_partners")
    .select("id")
    .eq("discount_tier_id", id)
    .limit(1)

  if (partners && partners.length > 0) {
    return NextResponse.json({
      error: "Cannot delete tier — it is assigned to one or more partners",
    }, { status: 400 })
  }

  const { error } = await supabase
    .from("referral_discount_tiers")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "delete_referral_tier",
    entityType: "referral_discount_tier",
    entityId: id,
  })

  return NextResponse.json({ success: true })
}
