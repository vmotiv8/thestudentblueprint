import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPartnerAuth } from '@/lib/partner-auth'

export async function PUT(request: Request) {
  const auth = await getPartnerAuth()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { preferred_method, venmo_username, paypal_email, zelle_phone, zelle_email, bank_account_holder, bank_routing_number, bank_account_last4, other_instructions, contact_phone, contact_email } = body

    if (!preferred_method || !['venmo', 'paypal', 'zelle', 'bank', 'other'].includes(preferred_method)) {
      return NextResponse.json({ error: 'Valid payment method is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const paymentData = {
      partner_id: auth.partnerId,
      preferred_method,
      venmo_username: venmo_username || null,
      paypal_email: paypal_email || null,
      zelle_phone: zelle_phone || null,
      zelle_email: zelle_email || null,
      bank_account_holder: bank_account_holder || null,
      bank_routing_number: bank_routing_number || null,
      bank_account_last4: bank_account_last4 || null,
      other_instructions: other_instructions || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      updated_at: new Date().toISOString(),
    }

    // Upsert — insert if not exists, update if exists
    const { error } = await supabase
      .from('referral_payment_info')
      .upsert(paymentData, { onConflict: 'partner_id' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner/PaymentInfo] Error:', error)
    return NextResponse.json({ error: 'Failed to save payment info' }, { status: 500 })
  }
}
