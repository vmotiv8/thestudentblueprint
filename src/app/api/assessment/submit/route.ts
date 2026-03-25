import { NextResponse, after } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import {
  buildPhase1Prompt,
  buildPhase2Prompt,
  parseClaudeResponse,
  PHASE_1_REQUIRED_FIELDS,
  PHASE_2_REQUIRED_FIELDS,
} from '@/lib/assessment-prompts'

// Allow up to 5 minutes for AI analysis
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { assessmentId, formData: providedFormData, reanalyze, organization_slug } = body
    const supabase = createServerSupabaseClient()

    // Resolve organization for scoping (skip for admin reanalyze)
    const organization = organization_slug
      ? await getOrganizationBySlug(organization_slug)
      : await getDefaultOrganization()

    // Auth check: reanalyze requires an active admin session
    if (reanalyze) {
      const cookieStore = await cookies()
      const adminId = cookieStore.get('admin_session')?.value

      if (!adminId) {
        return NextResponse.json(
          { error: 'Authentication required for re-analysis' },
          { status: 401 }
        )
      }

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, is_active')
        .eq('id', adminId)
        .single()

      if (adminError || !admin || !admin.is_active) {
        return NextResponse.json(
          { error: 'Unauthorized: admin not found or inactive' },
          { status: 401 }
        )
      }
    }

    let formData = providedFormData

    if (reanalyze || !formData) {
      let fetchQuery = supabase
        .from('assessments')
        .select('responses, payment_status')
        .eq('id', assessmentId)

      if (!reanalyze && organization) {
        fetchQuery = fetchQuery.eq('organization_id', organization.id)
      }

      const { data: existingAssessment, error: fetchError } = await fetchQuery.single()

      if (fetchError || !existingAssessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }

      // Enforce payment before submission (skip for admin reanalyze)
      if (!reanalyze && existingAssessment.payment_status !== 'paid' && existingAssessment.payment_status !== 'free') {
        return NextResponse.json(
          { error: 'Payment required before submitting the assessment' },
          { status: 402 }
        )
      }

      formData = existingAssessment.responses
    } else {
      // When formData is provided directly, still verify payment
      if (!reanalyze) {
        const { data: paymentCheck } = await supabase
          .from('assessments')
          .select('payment_status')
          .eq('id', assessmentId)
          .single()

        if (paymentCheck && paymentCheck.payment_status !== 'paid' && paymentCheck.payment_status !== 'free') {
          return NextResponse.json(
            { error: 'Payment required before submitting the assessment' },
            { status: 402 }
          )
        }
      }
    }

    // Save responses immediately before AI analysis to prevent data loss
    if (!reanalyze && formData) {
      await supabase
        .from('assessments')
        .update({ responses: formData, status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', assessmentId)
    }

    // Fetch knowledge hub resources for the organization to enrich the AI prompt
    let knowledgeHubResources: { type: string; title: string; description: string | null }[] = []
    if (organization?.id) {
      const { data: khData } = await supabase
        .from('knowledge_hub_resources')
        .select('type, title, description')
        .eq('organization_id', organization.id)
      knowledgeHubResources = khData || []
    }

    // ── Phase 1: Core Analysis ──────────────────────────────────────────
    console.log('[Submit] Starting Phase 1 for assessment', assessmentId, 'formData keys:', Object.keys(formData || {}))

    let phase1Prompt: string
    try {
      phase1Prompt = buildPhase1Prompt(formData, knowledgeHubResources)
    } catch (promptErr) {
      console.error('[Submit] Failed to build Phase 1 prompt:', promptErr)
      return NextResponse.json({ error: 'Failed to build analysis prompt' }, { status: 500 })
    }

    const phase1Result = await callClaude(
      phase1Prompt,
      8000,
      90000,
      PHASE_1_REQUIRED_FIELDS
    )

    if (!phase1Result.success) {
      console.error('[Submit] Phase 1 AI analysis failed:', phase1Result.error)
      return NextResponse.json(
        { error: phase1Result.error || 'AI analysis failed. Please try again in a moment.' },
        { status: 503 }
      )
    }

    const phase1 = phase1Result.data

    // Save Phase 1 results to DB immediately
    const phase1Update: Record<string, unknown> = {
      status: 'partial',
      generation_phase: 1,
      phase2_started_at: new Date().toISOString(),
      scores: {
        competitivenessScore: phase1.competitivenessScore,
        archetypeScores: phase1.archetypeScores,
      },
      report_data: { ...phase1, generationPhase: 1 },
      student_archetype: phase1.studentArchetype || null,
      archetype_scores: phase1.archetypeScores || null,
      competitiveness_score: phase1.competitivenessScore ?? null,
      roadmap_data: phase1.roadmap || null,
      strengths_analysis: phase1.strengthsAnalysis || null,
      gap_analysis: phase1.gapAnalysis || null,
      grade_by_grade_roadmap: phase1.gradeByGradeRoadmap || null,
      updated_at: new Date().toISOString(),
    }

    let phase1Query = supabase
      .from('assessments')
      .update(phase1Update)
      .eq('id', assessmentId)

    if (!reanalyze && organization) {
      phase1Query = phase1Query.eq('organization_id', organization.id)
    }

    const { error: phase1SaveError } = await phase1Query

    if (phase1SaveError) {
      console.error('[Submit] Failed to save Phase 1 (attempt 1):', { message: phase1SaveError.message, code: phase1SaveError.code, details: phase1SaveError.details })
      // If it failed because of missing columns (migration not run), retry without them
      if (phase1SaveError.message?.includes('column') || phase1SaveError.code === '42703') {
        console.log('[Submit] Retrying Phase 1 save without new columns')
        delete phase1Update.generation_phase
        delete phase1Update.phase2_started_at
        const { error: retryError } = await supabase
          .from('assessments')
          .update(phase1Update)
          .eq('id', assessmentId)
        if (retryError) {
          console.error('[Submit] Phase 1 retry also failed:', retryError.message)
          throw retryError
        }
      } else {
        throw phase1SaveError
      }
    }

    console.log('[Submit] Phase 1 saved successfully, starting Phase 2 in background')

    // ── Phase 2: Run in background via after() ──────────────────────────
    try {
    after(async () => {
      try {
        console.log(`[Submit] Starting Phase 2 for assessment ${assessmentId}`)

        const phase1Summary = {
          studentArchetype: phase1.studentArchetype || 'Unknown',
          competitivenessScore: phase1.competitivenessScore || 0,
          topStrengths: phase1.strengthsAnalysis?.competitiveAdvantages?.slice(0, 3) || [],
        }

        const phase2Result = await callClaude(
          buildPhase2Prompt(formData, knowledgeHubResources, phase1Summary),
          12000,
          120000,
          PHASE_2_REQUIRED_FIELDS
        )

        if (!phase2Result.success) {
          console.error('[Submit] Phase 2 failed:', phase2Result.error)
          // Clear phase2_started_at so retry endpoint knows it failed
          await supabase
            .from('assessments')
            .update({ phase2_started_at: null })
            .eq('id', assessmentId)
          return
        }

        const phase2 = phase2Result.data

        // Merge Phase 1 + Phase 2 into complete report_data
        const fullReportData = { ...phase1, ...phase2, generationPhase: 2 }

        const phase2Update: Record<string, unknown> = {
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
        }

        const { data: assessment, error: phase2SaveError } = await supabase
          .from('assessments')
          .update(phase2Update)
          .eq('id', assessmentId)
          .select('*, student:students(*), organization:organizations(*)')
          .single()

        if (phase2SaveError) {
          console.error('[Submit] Failed to save Phase 2:', phase2SaveError)
          return
        }

        console.log(`[Submit] Phase 2 complete for assessment ${assessmentId}`)

        // Send emails + webhooks now that full report is ready
        if (assessment.organization_id) {
          const student = assessment.student as { email?: string; first_name?: string; last_name?: string } | null
          webhookEvents.assessmentCompleted(assessment.organization_id, {
            assessmentId: assessment.id,
            studentEmail: student?.email || '',
            studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
            archetype: phase1.studentArchetype || 'Unknown',
            competitivenessScore: phase1.competitivenessScore || 0,
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
            phase1.studentArchetype || 'Your Archetype',
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
              phase1.studentArchetype || 'Your Archetype',
              assessmentId,
              fullReportData
            ).catch((err) => console.error('Failed to send parent email:', err))
          }
        }
      } catch (err) {
        console.error('[Submit] Phase 2 background error:', err)
        // Clear phase2_started_at so retry can work
        try {
          await supabase
            .from('assessments')
            .update({ phase2_started_at: null })
            .eq('id', assessmentId)
        } catch { /* ignore cleanup errors */ }
      }
    })
    } catch (afterErr) {
      console.error('[Submit] after() failed, Phase 2 will not run in background:', afterErr)
      // Phase 1 is already saved — student can still see partial results
      // Phase 2 can be triggered via the retry endpoint
    }

    // Return immediately after Phase 1 — client redirects to results
    return NextResponse.json({
      success: true,
      assessmentId,
      phase: 1,
    })

  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string }
    const msg = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[Submit] Error:', { message: msg, code: err.code, details: err.details })
    return NextResponse.json(
      { error: `Failed to submit: ${msg}` },
      { status: 500 }
    )
  }
}

// ── Claude API caller with retry logic ──────────────────────────────────

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
    console.error('No Anthropic API key found')
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
        console.error(`Claude returned empty response (attempt ${attempt + 1})`)
        lastError = new Error('Empty response')
        continue
      }

      const result = parseClaudeResponse(content, requiredFields)
      if (!result.success) {
        console.error(`Claude response validation failed (attempt ${attempt + 1}): ${result.error}`)
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

  console.error('Claude API failed after all retries:', {
    message: lastError instanceof Error ? lastError.message : String(lastError),
  })
  return { success: false, error: 'AI analysis failed. Please try again in a moment.' }
}
