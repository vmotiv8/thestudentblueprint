import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function getPartnerAuth() {
  const cookieStore = await cookies()
  const partnerId = cookieStore.get("partner_session")?.value
  if (!partnerId) return null

  try {
    const supabase = createServerSupabaseClient()
    const { data: partner, error } = await supabase
      .from("referral_partners")
      .select("id, name, email, referral_code, status, discount_tier_id")
      .eq("id", partnerId)
      .in("status", ["active", "invited"])
      .single()

    if (error || !partner) return null

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerEmail: partner.email,
      referralCode: partner.referral_code,
      status: partner.status,
      discountTierId: partner.discount_tier_id,
    }
  } catch {
    return null
  }
}
