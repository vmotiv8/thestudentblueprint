import { createServerSupabaseClient } from "@/lib/supabase"

export async function verifyApiKey(apiKey: string) {
  if (!apiKey) return null

  const supabase = createServerSupabaseClient()
  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("api_key", apiKey)
    .single()

  if (error || !org) return null

  // Check if subscription is active
  if (org.subscription_status !== "active") {
    return null
  }

  return org
}
