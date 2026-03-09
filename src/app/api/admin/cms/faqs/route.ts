import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getAdminAuth } from "@/lib/admin-auth"

export async function GET() {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ faqs: data })
}

export async function POST(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("faqs")
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "create_faq",
    entityType: "faq",
    entityId: data.id,
    details: { question: data.question }
  })

  return NextResponse.json({ success: true, faq: data })
}

export async function PATCH(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("faqs")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "update_faq",
    entityType: "faq",
    entityId: id,
    details: updates
  })

  return NextResponse.json({ success: true, faq: data })
}

export async function DELETE(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("faqs").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "delete_faq",
    entityType: "faq",
    entityId: id
  })

  return NextResponse.json({ success: true })
}
