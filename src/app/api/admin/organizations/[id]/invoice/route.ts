import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { getAdminAuth } from '@/lib/admin-auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: organizationId } = await params

    // Only super admins or admins of the same org can create invoices
    if (!auth.isSuperAdmin && auth.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount, description, quantity = 1 } = body

    if (!amount || !description) {
      return NextResponse.json({ error: 'Amount and description are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let customerId = org.stripe_customer_id

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: org.billing_email || '',
        name: org.name,
        metadata: { organization_id: org.id }
      })
      customerId = customer.id
      
      // Update organization with customer ID
      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', org.id)
    }

    // Create Invoice Item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      description: `${description} (x${quantity})`,
    })

    // Create Invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      description: `Invoice for ${org.name}`,
      auto_advance: true,
    })

    // Finalize and Send Invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
    
    // Stripe automatically sends the invoice when finalized if collection_method is send_invoice

    return NextResponse.json({ 
      success: true, 
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url 
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    const message = error instanceof Error ? error.message : 'Failed to create invoice'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
