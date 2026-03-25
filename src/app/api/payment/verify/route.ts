import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { applyRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const rateLimitResponse = await applyRateLimit(request, 'standard', 'payment-verify')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const email = searchParams.get('email')
    const organizationSlug = searchParams.get('organization_slug')

    const supabase = createServerSupabaseClient()

    if (sessionId) {
      // First check our database
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single()

      if (payment && payment.status === 'completed') {
        return NextResponse.json({ 
          paid: true, 
          email: payment.email 
        })
      }

      // If not marked as completed in DB, check with Stripe directly
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        
        if (session.payment_status === 'paid') {
          // Update our database to avoid redundant Stripe calls
          await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              email: session.customer_details?.email || payment?.email
            })
            .eq('stripe_session_id', sessionId)

          return NextResponse.json({ 
            paid: true, 
            email: session.customer_details?.email || payment?.email
          })
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe session:', stripeError)
      }
    }

    if (email) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle()

      if (payment) {
        return NextResponse.json({ 
          paid: true, 
          email: payment.email 
        })
      }
      
      const organization = organizationSlug
        ? await getOrganizationBySlug(organizationSlug)
        : await getDefaultOrganization()

      let studentQuery = supabase
        .from('students')
        .select('id, assessments(coupon_code_used)')
        .eq('email', email.toLowerCase())

      if (organization) {
        studentQuery = studentQuery.eq('organization_id', organization.id)
      }

      const { data: student } = await studentQuery.maybeSingle()
      
      if (student) {
        const assessments = student.assessments as unknown as { coupon_code_used: string | null }[]
        if (assessments?.[0]?.coupon_code_used) {
          return NextResponse.json({ 
            paid: true, 
            email: email,
            coupon: true
          })
        }
      }
    }

    return NextResponse.json({ paid: false })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ paid: false })
  }
}
