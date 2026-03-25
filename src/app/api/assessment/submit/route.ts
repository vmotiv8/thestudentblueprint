import { NextResponse, after } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import {
  buildStudentProfileContext,
  sanitizeForPrompt,
} from '@/lib/assessment-prompts'

// Allow up to 5 minutes for AI analysis
export const maxDuration = 540

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { assessmentId, formData: providedFormData, reanalyze, organization_slug } = body
    const supabase = createServerSupabaseClient()

    const organization = organization_slug
      ? await getOrganizationBySlug(organization_slug)
      : await getDefaultOrganization()

    // Auth check for reanalyze
    if (reanalyze) {
      const cookieStore = await cookies()
      const adminId = cookieStore.get('admin_session')?.value
      if (!adminId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      const { data: admin, error: adminError } = await supabase
        .from('admins').select('id, is_active').eq('id', adminId).single()
      if (adminError || !admin?.is_active) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let formData = providedFormData

    if (reanalyze || !formData) {
      let fetchQuery = supabase.from('assessments').select('responses, payment_status').eq('id', assessmentId)
      if (!reanalyze && organization) fetchQuery = fetchQuery.eq('organization_id', organization.id)
      const { data: existing, error: fetchError } = await fetchQuery.single()
      if (fetchError || !existing) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      if (!reanalyze && existing.payment_status !== 'paid' && existing.payment_status !== 'free') {
        return NextResponse.json({ error: 'Payment required' }, { status: 402 })
      }
      formData = existing.responses
      if (!formData || typeof formData !== 'object') {
        return NextResponse.json({ error: 'Assessment has no saved responses' }, { status: 400 })
      }
    } else if (!reanalyze) {
      const { data: paymentCheck } = await supabase.from('assessments').select('payment_status').eq('id', assessmentId).single()
      if (paymentCheck && paymentCheck.payment_status !== 'paid' && paymentCheck.payment_status !== 'free') {
        return NextResponse.json({ error: 'Payment required' }, { status: 402 })
      }
    }

    // Save responses before AI analysis
    if (!reanalyze && formData) {
      await supabase.from('assessments')
        .update({ responses: formData, status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', assessmentId)
    }

    // Fetch knowledge hub resources
    let knowledgeHubResources: { type: string; title: string; description: string | null }[] = []
    if (organization?.id) {
      const { data: khData } = await supabase
        .from('knowledge_hub_resources').select('type, title, description').eq('organization_id', organization.id)
      knowledgeHubResources = khData || []
    }

    // ── Build student context (shared across all phases) ────────────────
    const { context: studentContext, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
    const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
    const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
    const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

    const GUIDELINES = `
IMPORTANT GUIDELINES:
1. If the student is from India, include local Indian competitions, hackathons, and opportunities.
2. If planning to study abroad, tailor recommendations to target countries.
3. Tailor to the student's location and curriculum (${curriculum}).
4. If school-specific resources are listed, PRIORITIZE those in recommendations.`

    const SYSTEM = `You are an expert college admissions counselor specializing in Ivy League and Top 20 admissions with 15+ years of experience. Your recommendations MUST be specific, actionable, and prestigious. Respond ONLY with valid JSON, no additional text.`

    console.log('[Submit] Starting multi-phase analysis for assessment', assessmentId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allResults: Record<string, any> = {}

    // ── PHASE 1: Core Analysis (archetype, scores, strengths, gaps, roadmap, essays) ──
    const phase1 = await callClaude(`${SYSTEM}

Analyze this student profile:

${studentContext}
${GUIDELINES}

Generate JSON with these fields:
{
  "studentArchetype": "Unique 2-3 word descriptor",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": 0-100,
  "strengthsAnalysis": { "competitiveAdvantages": ["3 items"], "uniqueDifferentiators": ["2-3 items"], "alignedActivities": ["items"] },
  "gapAnalysis": { "missingElements": ["3-4 items"], "activitiesToDeepen": ["2-3 items"], "skillsToDevelope": ["3-4 items"] },
  "roadmap": { "immediate": ["4-5 actions for next 3 months"], "shortTerm": ["4-5 goals for 3-6 months"], "mediumTerm": ["4-5 projects for 6-12 months"], "longTerm": ["4-5 items for 1+ years"] },
  "gradeByGradeRoadmap": { "currentGrade": { "grade": "${currentGrade}", "focus": "string", "academics": ["3-4"], "extracurriculars": ["3-4"], "testing": ["2-3"], "leadership": ["2-3"], "summerPlan": "string" }, "nextYears": [{ same structure per year until graduation }] },
  "essayBrainstorm": [{ "title": "5-8 words", "hook": "vivid opening sentence", "narrative": "3-4 sentence arc", "connectingThreads": ["3-5 profile elements"], "whyItWorks": "2-3 sentences" }]
}

Generate exactly 5 essay ideas. Each must connect 3+ aspects of the student's profile.`, 8000, 120000)

    if (!phase1.success) {
      console.error('[Submit] Phase 1 failed:', phase1.error)
      return NextResponse.json({ error: phase1.error }, { status: 503 })
    }
    Object.assign(allResults, phase1.data)
    console.log('[Submit] Phase 1 complete — archetype:', phase1.data.studentArchetype)

    // Save Phase 1 immediately so student sees core results
    await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')

    // ── PHASE 2: Academic & Testing Recommendations ─────────────────────
    const phase2 = await callClaude(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate JSON with ONLY these fields:
{
  "academicCoursesRecommendations": { "apCourses": ["4-5 with reasoning"], "ibCourses": ["if applicable"], "honorsCourses": ["3-4"], "electivesRecommended": ["3-4"] },
  "satActGoals": { "targetSATScore": "score", "satSectionGoals": { "reading": "", "writing": "", "math": "" }, "targetACTScore": "score", "actSectionGoals": { "english": "", "math": "", "reading": "", "science": "" }, "prepStrategy": "string", "timeline": "string" },
  "collegeRecommendations": { "collegeBreakdown": { "reach": ["3"], "target": ["3"], "safety": ["3"] }, "schoolMatches": [{ "schoolName": "", "matchScore": 0-100, "why": "" }] },
  "scholarshipRecommendations": { "scholarships": [{ "name": "", "organization": "", "amount": "", "deadline": "", "why": "", "url": "" }] },
  "careerRecommendations": { "jobTitles": ["3"], "blueOceanIndustries": [{ "industry": "", "why": "" }], "salaryPotential": "", "linkedInBioHeadline": "" }
}

Generate at least 6 school matches and 4 scholarships.`, 8000, 120000)

    if (phase2.success) {
      Object.assign(allResults, phase2.data)
      console.log('[Submit] Phase 2 complete — colleges, academics, testing')
      await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')
    } else {
      console.error('[Submit] Phase 2 failed (non-fatal):', phase2.error)
    }

    // ── PHASE 3: Activities & Leadership Recommendations ────────────────
    const phase3 = await callClaude(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate JSON with ONLY these fields:
{
  "passionProjects": [{ "title": "", "description": "", "timeCommitment": "", "skillsDeveloped": ["3-4"], "applicationImpact": "", "resources": "", "implementationSteps": ["4-5"] }],
  "leadershipRecommendations": { "clubLeadership": ["3-4"], "schoolWideRoles": ["2-3"], "communityLeadership": ["3-4"], "leadershipDevelopment": ["4-5"] },
  "serviceCommunityRecommendations": { "localOpportunities": ["4-5"], "nationalPrograms": ["3-4"], "internationalService": ["2-3"], "sustainedCommitment": ["3-4"] },
  "studentGovernmentRecommendations": { "schoolGovernment": ["3-4"], "districtStateRoles": ["2-3"], "youthGovernment": ["3-4"], "advocacyRoles": ["3-4"] },
  "mentorRecommendations": { "mentors": [{ "name": "Dr. Name", "university": "", "department": "", "why": "" }] },
  "wasteOfTimeActivities": { "activities": [{ "activity": "", "whyQuit": "" }] }
}

Generate at least 3 passion projects.`, 8000, 120000)

    if (phase3.success) {
      Object.assign(allResults, phase3.data)
      console.log('[Submit] Phase 3 complete — projects, leadership, mentors')
      await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')
    } else {
      console.error('[Submit] Phase 3 failed (non-fatal):', phase3.error)
    }

    // ── PHASE 4: Extracurricular & Research Recommendations ─────────────
    const phase4 = await callClaude(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate JSON with ONLY these fields:
{
  "researchPublicationsRecommendations": { "researchTopics": ["4-5"], "publicationOpportunities": ["3-4"], "mentorshipSuggestions": ["3-4"], "timeline": "" },
  "summerIvyProgramsRecommendations": { "preFreshmanPrograms": ["3-4"], "competitivePrograms": ["4-5"], "researchPrograms": ["4-5"], "enrichmentPrograms": ["3-4"] },
  "sportsRecommendations": { "varsitySports": ["2-3"], "clubSports": ["2-3"], "recruitingStrategy": ["3-4"], "fitnessLeadership": ["2-3"] },
  "competitionsRecommendations": { "academicCompetitions": ["5-6"], "businessCompetitions": ["4-5"], "artsCompetitions": ["4-5"], "debateSpeech": ["4-5"] },
  "internshipsRecommendations": { "industryInternships": ["4-5"], "researchInternships": ["4-5"], "nonprofitInternships": ["3-4"], "virtualOpportunities": ["3-4"] },
  "cultureArtsRecommendations": { "performingArts": ["3-4"], "visualArts": ["3-4"], "creativeWriting": ["4-5"], "culturalClubs": ["3-4"] }
}`, 8000, 120000)

    if (phase4.success) {
      Object.assign(allResults, phase4.data)
      console.log('[Submit] Phase 4 complete — research, competitions, arts')
    } else {
      console.error('[Submit] Phase 4 failed (non-fatal):', phase4.error)
    }

    // ── Final save with status 'completed' ──────────────────────────────
    await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'completed')
    console.log('[Submit] All phases complete for assessment', assessmentId)

    // ── Emails & webhooks in background ─────────────────────────────────
    try {
      after(async () => {
        try {
          const { data: assessment } = await supabase
            .from('assessments')
            .select('*, student:students(*), organization:organizations(*)')
            .eq('id', assessmentId)
            .single()
          if (!assessment) return

          if (assessment.organization_id) {
            const student = assessment.student as { email?: string; first_name?: string; last_name?: string } | null
            webhookEvents.assessmentCompleted(assessment.organization_id, {
              assessmentId: assessment.id,
              studentEmail: student?.email || '',
              studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
              archetype: allResults.studentArchetype || 'Unknown',
              competitivenessScore: allResults.competitivenessScore || 0,
              reportUrl: buildResultsUrl(assessment.id),
            }).catch(err => console.error('Webhook failed:', err))
          }

          const student = assessment.student as { email?: string; first_name?: string; last_name?: string; parent_email?: string } | null
          const org = assessment.organization as { name?: string; primary_color?: string; secondary_color?: string; logo_url?: string; custom_email_from?: string; custom_email_reply_to?: string } | null

          if (student?.email) {
            const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student'
            sendStudentResultsEmail(student.email, name, allResults.studentArchetype || 'Your Archetype', assessmentId, allResults, {
              orgName: org?.name, primaryColor: org?.primary_color, secondaryColor: org?.secondary_color,
              logoUrl: org?.logo_url, fromName: org?.custom_email_from || org?.name, replyTo: org?.custom_email_reply_to,
            }).catch(err => console.error('Results email failed:', err))
            if (student.parent_email) {
              sendParentEmail(student.parent_email, name, allResults.studentArchetype || 'Your Archetype', assessmentId, allResults)
                .catch(err => console.error('Parent email failed:', err))
            }
          }
        } catch (err) { console.error('[Submit] Background error:', err) }
      })
    } catch { console.warn('[Submit] after() unavailable') }

    return NextResponse.json({ success: true, assessmentId })

  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string }
    const msg = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[Submit] Error:', { message: msg, code: err.code, details: err.details })
    return NextResponse.json({ error: `Failed to submit: ${msg}` }, { status: 500 })
  }
}

// ── Save results to DB (called after each phase) ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function savePartialResults(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  assessmentId: string,
  orgId: string | undefined,
  reanalyze: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: Record<string, any>,
  status: 'partial' | 'completed'
) {
  const update: Record<string, unknown> = {
    status,
    report_data: results,
    student_archetype: results.studentArchetype || null,
    archetype_scores: results.archetypeScores || null,
    competitiveness_score: results.competitivenessScore ?? null,
    scores: results.competitivenessScore != null ? {
      competitivenessScore: results.competitivenessScore,
      archetypeScores: results.archetypeScores,
    } : undefined,
    roadmap_data: results.roadmap || null,
    strengths_analysis: results.strengthsAnalysis || null,
    gap_analysis: results.gapAnalysis || null,
    grade_by_grade_roadmap: results.gradeByGradeRoadmap || null,
    passion_projects: results.passionProjects || null,
    academic_courses_recommendations: results.academicCoursesRecommendations || null,
    sat_act_goals: results.satActGoals || null,
    research_publications_recommendations: results.researchPublicationsRecommendations || null,
    leadership_recommendations: results.leadershipRecommendations || null,
    service_community_recommendations: results.serviceCommunityRecommendations || null,
    summer_ivy_programs_recommendations: results.summerIvyProgramsRecommendations || null,
    sports_recommendations: results.sportsRecommendations || null,
    competitions_recommendations: results.competitionsRecommendations || null,
    student_government_recommendations: results.studentGovernmentRecommendations || null,
    internships_recommendations: results.internshipsRecommendations || null,
    culture_arts_recommendations: results.cultureArtsRecommendations || null,
    career_recommendations: results.careerRecommendations || null,
    college_recommendations: results.collegeRecommendations || null,
    mentor_recommendations: results.mentorRecommendations || null,
    waste_of_time_activities: results.wasteOfTimeActivities || null,
    scholarship_recommendations: results.scholarshipRecommendations || null,
    updated_at: new Date().toISOString(),
  }

  if (status === 'completed') {
    update.completed_at = new Date().toISOString()
  }

  // Remove undefined values
  Object.keys(update).forEach(k => { if (update[k] === undefined) delete update[k] })

  let query = supabase.from('assessments').update(update).eq('id', assessmentId)
  if (!reanalyze && orgId) query = query.eq('organization_id', orgId)

  const { error } = await query
  if (error) {
    // If 'partial' status fails (CHECK constraint), retry with 'in_progress'
    if (status === 'partial' && (error.message?.includes('check') || error.code === '23514')) {
      update.status = 'in_progress'
      let retryQuery = supabase.from('assessments').update(update).eq('id', assessmentId)
      if (!reanalyze && orgId) retryQuery = retryQuery.eq('organization_id', orgId)
      const { error: retryErr } = await retryQuery
      if (retryErr) console.error('[Submit] Partial save retry failed:', retryErr.message)
    } else {
      console.error('[Submit] Save failed:', error.message)
    }
  }
}

// ── Claude API caller with retry ────────────────────────────────────────

async function callClaude(
  prompt: string,
  maxTokens: number,
  timeoutMs: number,
): Promise<{ success: true; data: Record<string, unknown> } | { success: false; error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { success: false, error: 'No API key configured' }

  const MAX_RETRIES = 2

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
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ])

      const textBlock = response.content.find(b => b.type === 'text')
      const content = textBlock?.text || ''

      if (response.stop_reason === 'max_tokens') {
        console.warn(`[Claude] Output truncated at max_tokens (attempt ${attempt + 1}), ${content.length} chars`)
      }

      if (!content.trim()) { console.error(`[Claude] Empty (attempt ${attempt + 1})`); continue }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) { console.error(`[Claude] Non-JSON (attempt ${attempt + 1}):`, content.slice(0, 200)); continue }

      try {
        return { success: true, data: JSON.parse(jsonMatch[0]) }
      } catch {
        console.error(`[Claude] Bad JSON (attempt ${attempt + 1}), length: ${jsonMatch[0].length}`)
        continue
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`[Claude] Error (attempt ${attempt + 1}):`, msg)
      const isTransient = /529|429|ECONNRESET|timeout|network|overloaded/.test(msg)
      if (!isTransient || attempt === MAX_RETRIES) break
      await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
    }
  }

  return { success: false, error: 'AI analysis failed. Please try again in a moment.' }
}
