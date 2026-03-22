import { createServerSupabaseClient } from "./supabase"

export async function logAction({
  adminId,
  adminEmail,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  adminId?: string
  adminEmail?: string
  action: string
  entityType?: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { error } = await supabase.from("audit_logs").insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
    })

    if (error) {
      console.error("Error logging action:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error logging action:", error)
    return { success: false, error }
  }
}
