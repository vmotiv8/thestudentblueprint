import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function getAdminAuth() {
  const cookieStore = await cookies()
  const adminId = cookieStore.get("admin_session")?.value
  if (!adminId) return null

  try {
    const supabase = createServerSupabaseClient()
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, email, role, organization_id")
      .eq("id", adminId)
      .eq("is_active", true)
      .single()

    if (error || !admin) return null
    
    return { 
      adminId: admin.id, 
      adminEmail: admin.email, 
      role: admin.role,
      organizationId: admin.organization_id,
      isSuperAdmin: admin.role === 'super_admin'
    }
  } catch {
    return null
  }
}
