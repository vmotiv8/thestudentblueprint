import { NextResponse } from 'next/server'
import { requireAdminContext } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendResumeReminderEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const context = await requireAdminContext(request)
    const { assessmentId } = await request.json()

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch the assessment with student and org data
    let query = supabase
      .from('assessments')
      .select(`
        id,
        status,
        current_section,
        student:students (
          id,
          email,
          first_name,
          last_name,
          full_name,
          unique_code
        ),
        organization:organizations (
          id,
          name,
          slug,
          logo_url,
          primary_color,
          secondary_color,
          custom_email_from,
          custom_email_reply_to
        )
      `)
      .eq('id', assessmentId)

    if (!context.isSuperAdmin) {
      query = query.eq('organization_id', context.organization.id)
    }

    const { data: assessment, error } = await query.single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const student = assessment.student as { email?: string; first_name?: string; last_name?: string; full_name?: string; unique_code?: string } | null
    const org = assessment.organization as { name?: string; slug?: string; logo_url?: string; primary_color?: string; secondary_color?: string; custom_email_from?: string; custom_email_reply_to?: string } | null

    if (!student?.email) {
      return NextResponse.json({ error: 'Student has no email address' }, { status: 400 })
    }

    if (!student.unique_code) {
      return NextResponse.json({ error: 'Student has no resume code' }, { status: 400 })
    }

    if (assessment.status === 'completed') {
      return NextResponse.json({ error: 'Assessment is already completed' }, { status: 400 })
    }

    // Build the assessment URL with the org slug and resume code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://thestudentblueprint.com'
    const orgSlug = org?.slug || context.organization.slug
    const assessmentUrl = `${baseUrl}/${orgSlug}/checkout?code=${student.unique_code}`

    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student'

    const result = await sendResumeReminderEmail({
      to: student.email,
      studentName,
      resumeCode: student.unique_code,
      assessmentUrl,
      currentSection: assessment.current_section as number | null,
      orgName: org?.name || context.organization.name || 'The Student Blueprint',
      logoUrl: org?.logo_url || null,
      primaryColor: org?.primary_color || '#1e3a5f',
      secondaryColor: org?.secondary_color || '#c9a227',
      fromName: org?.custom_email_from || org?.name,
      replyTo: org?.custom_email_reply_to,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sentTo: student.email })
  } catch (error) {
    console.error('[SendResumeReminder] Error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}
