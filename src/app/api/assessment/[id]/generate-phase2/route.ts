import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'
import {
  buildPhase2Prompt,
  parseClaudeResponse,
  PHASE_2_REQUIRED_FIELDS,
} from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'

export const maxDuration = 300

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = createServerSupabaseClient()

    // Auth: allow verified email cookie OR admin session
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value
    const verifiedEmail = cookieStore.get('verified_email')?.value

    if (!adminId && !verifiedEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Atomic lock: only proceed if status is 'partial' and phase2 isn't already running
    const { data: locked, error: lockError } = await supabase
      .rpc('lock_phase2_generation', { assessment_id: assessmentId })

    // If the RPC doesn't exist yet, fallback to manual check + update
    let assessment
    if (lockError) {
      // Manual fallback: check status and lock
      const { data: existing } = await supabase
        .from('assessments')
        .select('*, student:students(*), organization:organizations(*)')
        .eq('id', assessmentId)
        .single()

      if (!existing || existing.status !== 'partial') {
        return NextResponse.json(
          { error: existing?.status === 'completed' ? 'Report is already complete' : 'Assessment not ready for Phase 2' },
          { status: 400 }
        )
      }

      // Check if Phase 2 is already running (started less than 3 minutes ago)
      if (existing.phase2_started_at) {
        const elapsed = Date.now() - new Date(existing.phase2_started_at).getTime()
        if (elapsed < 180000) {
          return NextResponse.json({ status: 'already_running' }, { status: 202 })
        }
      }

      // Set lock
      await supabase
        .from('assessments')
        .update({ phase2_started_at: new Date().toISOString() })
        .eq('id', assessmentId)

      assessment = existing
    } else {
      if (!locked) {
        return NextResponse.json({ status: 'already_running' }, { status: 202 })
      }
      // Fetch full assessment
      const { data: existing } = await supabase
        .from('assessments')
        .select('*, student:students(*), organization:organizations(*)')
        .eq('id', assessmentId)
        .single()
      assessment = existing
    }

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses
    if (!formData) {
      return NextResponse.json({ error: 'No assessment responses found' }, { status: 400 })
    }

    // Fetch knowledge hub resources with file content extraction
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    // Build Phase 1 summary from existing data
    const phase1Summary = {
      studentArchetype: assessment.student_archetype || 'Unknown',
      competitivenessScore: assessment.competitiveness_score || 0,
      topStrengths: assessment.strengths_analysis?.competitiveAdvantages?.slice(0, 3) || [],
    }

    // Call Claude for Phase 2
    const phase2Result = await callClaude(
      buildPhase2Prompt(formData, knowledgeHubResources, phase1Summary),
      12000,
      120000,
      PHASE_2_REQUIRED_FIELDS
    )

    if (!phase2Result.success) {
      console.error('[Phase2Retry] AI analysis failed:', phase2Result.error)
      await supabase
        .from('assessments')
        .update({ phase2_started_at: null })
        .eq('id', assessmentId)
      return NextResponse.json(
        { error: phase2Result.error || 'AI analysis failed. Please try again.' },
        { status: 503 }
      )
    }

    const phase2 = phase2Result.data

    // Merge with existing report_data
    const existingReportData = assessment.report_data || {}
    const fullReportData = { ...existingReportData, ...phase2, generationPhase: 2 }

    const { error: saveError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        generation_phase: 2,
        phase2_started_at: null,
        report_data: fullReportData,
        passion_projects: phase2.passionProjects || null,
        academic_courses_recommendations: phase2.academicCoursesRecommendations || null,
        sat_act_goals: phase2.satActGoals || null,
        research_publications_recommendations: phase2.researchPublicationsRecommendations || null,
        leadership_recommendations: phase2.leadershipRecommendations || null,
        service_community_recommendations: phase2.serviceCommunityRecommendations || null,
        summer_ivy_programs_recommendations: phase2.summerIvyProgramsRecommendations || null,
        sports_recommendations: phase2.sportsRecommendations || null,
        competitions_recommendations: phase2.competitionsRecommendations || null,
        student_government_recommendations: phase2.studentGovernmentRecommendations || null,
        internships_recommendations: phase2.internshipsRecommendations || null,
        culture_arts_recommendations: phase2.cultureArtsRecommendations || null,
        career_recommendations: phase2.careerRecommendations || null,
        college_recommendations: phase2.collegeRecommendations || null,
        mentor_recommendations: phase2.mentorRecommendations || null,
        waste_of_time_activities: phase2.wasteOfTimeActivities || null,
        scholarship_recommendations: phase2.scholarshipRecommendations || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (saveError) {
      console.error('[Phase2Retry] Failed to save:', saveError)
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
    }

    console.log(`[Phase2Retry] Phase 2 complete for assessment ${assessmentId}`)

    // Send emails + webhooks
    if (assessment.organization_id) {
      const student = assessment.student as { email?: string; first_name?: string; last_name?: string } | null
      webhookEvents.assessmentCompleted(assessment.organization_id, {
        assessmentId: assessment.id,
        studentEmail: student?.email || '',
        studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
        archetype: assessment.student_archetype || 'Unknown',
        competitivenessScore: assessment.competitiveness_score || 0,
        reportUrl: buildResultsUrl(assessment.id),
      }).catch((err) => console.error('Webhook delivery failed:', err))
    }

    const student = assessment.student as {
      email?: string
      first_name?: string
      last_name?: string
      parent_email?: string
    } | null

    const org = assessment.organization as {
      name?: string
      primary_color?: string
      secondary_color?: string
      logo_url?: string
      custom_email_from?: string
      custom_email_reply_to?: string
    } | null

    if (student?.email) {
      const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student'
      sendStudentResultsEmail(
        student.email,
        studentName,
        assessment.student_archetype || 'Your Archetype',
        assessmentId,
        fullReportData,
        {
          orgName: org?.name,
          primaryColor: org?.primary_color,
          secondaryColor: org?.secondary_color,
          logoUrl: org?.logo_url,
          fromName: org?.custom_email_from || org?.name,
          replyTo: org?.custom_email_reply_to,
        }
      ).catch((err) => console.error('Failed to send results email:', err))

      if (student.parent_email) {
        sendParentEmail(
          student.parent_email,
          studentName,
          assessment.student_archetype || 'Your Archetype',
          assessmentId,
          fullReportData
        ).catch((err) => console.error('Failed to send parent email:', err))
      }
    }

    return NextResponse.json({ success: true, status: 'completed' })

  } catch (error) {
    console.error('[Phase2Retry] Error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// Reuse the same Claude caller pattern from submit route
interface CallClaudeSuccess {
  success: true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}
interface CallClaudeFailure {
  success: false
  error: string
}

async function callClaude(
  prompt: string,
  maxTokens: number,
  timeoutMs: number,
  requiredFields: string[]
): Promise<CallClaudeSuccess | CallClaudeFailure> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return { success: false, error: 'AI analysis failed - no API key configured' }
  }

  const MAX_RETRIES = 2
  let lastError: unknown = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = new Anthropic({ apiKey })
      const response = await Promise.race([
        client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Claude API timeout after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ])

      const textBlock = response.content.find(block => block.type === 'text')
      const content = textBlock?.text || ''

      if (!content.trim()) {
        lastError = new Error('Empty response')
        continue
      }

      const result = parseClaudeResponse(content, requiredFields)
      if (!result.success) {
        lastError = new Error(result.error)
        continue
      }

      return { success: true, data: result.data }
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Claude API error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, message)

      const isTransient = message.includes('529') ||
        message.includes('429') ||
        message.includes('ECONNRESET') ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('overloaded')

      if (!isTransient || attempt === MAX_RETRIES) break
      await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
    }
  }

  return { success: false, error: 'AI analysis failed. Please try again in a moment.' }
}
