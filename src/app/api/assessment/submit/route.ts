import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { enqueuePhase } from '@/lib/qstash'

// 300s for sync fallback when QStash is unavailable
export const maxDuration = 300

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

    // Save responses and set status to in_progress
    const submitUpdate: Record<string, unknown> = {
      responses: formData,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    }
    // Try with phase_status, fall back without if column doesn't exist yet
    submitUpdate.phase_status = { phase1: 'pending', phase2: 'pending', phase3: 'pending', phase4: 'pending' }
    const { error: saveErr } = await supabase.from('assessments').update(submitUpdate).eq('id', assessmentId)
    if (saveErr?.message?.includes('phase_status')) {
      delete submitUpdate.phase_status
      await supabase.from('assessments').update(submitUpdate).eq('id', assessmentId)
    }

    console.log(`[Submit] Assessment ${assessmentId} saved, enqueueing Phase 1`)

    // Try QStash async pipeline first
    let qstashWorked = false
    try {
      await enqueuePhase(assessmentId, 1)
      qstashWorked = true
      console.log(`[Submit] Phase 1 enqueued via QStash for ${assessmentId}`)
    } catch (qstashError) {
      console.error('[Submit] QStash unavailable, running sync fallback:', (qstashError as Error).message)
    }

    // If QStash worked, return immediately — phases run async
    if (qstashWorked) {
      return NextResponse.json({ success: true, assessmentId })
    }

    // ── SYNC FALLBACK: Run all 4 phases in-process (old behavior) ──────
    const { callAI } = await import('@/lib/ai-caller')
    const { buildStudentProfileContext, sanitizeForPrompt } = await import('@/lib/assessment-prompts')
    const { fetchKnowledgeHubWithContent } = await import('@/lib/knowledge-hub-content')
    const { savePhaseResults } = await import('@/lib/assessment-save')
    const { after } = await import('next/server')
    const { webhookEvents } = await import('@/lib/organization/webhooks')
    const { buildResultsUrl } = await import('@/lib/url')
    const { sendStudentResultsEmail, sendParentEmail } = await import('@/lib/resend')

    const knowledgeHubResources = organization?.id
      ? await fetchKnowledgeHubWithContent(organization.id)
      : []

    const { context: studentContext, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
    const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
    const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
    const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

    const SYSTEM = `You are an elite college admissions strategist who has placed 500+ students into Harvard, Stanford, MIT, Yale, Princeton, and other Top 20 universities. Every recommendation must be SPECIFIC (name real programs, professors, competitions), ACTIONABLE (concrete next steps), and AMBITIOUS. Respond ONLY with valid JSON, no additional text.`
    const GUIDELINES = `
IMPORTANT GUIDELINES:
1. If the student is from India, include local Indian competitions, hackathons, and opportunities.
2. If planning to study abroad, tailor recommendations to target countries.
3. Tailor to the student's location and curriculum (${curriculum}).
4. If school-specific resources are listed, PRIORITIZE those in recommendations.`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allResults: Record<string, any> = {}

    // Phase 1: Core Analysis
    console.log(`[Submit/Sync] Phase 1 starting for ${assessmentId}`)
    const phase1 = await callAI(`${SYSTEM}

Analyze this student and produce a brutally honest analysis:

${studentContext}
${GUIDELINES}

Generate JSON:
{
  "studentArchetype": "Unique 2-3 word archetype",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100,
  "strengthsAnalysis": { "competitiveAdvantages": ["5-6 items"], "uniqueDifferentiators": ["3-4 items"], "alignedActivities": ["4-5 items"] },
  "gapAnalysis": { "missingElements": ["EXACTLY 10 brutally honest gaps"], "activitiesToDeepen": ["3-4 items"], "skillsToDevelope": ["EXACTLY 10 skills — at least 5 AI skills"], "vulnerabilities": ["3-4 items"] },
  "roadmap": { "immediate": ["6-8 items"], "shortTerm": ["6-8 items"], "mediumTerm": ["5-6 items"], "longTerm": ["5-6 items"] },
  "gradeByGradeRoadmap": { "currentGrade": { "grade": "${currentGrade}", "focus": "focus", "academics": [], "extracurriculars": [], "testing": [], "leadership": [], "summerPlan": "plan" }, "nextYears": [] },
  "essayBrainstorm": [{ "title": "title", "hook": "hook", "narrative": "narrative", "connectingThreads": [], "whyItWorks": "why" }]
}
Generate exactly 5 essay ideas.`, 16000, 120000)

    if (!phase1.success) {
      console.error(`[Submit/Sync] Phase 1 failed:`, phase1.error)
      return NextResponse.json({ error: phase1.error || 'AI analysis failed. Please try again.' }, { status: 503 })
    }
    Object.assign(allResults, phase1.data)
    console.log(`[Submit/Sync] Phase 1 done — ${allResults.studentArchetype}`)
    await savePhaseResults(assessmentId, allResults, 'partial')

    // Phase 2: Academics, Testing, Colleges, Career
    console.log(`[Submit/Sync] Phase 2 starting`)
    const phase2 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON:
{
  "academicCoursesRecommendations": { "apCourses": [], "ibCourses": [], "curriculumSpecificCourses": {"label": "curriculum", "courses": []}, "honorsCourses": [], "electivesRecommended": [] },
  "satActGoals": { "targetSATScore": "", "satSectionGoals": {"reading":"","math":""}, "targetACTScore": "", "actSectionGoals": {"english":"","math":"","reading":"","science":""}, "prepStrategy": "", "timeline": "" },
  "collegeRecommendations": { "collegeBreakdown": { "reach": ["10 schools"], "target": ["10 schools"], "safety": ["10 schools"] }, "schoolMatches": [{"schoolName":"","matchScore":0,"why":""}] },
  "careerRecommendations": { "jobTitles": [], "blueOceanIndustries": [{"industry":"","why":""}], "salaryPotential": "", "linkedInBioHeadline": "" }
}
Generate 12+ schoolMatches.`, 16000, 60000)
    if (phase2.success) { Object.assign(allResults, phase2.data); await savePhaseResults(assessmentId, allResults, 'partial') }
    else console.error(`[Submit/Sync] Phase 2 failed (non-fatal):`, phase2.error)

    // Phase 3: Projects, Research, Mentors
    console.log(`[Submit/Sync] Phase 3 starting`)
    const phase3 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON:
{
  "passionProjects": [{"title":"","description":"","timeCommitment":"","skillsDeveloped":[],"applicationImpact":"","resources":"","implementationSteps":[]}],
  "researchPublicationsRecommendations": { "researchTopics": [], "publicationOpportunities": [], "mentorshipSuggestions": [], "timeline": "" },
  "mentorRecommendations": { "mentors": [{"name":"","university":"","department":"","why":""}] },
  "wasteOfTimeActivities": { "activities": [{"activity":"","whyQuit":""}] }
}
Generate exactly 3 passion projects. Generate 5+ mentors.`, 10000, 60000)
    if (phase3.success) { Object.assign(allResults, phase3.data); await savePhaseResults(assessmentId, allResults, 'partial') }
    else console.error(`[Submit/Sync] Phase 3 failed (non-fatal):`, phase3.error)

    // Phase 4: Activities, Competitions, Summer Programs
    console.log(`[Submit/Sync] Phase 4 starting`)
    const phase4 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON with each activity as {name, description, dates, relevance}:
{
  "summerIvyProgramsRecommendations": { "preFreshmanPrograms": [], "competitivePrograms": [], "researchPrograms": [], "enrichmentPrograms": [] },
  "sportsRecommendations": { "varsitySports": [], "clubSports": [], "recruitingStrategy": [], "fitnessLeadership": [] },
  "competitionsRecommendations": { "academicCompetitions": [], "businessCompetitions": [], "artsCompetitions": [], "debateSpeech": [] },
  "internshipsRecommendations": { "industryInternships": [], "researchInternships": [], "nonprofitInternships": [], "virtualOpportunities": [] },
  "serviceCommunityRecommendations": { "localOpportunities": [], "nationalPrograms": [], "internationalService": [], "sustainedCommitment": [] },
  "cultureArtsRecommendations": { "performingArts": [], "visualArts": [], "creativeWriting": [], "culturalClubs": [] },
  "leadershipRecommendations": { "clubLeadership": [], "schoolWideRoles": [], "communityLeadership": [], "leadershipDevelopment": [] }
}
Be SPECIFIC — name real programs, competitions, deadlines.`, 12000, 60000)
    if (phase4.success) { Object.assign(allResults, phase4.data) }
    else console.error(`[Submit/Sync] Phase 4 failed (non-fatal):`, phase4.error)

    // Final save
    await savePhaseResults(assessmentId, allResults, 'completed')
    console.log(`[Submit/Sync] All phases complete for ${assessmentId}`)

    // Background emails & webhooks
    try {
      after(async () => {
        try {
          const supabaseInner = (await import('@/lib/supabase')).createServerSupabaseClient()
          const { data: assessment } = await supabaseInner
            .from('assessments').select('*, student:students(*), organization:organizations(*)').eq('id', assessmentId).single()
          if (!assessment) return
          if (assessment.organization_id) {
            const student = assessment.student as { email?: string; first_name?: string; last_name?: string } | null
            webhookEvents.assessmentCompleted(assessment.organization_id, {
              assessmentId: assessment.id, studentEmail: student?.email || '',
              studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
              archetype: allResults.studentArchetype || 'Unknown', competitivenessScore: allResults.competitivenessScore || 0,
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
        } catch (err) { console.error('[Submit/Sync] Background error:', err) }
      })
    } catch { /* after() unavailable */ }

    return NextResponse.json({ success: true, assessmentId })

  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string }
    const msg = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[Submit] Error:', { message: msg, code: err.code, details: err.details })
    return NextResponse.json({ error: 'Failed to submit assessment. Please try again.' }, { status: 500 })
  }
}
