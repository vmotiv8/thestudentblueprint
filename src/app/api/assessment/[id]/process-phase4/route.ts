import { NextResponse, after } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildProcessPhase4Prompt } from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'
import { callAI } from '@/lib/ai-caller'
import { savePhaseResults, updatePhaseStatus } from '@/lib/assessment-save'
import { verifyQStashSignature } from '@/lib/qstash'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail, sendInternalCompletionNotification } from '@/lib/resend'

export const maxDuration = 120

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assessmentId } = await params

  const isValid = await verifyQStashSignature(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data: assessment } = await supabase
      .from('assessments')
      .select('responses, organization_id, student_archetype, competitiveness_score, student_type')
      .eq('id', assessmentId)
      .single()

    if (!assessment?.responses) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses as Record<string, unknown>
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    console.log(`[Phase4] Starting for assessment ${assessmentId} (type: ${assessment.student_type || 'high_school'})`)

    const result = await callAI(
      buildProcessPhase4Prompt(
        formData,
        knowledgeHubResources,
        assessment.student_type,
        assessment.student_archetype || 'Unknown',
        assessment.competitiveness_score || 0
      ),
      12000,
      90000
    )

    if (!result.success) {
      console.error(`[Phase4] Failed for ${assessmentId}:`, result.error)
      const { phaseStatus } = await updatePhaseStatus(assessmentId, 'phase4', 'failed')
      await savePhaseResults(assessmentId, {}, 'partial', phaseStatus)
      return NextResponse.json({ error: result.error }, { status: 503 })
    }

    console.log(`[Phase4] Complete for ${assessmentId}`)

    const { phaseStatus, allCompleted } = await updatePhaseStatus(assessmentId, 'phase4', 'completed')
    await savePhaseResults(assessmentId, result.data, allCompleted ? 'completed' : 'partial', phaseStatus)

    // If all phases are done, send emails and webhooks
    if (allCompleted) {
      try {
        after(async () => {
          try {
            const { data: fullAssessment } = await supabase
              .from('assessments')
              .select('*, student:students(*), organization:organizations(*)')
              .eq('id', assessmentId)
              .single()
            if (!fullAssessment) return

            if (fullAssessment.organization_id) {
              const student = fullAssessment.student as { email?: string; first_name?: string; last_name?: string } | null
              webhookEvents.assessmentCompleted(fullAssessment.organization_id, {
                assessmentId: fullAssessment.id,
                studentEmail: student?.email || '',
                studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
                archetype: fullAssessment.student_archetype || 'Unknown',
                competitivenessScore: fullAssessment.competitiveness_score || 0,
                reportUrl: buildResultsUrl(fullAssessment.id),
              }).catch(err => console.error('Webhook failed:', err))
            }

            const student = fullAssessment.student as { email?: string; first_name?: string; last_name?: string; parent_email?: string } | null
            const org = fullAssessment.organization as { name?: string; primary_color?: string; secondary_color?: string; logo_url?: string; custom_email_from?: string; custom_email_reply_to?: string } | null

            if (student?.email) {
              const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student'
              sendStudentResultsEmail(student.email, name, fullAssessment.student_archetype || 'Your Archetype', assessmentId, fullAssessment.report_data || {}, {
                orgName: org?.name, primaryColor: org?.primary_color, secondaryColor: org?.secondary_color,
                logoUrl: org?.logo_url, fromName: org?.custom_email_from || org?.name, replyTo: org?.custom_email_reply_to,
              }).catch(err => console.error('Results email failed:', err))
              if (student.parent_email) {
                sendParentEmail(student.parent_email, name, fullAssessment.student_archetype || 'Your Archetype', assessmentId, fullAssessment.report_data || {})
                  .catch(err => console.error('Parent email failed:', err))
              }
            }
            // Internal team notification — fire on every completion regardless of student email presence.
            sendInternalCompletionNotification({
              assessmentId,
              studentName: student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
              studentEmail: student?.email || '—',
              studentType: fullAssessment.student_type,
              grade: (student as { grade_level?: string } | null)?.grade_level || (student as { current_grade?: string } | null)?.current_grade,
              organizationName: org?.name,
              archetype: fullAssessment.student_archetype,
              competitivenessScore: fullAssessment.competitiveness_score,
            }).catch(err => console.error('Internal completion notification failed:', err))
          } catch (err) { console.error('[Phase4] Background error:', err) }
        })
      } catch { console.warn('[Phase4] after() unavailable') }
    }

    return NextResponse.json({ success: true, phase: 4, allCompleted })
  } catch (error) {
    console.error(`[Phase4] Error for ${assessmentId}:`, error)
    return NextResponse.json({ error: 'Phase 4 processing failed' }, { status: 500 })
  }
}
