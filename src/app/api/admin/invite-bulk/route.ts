import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendStudentInviteEmail } from '@/lib/resend'
import { createServerSupabaseClient } from '@/lib/supabase'
import { validateRequest, bulkInviteSchema } from '@/lib/validations'
import { buildOrgAssessmentUrl } from '@/lib/url'
import { isSubscriptionActive } from '@/lib/plan-enforcement'
import type { Organization } from '@/types'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('organization_id, organization:organizations(*)')
      .eq('id', adminId)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = await validateRequest(request, bulkInviteSchema)
    if (!validation.success) {
      return validation.error
    }

    const { emails } = validation.data
    const org = admin.organization as unknown as Organization

    // Subscription status check
    if (!isSubscriptionActive(org)) {
      return NextResponse.json({
        error: 'Your subscription is not active. Please contact support to restore access.'
      }, { status: 403 })
    }

    if (org.max_students !== -1 && (org.current_students_count + emails.length) > org.max_students) {
      return NextResponse.json({
        error: `Bulk invite exceeds license limit. You have ${org.max_students - org.current_students_count} seats remaining.`
      }, { status: 403 })
    }

    const assessmentUrl = buildOrgAssessmentUrl(org.slug, undefined, org.domain_verified ? org.domain : null, org.free_assessments)

    const fromName = org.custom_email_from || org.name

    const sendResults = await Promise.all(emails.map(async (email: string) => {
      try {
        await sendStudentInviteEmail({
          to: email,
          assessmentUrl,
          couponCode: null,
          message: null,
          orgName: org.name,
          logoUrl: org.logo_url || null,
          primaryColor: org.primary_color || '#1e3a5f',
          secondaryColor: org.secondary_color || '#c9a227',
          fromName,
          replyTo: org.custom_email_reply_to || null
        })
        return { email, success: true }
      } catch (error) {
        console.error(`Failed to send invite to ${email}:`, error)
        return { email, success: false }
      }
    }))

    const invitedCount = sendResults.filter(r => r.success).length

    if (invitedCount > 0) {
      // Atomically increment student count to prevent race conditions
      await supabase.rpc('increment_students_count', { org_id: org.id, amount: invitedCount })

      await supabase.from('usage_logs').insert({
        organization_id: org.id,
        metric: 'assessment_invite_bulk',
        count: invitedCount,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      })
    }

    return NextResponse.json({ 
      success: true, 
      invitedCount, 
      totalRequested: emails.length,
      failures: sendResults.filter(r => !r.success).map(r => r.email)
    })

  } catch (error) {
    console.error('Error sending bulk invites:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
