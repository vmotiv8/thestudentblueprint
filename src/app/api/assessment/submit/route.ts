import { NextResponse, after } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import {
  buildStudentProfileContext,
  sanitizeForPrompt,
} from '@/lib/assessment-prompts'

// Allow up to 5 minutes for AI analysis
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

    const SYSTEM = `You are an elite college admissions strategist who has placed 500+ students into Harvard, Stanford, MIT, Yale, Princeton, and other Top 20 universities. You think at the level of a PhD advisor combined with a McKinsey consultant. Every recommendation must be SPECIFIC (name real programs, real professors, real competitions), ACTIONABLE (concrete next steps), and AMBITIOUS (push students beyond their comfort zone). Never give generic advice. Respond ONLY with valid JSON, no additional text.`

    console.log('[Submit] Starting multi-phase analysis for assessment', assessmentId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allResults: Record<string, any> = {}

    // ── PHASE 1: Core Analysis ──────────────────────────────────────────
    const phase1 = await callClaude(`${SYSTEM}

Analyze this student profile and produce a brutally honest, deeply insightful analysis:

${studentContext}
${GUIDELINES}

Generate JSON:
{
  "studentArchetype": "A unique 2-3 word archetype (e.g., 'Analytical Entrepreneur', 'Creative Humanitarian', 'Scientific Visionary')",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100 (be realistic — most students are 40-70, only nationally ranked students get 80+),
  "strengthsAnalysis": {
    "competitiveAdvantages": ["5-6 SPECIFIC advantages with concrete evidence from their profile — not generic. Reference their actual activities, grades, awards"],
    "uniqueDifferentiators": ["3-4 things that make this student genuinely different from other applicants — what's their 'spike'?"],
    "alignedActivities": ["4-5 current activities that directly support their college narrative"]
  },
  "gapAnalysis": {
    "missingElements": ["5-6 SPECIFIC gaps — be brutally honest. What would an admissions officer flag? Reference what top admits typically have that this student lacks"],
    "activitiesToDeepen": ["3-4 existing activities that need more depth/recognition/leadership — explain HOW to deepen each one"],
    "skillsToDevelope": ["4-5 specific skills with WHY each matters for their target schools and career path"]
  },
  "roadmap": {
    "immediate": ["6-8 highly specific actions for next 3 months — include deadlines, program names, specific steps. Each item should be 2-3 sentences"],
    "shortTerm": ["6-8 detailed goals for 3-6 months with milestones"],
    "mediumTerm": ["5-6 transformative projects/achievements for 6-12 months"],
    "longTerm": ["5-6 trajectory items for 1+ years leading to college applications"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "2-3 sentence strategic focus for this year",
      "academics": ["4-5 specific academic goals with course names"],
      "extracurriculars": ["4-5 specific extracurricular milestones"],
      "testing": ["3-4 testing milestones with target scores"],
      "leadership": ["3-4 leadership positions to pursue"],
      "summerPlan": "Detailed 3-4 sentence summer plan with specific programs"
    },
    "nextYears": [one entry per remaining year until 12th grade, same structure]
  },
  "essayBrainstorm": [
    {
      "title": "Compelling 5-8 word title",
      "hook": "A vivid, cinematic opening sentence that drops the reader into a specific moment. Must reference a REAL detail from the student's life.",
      "narrative": "4-5 sentence description of the full narrative arc — the specific moment, the tension/challenge, the turning point, and the insight that reveals character growth.",
      "connectingThreads": ["4-5 specific elements from the student's profile this essay weaves together"],
      "whyItWorks": "3-4 sentences on why Ivy admissions officers would be captivated — what character qualities emerge and why the structure is effective."
    }
  ]
}

CRITICAL: Generate exactly 5 essay ideas. Each MUST be deeply personal and connect 3+ profile elements. NO cliche topics (immigration stories, sports injuries, volunteer trips). Focus on specific, surprising moments.`, 16000, 120000)

    if (!phase1.success) {
      console.error('[Submit] Phase 1 failed:', phase1.error)
      return NextResponse.json({ error: phase1.error }, { status: 503 })
    }
    Object.assign(allResults, phase1.data)
    console.log('[Submit] Phase 1 complete — archetype:', phase1.data.studentArchetype)

    await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')

    // ── PHASE 2: Academics, Testing, Colleges, Career ───────────────────
    const phase2 = await callGemini(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Competitiveness: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON:
{
  "academicCoursesRecommendations": {
    "apCourses": ["6-8 specific AP courses, each with a 1-2 sentence explanation of WHY this course strengthens their application — e.g., 'AP Research: Essential for demonstrating independent scholarly work; aligns with your interest in biomedical engineering and lets you produce a publishable paper'"],
    "ibCourses": ["If applicable, 4-5 IB courses with reasoning. If student is not IB, write: 'Not applicable — focus on AP pathway'"],
    "honorsCourses": ["4-5 Honors courses that complement their AP choices"],
    "electivesRecommended": ["4-5 strategic electives that differentiate — e.g., 'Multivariable Calculus (if your school offers it)' or 'Independent Study in Machine Learning with a faculty sponsor'"]
  },
  "satActGoals": {
    "targetSATScore": "Specific target (e.g., '1520+')",
    "satSectionGoals": { "reading": "specific target with strategy", "writing": "specific target", "math": "specific target" },
    "targetACTScore": "Specific target (e.g., '35+')",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "3-4 sentence detailed prep plan — name specific resources (Khan Academy, College Panda, Erica Meltzer, etc.), study schedule, practice test cadence",
    "timeline": "Month-by-month testing timeline through senior year"
  },
  "collegeRecommendations": {
    "collegeBreakdown": {
      "reach": ["10 reach schools — include university name and 1-sentence reason it fits this student"],
      "target": ["10 target schools with reasons"],
      "safety": ["10 safety schools with reasons — these should still be good schools, not throwaway picks"]
    },
    "schoolMatches": [{"schoolName": "Full University Name", "matchScore": 0-100, "why": "2-3 sentence detailed explanation of fit — reference specific programs, professors, research labs, or campus culture elements"}]
  },
  "scholarshipRecommendations": {
    "scholarships": [{"name": "Real Scholarship Name", "organization": "Granting Org", "amount": "Dollar amount or range", "deadline": "Typical deadline month", "why": "Why this student specifically qualifies", "url": "Real URL if known, or 'Search [scholarship name]'"}]
  },
  "careerRecommendations": {
    "jobTitles": ["5 specific job titles that align with their interests and strengths — not just generic titles but specific roles (e.g., 'Product Manager at a Health-Tech Startup' not just 'Product Manager')"],
    "blueOceanIndustries": [{"industry": "Emerging industry name", "why": "2-3 sentences on why this is a blue ocean opportunity for this student specifically"}],
    "salaryPotential": "Realistic salary range with trajectory (entry → 5yr → 10yr)",
    "linkedInBioHeadline": "Professional headline optimized for networking"
  }
}

CRITICAL: Generate at least 12 schoolMatches with detailed why. Generate at least 20 scholarships with real names, real amounts, and real deadlines. Be specific — name real programs.`, 16000, 60000)

    if (phase2.success) {
      Object.assign(allResults, phase2.data)
      console.log('[Submit] Phase 2 complete — colleges, academics, testing, career')
      await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')
    } else {
      console.error('[Submit] Phase 2 failed (non-fatal):', phase2.error)
    }

    // ── PHASE 3: Projects, Mentors, Research ────────────────────────────
    const phase3 = await callGemini(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Competitiveness: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON:
{
  "passionProjects": [
    {
      "title": "Specific, compelling project title",
      "description": "4-5 sentence detailed description. These should be AMBITIOUS — think PhD-level research questions, startup-worthy ideas, or projects that could win national competitions. Not basic school projects.",
      "timeCommitment": "Specific hours per week and duration",
      "skillsDeveloped": ["5-6 specific skills including both technical and soft skills"],
      "applicationImpact": "3-4 sentences on how this project transforms their college application — which schools would love this, what narrative it builds",
      "resources": "Specific resources — name tools, platforms, mentors, funding sources",
      "implementationSteps": ["6-8 detailed step-by-step actions, each 1-2 sentences, with realistic timelines"]
    }
  ],
  "researchPublicationsRecommendations": {
    "researchTopics": ["5-7 SPECIFIC research topics at PhD level that haven't been fully explored but relate to the student's interests. Each should be 2-3 sentences describing the research question, methodology, and why it matters. Example: 'Investigating the correlation between social media algorithm exposure and adolescent decision-making using fMRI data — partner with a local university neuroscience lab'"],
    "publicationOpportunities": ["5-6 REAL journals and conferences where a high school student can publish — name specific publications (e.g., 'Journal of Emerging Investigators', 'Regeneron ISEF', 'Concord Review for humanities')"],
    "mentorshipSuggestions": ["4-5 specific strategies to find research mentors — include cold email templates, specific programs like RSI/PRIMES/Clark Scholars"],
    "timeline": "Detailed 3-4 sentence research timeline from finding a mentor through publication"
  },
  "mentorRecommendations": {
    "mentors": [
      {
        "name": "Real Professor Name (or 'Professor in [specific field]' if name unknown)",
        "university": "Nearby or relevant university — PRIORITIZE local state schools and community colleges in the student's area for realistic access",
        "department": "Specific department or lab",
        "why": "3-4 sentences on why this mentor is perfect — reference their research interests, how they connect to the student's goals, and a specific approach strategy"
      }
    ]
  },
  "wasteOfTimeActivities": {
    "activities": [{"activity": "Specific activity to stop or reduce", "whyQuit": "2-3 sentence honest explanation of why this doesn't help their application"}]
  }
}

CRITICAL: Generate 4-5 passion projects that are genuinely ambitious (startup-level, research-level, or competition-winning ideas). Generate 5+ research topics at PhD level. Generate 5+ mentor recommendations with specific professors from nearby universities.`, 10000, 60000)

    if (phase3.success) {
      Object.assign(allResults, phase3.data)
      console.log('[Submit] Phase 3 complete — projects, research, mentors')
      await savePartialResults(supabase, assessmentId, organization?.id, reanalyze, allResults, 'partial')
    } else {
      console.error('[Submit] Phase 3 failed (non-fatal):', phase3.error)
    }

    // ── PHASE 4: Activities, Competitions, Summer Programs ──────────────
    const phase4 = await callGemini(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Competitiveness: ${allResults.competitivenessScore}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON:
{
  "summerIvyProgramsRecommendations": {
    "preFreshmanPrograms": ["4-5 prestigious pre-college programs with full names, universities, selectivity level, and application deadlines"],
    "competitivePrograms": ["5-6 highly selective summer programs (e.g., RSI, TASP, MITES, Clark Scholars, SSP) with acceptance rates and why this student should apply"],
    "researchPrograms": ["5-6 summer research programs at universities with specific lab/department recommendations"],
    "enrichmentPrograms": ["4-5 enrichment programs aligned with student's interests"]
  },
  "sportsRecommendations": {
    "varsitySports": ["3-4 sports with specific strategic value for their application"],
    "clubSports": ["3-4 club/travel team options"],
    "recruitingStrategy": ["4-5 detailed recruiting tips if applicable"],
    "fitnessLeadership": ["3-4 leadership opportunities through athletics"]
  },
  "competitionsRecommendations": {
    "academicCompetitions": ["6-8 specific competitions with full names, websites, and difficulty level — e.g., 'USAMO (extremely competitive, for top 500 math students nationally)', 'Science Olympiad (accessible, great for teamwork narrative)'"],
    "businessCompetitions": ["5-6 business/entrepreneurship competitions with names and deadlines"],
    "artsCompetitions": ["5-6 arts competitions if relevant"],
    "debateSpeech": ["5-6 debate/speech/Model UN competitions"]
  },
  "internshipsRecommendations": {
    "industryInternships": ["5-6 specific internship opportunities — name companies, programs, or types of organizations to target in the student's area"],
    "researchInternships": ["5-6 research internship programs with application details"],
    "nonprofitInternships": ["4-5 nonprofit opportunities"],
    "virtualOpportunities": ["4-5 remote internships or virtual programs"]
  },
  "serviceCommunityRecommendations": {
    "localOpportunities": ["5-6 specific community service opportunities in the student's area"],
    "nationalPrograms": ["4-5 national service programs"],
    "internationalService": ["3-4 international volunteer opportunities"],
    "sustainedCommitment": ["4-5 strategies for building a sustained service narrative with measurable impact"]
  },
  "cultureArtsRecommendations": {
    "performingArts": ["4-5 opportunities"],
    "visualArts": ["4-5 opportunities"],
    "creativeWriting": ["5-6 publications and literary magazines that accept high school submissions"],
    "culturalClubs": ["4-5 heritage/cultural organizations"]
  }
}

Be SPECIFIC — name real programs, real competitions, real deadlines. Not generic categories.`, 12000, 60000)

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

  const MAX_RETRIES = 1

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

// ── Gemini API caller with retry (for Phases 2-4) ──────────────────────

async function callGemini(
  prompt: string,
  _maxTokens: number,
  timeoutMs: number,
): Promise<{ success: true; data: Record<string, unknown> } | { success: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY, falling back to Claude')
    return callClaude(prompt, _maxTokens, timeoutMs)
  }

  const MAX_RETRIES = 1

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: prompt,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ])

      const content = response.text || ''

      if (!content.trim()) { console.error(`[Gemini] Empty (attempt ${attempt + 1})`); continue }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) { console.error(`[Gemini] Non-JSON (attempt ${attempt + 1}):`, content.slice(0, 200)); continue }

      try {
        return { success: true, data: JSON.parse(jsonMatch[0]) }
      } catch {
        console.error(`[Gemini] Bad JSON (attempt ${attempt + 1}), length: ${jsonMatch[0].length}`)
        continue
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`[Gemini] Error (attempt ${attempt + 1}):`, msg)
      const isTransient = /429|500|503|timeout|network|ECONNRESET/.test(msg)
      if (!isTransient || attempt === MAX_RETRIES) break
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }

  // Fallback to Claude if Gemini fails completely
  console.warn('[Gemini] All attempts failed, falling back to Claude')
  return callClaude(prompt, _maxTokens, timeoutMs)
}
