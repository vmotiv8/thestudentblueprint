import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendStudentInviteEmail } from '@/lib/resend'
import { createServerSupabaseClient } from '@/lib/supabase'
import { isSubscriptionActive } from '@/lib/plan-enforcement'
import { buildOrgAssessmentUrl } from '@/lib/url'
import type { Organization } from '@/types'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    
    // Fetch admin and their organization details
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('organization_id, organization:organizations(*)')
      .eq('id', adminId)
      .eq('is_active', true)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = admin.organization as unknown as Organization

    // 1. Subscription Status Check
    if (!isSubscriptionActive(org)) {
      return NextResponse.json({
        error: 'Your subscription is not active. Please contact support to restore access.'
      }, { status: 403 })
    }

    const { email, couponCode, message } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    const assessmentBaseUrl = buildOrgAssessmentUrl(
      org.slug,
      undefined,
      org.domain && org.domain_verified ? org.domain : null,
      org.free_assessments
    )
    const assessmentUrl = new URL(assessmentBaseUrl)
    if (!org.free_assessments && couponCode) {
      assessmentUrl.searchParams.set('coupon', String(couponCode).trim().toUpperCase())
      assessmentUrl.searchParams.set('email', email)
    }

    const fromName = org.custom_email_from || org.name

    try {
      const emailResult = await sendStudentInviteEmail({
        to: email,
        assessmentUrl: assessmentUrl.toString(),
        couponCode: couponCode || null,
        message: message || null,
        orgName: org.name,
        logoUrl: org.logo_url || null,
        primaryColor: org.primary_color,
        secondaryColor: org.secondary_color,
        fromName,
        replyTo: org.custom_email_reply_to || null
      })

      if (!emailResult.success) {
        console.error(`[Invite] Email failed for ${email}:`, {
          error: emailResult.error,
          orgId: org.id,
          orgName: org.name,
          assessmentUrl: assessmentUrl.toString(),
          timestamp: new Date().toISOString(),
        })
        return NextResponse.json(
          { error: 'Failed to send invitation email. Please check the email address and try again.' },
          { status: 500 }
        )
      }

      console.log(`[Invite] Email sent successfully to ${email} for org ${org.slug}`)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(`[Invite] Exception sending to ${email}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        orgId: org.id,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
