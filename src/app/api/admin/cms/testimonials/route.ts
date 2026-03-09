import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getAdminAuth } from "@/lib/admin-auth"

export async function GET() {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ testimonials: data })
}

export async function POST(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("testimonials")
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "create_testimonial",
    entityType: "testimonial",
    entityId: data.id,
    details: { name: data.name, school: data.school }
  })

  return NextResponse.json({ success: true, testimonial: data })
}

export async function PATCH(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "update_testimonial",
    entityType: "testimonial",
    entityId: id,
    details: updates
  })

  return NextResponse.json({ success: true, testimonial: data })
}

export async function DELETE(request: Request) {
  const auth = await getAdminAuth()
  if (!auth || !auth.isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { logAction } = await import("@/lib/audit")
  await logAction({
    adminId: auth.adminId,
    adminEmail: auth.adminEmail,
    action: "delete_testimonial",
    entityType: "testimonial",
    entityId: id
  })

  return NextResponse.json({ success: true })
}
