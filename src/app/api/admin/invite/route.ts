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

    // 2. License Enforcement Check
    if (org.max_students !== -1 && org.current_students_count >= org.max_students) {
      return NextResponse.json({ 
        error: 'License limit reached. Please upgrade your plan to invite more students.' 
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
    const assessmentUrl = (!org.free_assessments && couponCode)
      ? `${assessmentBaseUrl}?code=${couponCode}`
      : assessmentBaseUrl

    const fromName = org.custom_email_from || org.name

    try {
      await sendStudentInviteEmail({
        to: email,
        assessmentUrl,
        couponCode: couponCode || null,
        message: message || null,
        orgName: org.name,
        logoUrl: org.logo_url || null,
        primaryColor: org.primary_color,
        secondaryColor: org.secondary_color,
        fromName,
        replyTo: org.custom_email_reply_to || null
      })

      // 3. Atomically increment student count to prevent race conditions
      await supabase.rpc('increment_students_count', { org_id: org.id, amount: 1 })

      // 4. Log the usage
      await supabase.from('usage_logs').insert({
        organization_id: org.id,
        metric: 'assessment_invite',
        count: 1,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(`Failed to send invite to ${email}:`, error)
      return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
