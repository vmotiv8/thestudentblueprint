import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { GoogleGenAI } from '@google/genai'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'

// Sanitize free-text input before sending to the Gemini prompt.
// Strips prompt-injection patterns, truncates long strings, and escapes
// characters that could break the prompt template.
function sanitizeForPrompt(value: unknown, maxLength = 1000): string {
  if (value === null || value === undefined) return ''
  let text = typeof value === 'string' ? value : String(value)

  // Strip lines that look like prompt injection attempts
  const injectionPatterns = /^(you are|ignore previous|system:|assistant:|human:|forget all|disregard|override|new instructions|<\/?s>|<\|)/im
  text = text
    .split('\n')
    .filter(line => !injectionPatterns.test(line.trim()))
    .join('\n')

  // Truncate to maxLength
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + '...[truncated]'
  }

  // Escape backticks and template-literal tokens so they cannot close the
  // prompt string or inject expressions.
  text = text.replace(/`/g, "'").replace(/\$\{/g, '(')

  return text
}

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

    const analysis = await analyzeWithGemini(formData, knowledgeHubResources)

    const failed = !!analysis.generationFailed

    let updateQuery = supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        scores: failed
          ? null
          : {
              competitivenessScore: analysis.competitivenessScore,
              archetypeScores: analysis.archetypeScores
            },
        report_data: analysis,
        student_archetype: failed ? 'Pending' : (analysis.studentArchetype || null),
        archetype_scores: failed ? null : (analysis.archetypeScores || null),
        competitiveness_score: failed ? null : (analysis.competitivenessScore ?? null),
        roadmap_data: failed ? null : (analysis.roadmap || null),
        strengths_analysis: failed ? null : (analysis.strengthsAnalysis || null),
        gap_analysis: failed ? null : (analysis.gapAnalysis || null),
        passion_projects: failed ? null : (analysis.passionProjects || null),
        academic_courses_recommendations: failed ? null : (analysis.academicCoursesRecommendations || null),
        sat_act_goals: failed ? null : (analysis.satActGoals || null),
        research_publications_recommendations: failed ? null : (analysis.researchPublicationsRecommendations || null),
        leadership_recommendations: failed ? null : (analysis.leadershipRecommendations || null),
        service_community_recommendations: failed ? null : (analysis.serviceCommunityRecommendations || null),
        summer_ivy_programs_recommendations: failed ? null : (analysis.summerIvyProgramsRecommendations || null),
        sports_recommendations: failed ? null : (analysis.sportsRecommendations || null),
        competitions_recommendations: failed ? null : (analysis.competitionsRecommendations || null),
        student_government_recommendations: failed ? null : (analysis.studentGovernmentRecommendations || null),
        internships_recommendations: failed ? null : (analysis.internshipsRecommendations || null),
        culture_arts_recommendations: failed ? null : (analysis.cultureArtsRecommendations || null),
        career_recommendations: failed ? null : (analysis.careerRecommendations || null),
        college_recommendations: failed ? null : (analysis.collegeRecommendations || null),
        grade_by_grade_roadmap: failed ? null : (analysis.gradeByGradeRoadmap || null),
        mentor_recommendations: failed ? null : (analysis.mentorRecommendations || null),
        waste_of_time_activities: failed ? null : (analysis.wasteOfTimeActivities || null),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)

    if (!reanalyze && organization) {
      updateQuery = updateQuery.eq('organization_id', organization.id)
    }

    const { data: assessment, error: updateError } = await updateQuery
      .select('*, student:students(*), organization:organizations(*)')
      .single()

    if (updateError) throw updateError

    // Trigger webhook using the new system
    if (assessment.organization_id) {
      const student = assessment.student as { email?: string; first_name?: string; last_name?: string } | null
      webhookEvents.assessmentCompleted(assessment.organization_id, {
        assessmentId: assessment.id,
        studentEmail: student?.email || '',
        studentName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student',
        archetype: analysis.studentArchetype || 'Unknown',
        competitivenessScore: analysis.competitivenessScore || 0,
        reportUrl: buildResultsUrl(assessment.id),
      }).catch((err) => console.error('Webhook delivery failed:', err))
    }

    // Send results email if analysis succeeded (not a failed generation)
    if (!analysis.generationFailed) {
      const student = assessment.student as {
        email?: string
        first_name?: string
        last_name?: string
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
          analysis.studentArchetype || 'Your Archetype',
          assessmentId,
          analysis,
          {
            orgName: org?.name,
            primaryColor: org?.primary_color,
            secondaryColor: org?.secondary_color,
            logoUrl: org?.logo_url,
            fromName: org?.custom_email_from || org?.name,
            replyTo: org?.custom_email_reply_to,
          }
        ).catch((err) => console.error('Failed to send results email:', err))

        // Send parent email if parent_email is available
        const parentEmail = (assessment.student as Record<string, unknown>)?.parent_email as string | null
        if (parentEmail) {
          sendParentEmail(
            parentEmail,
            studentName,
            analysis.studentArchetype || 'Your Archetype',
            assessmentId,
            analysis
          ).catch((err) => console.error('Failed to send parent email:', err))
        }
      }
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      analysis
    })

  } catch (error) {
    console.error('Error submitting assessment:', error)
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}

function toStringList(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value
  return ''
}

async function analyzeWithGemini(
  formData: Record<string, unknown>,
  knowledgeHubResources: { type: string; title: string; description: string | null }[] = []
) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('No Gemini API key found - cannot generate analysis')
    return {
      generationFailed: true,
      error: 'AI analysis failed - no API key configured',
      studentArchetype: 'Pending',
      competitivenessScore: null,
      archetypeScores: null,
      strengthsAnalysis: null,
      gapAnalysis: null,
      roadmap: null
    }
  }

  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const testingInfo = (formData.testingInfo || {}) as Record<string, unknown>
  const extracurriculars = (formData.extracurriculars || {}) as Record<string, unknown>
  const leadership = (formData.leadership || {}) as Record<string, unknown>
  const competitions = (formData.competitions || {}) as Record<string, unknown>
  const passions = (formData.passions || {}) as Record<string, unknown>
  const careerAspirations = (formData.careerAspirations || {}) as Record<string, unknown>
  const researchExperience = (formData.researchExperience || {}) as Record<string, unknown>
  const summerPrograms = (formData.summerPrograms || {}) as Record<string, unknown>
  const specialTalents = (formData.specialTalents || {}) as Record<string, unknown>
  const familyContext = (formData.familyContext || {}) as Record<string, unknown>
  const personality = (formData.personality || {}) as Record<string, unknown>
  const personalStories = (formData.personalStories || {}) as Record<string, unknown>
  const timeCommitment = (formData.timeCommitment || {}) as Record<string, unknown>

  const prompt = `You are an expert college admissions counselor. Analyze this student profile and create a personalized roadmap.

  Student Information:
  - Name: ${sanitizeForPrompt(basicInfo.fullName)}
  - Current Grade: ${sanitizeForPrompt(basicInfo.currentGrade) || 'Not provided'}
  - Location: ${sanitizeForPrompt(basicInfo.address)}, ${sanitizeForPrompt(basicInfo.city)}, ${sanitizeForPrompt(basicInfo.state)}, ${sanitizeForPrompt(basicInfo.country)}
  - Curriculum: ${sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum) || 'Not provided'}
  - Planning to Study Abroad: ${basicInfo.studyAbroad ? 'Yes' : 'No'}
  - Target Countries: ${sanitizeForPrompt(toStringList(basicInfo.targetCountries || []))}
  - GPA Scale: ${sanitizeForPrompt(academicProfile.gpaScale) || 'Not provided'}
  - GPA: ${sanitizeForPrompt(academicProfile.gpaUnweighted) || 'Not provided'} (unweighted), ${sanitizeForPrompt(academicProfile.gpaWeighted) || 'Not provided'} (weighted)

  Academic Profile:
  - Advanced/Curriculum Courses Taken: ${sanitizeForPrompt(toStringList(academicProfile.coursesTaken))}
  - Regular Courses Taken: ${sanitizeForPrompt(toStringList(academicProfile.regularCoursesTaken))}
  - Courses Planned: ${sanitizeForPrompt(toStringList(academicProfile.coursesPlanned))}
  - Regular Courses Planned: ${sanitizeForPrompt(toStringList(academicProfile.regularCoursesPlanned))}
  - Class Rank: ${sanitizeForPrompt(academicProfile.classRank) || 'Not provided'}
  - Academic Awards: ${sanitizeForPrompt(academicProfile.academicAwards) || 'Not provided'}
  - Favorite Subjects: ${sanitizeForPrompt(toStringList(academicProfile.favoriteSubjects))}
  - Least Favorite Subjects: ${sanitizeForPrompt(toStringList(academicProfile.leastFavoriteSubjects))}
  - PSAT Score: ${sanitizeForPrompt(testingInfo.psatScore) || 'Not taken'}${testingInfo.psatMath ? ` (Math: ${sanitizeForPrompt(testingInfo.psatMath)}, Reading: ${sanitizeForPrompt(testingInfo.psatReading)})` : ''}
  - SAT Score: ${sanitizeForPrompt(testingInfo.satScore) || 'Not taken'}${testingInfo.satMath ? ` (Math: ${sanitizeForPrompt(testingInfo.satMath)}, Reading: ${sanitizeForPrompt(testingInfo.satReading)})` : ''}
  - ACT Score: ${sanitizeForPrompt(testingInfo.actScore) || 'Not taken'}${testingInfo.actEnglish ? ` (English: ${sanitizeForPrompt(testingInfo.actEnglish)}, Math: ${sanitizeForPrompt(testingInfo.actMath)}, Reading: ${sanitizeForPrompt(testingInfo.actReading)}, Science: ${sanitizeForPrompt(testingInfo.actScience)})` : ''}
  - AP/IB Exam Scores: ${sanitizeForPrompt(testingInfo.apScores) || 'Not provided'}
  - Testing Timeline: ${sanitizeForPrompt(testingInfo.testingTimeline) || 'Not provided'}

  Extracurriculars & Leadership:
  ${sanitizeForPrompt(JSON.stringify(extracurriculars.activities || []), 2000)}
  - Leadership: ${sanitizeForPrompt(leadership.positions) || 'Not provided'}
  - Competitions: ${sanitizeForPrompt(competitions.competitions) || 'Not provided'}

  Passions & Interests:
  - Topics They Love: ${sanitizeForPrompt(toStringList(passions.topicsYouLove))}
  - Industries Curious About: ${sanitizeForPrompt(toStringList(passions.industriesCurious))}

  Career Aspirations:
  - Top Careers: ${sanitizeForPrompt(toStringList(careerAspirations.career1 || ''))}, ${sanitizeForPrompt(toStringList(careerAspirations.career2 || ''))}
  - Dream Job: ${sanitizeForPrompt(careerAspirations.dreamJobTitle) || 'Not provided'}

  Experience & Talents:
  - Research: ${sanitizeForPrompt(researchExperience.researchExperience) || 'Not provided'}
  - Summer Programs: ${sanitizeForPrompt(summerPrograms.programs) || 'Not provided'}
  - Special Talents: ${sanitizeForPrompt(JSON.stringify(specialTalents), 2000)}

  Family Context:
  - Father's Profession: ${sanitizeForPrompt(familyContext.fatherProfession) || 'Not provided'}
  - Mother's Profession: ${sanitizeForPrompt(familyContext.motherProfession) || 'Not provided'}
  - Sibling Professions: ${sanitizeForPrompt(familyContext.siblingProfessions) || 'Not provided'}
  - Legacy Connections: ${sanitizeForPrompt(JSON.stringify(familyContext.legacyEntries || []), 1000)}
  - Financial Aid Needed: ${familyContext.financialAidNeeded ? 'Yes' : 'No'}
  - Merit Scholarship Interest: ${familyContext.meritScholarshipInterest ? 'Yes' : 'No'}

  Personality & Story:
  - Strengths: ${sanitizeForPrompt(toStringList(personality.topStrengths))}
  - Weaknesses: ${sanitizeForPrompt(toStringList(personality.topWeaknesses))}
  - Personality Type: ${sanitizeForPrompt(personality.introvertExtrovert) || 'Not provided'}
  - Archetypes: ${sanitizeForPrompt(toStringList(personality.archetypes))}
  - Life Challenge: ${sanitizeForPrompt(personalStories.lifeChallenge) || 'Not provided'}
  - Leadership Moment: ${sanitizeForPrompt(personalStories.leadershipMoment) || 'Not provided'}
  - Failure Lesson: ${sanitizeForPrompt(personalStories.failureLesson) || 'Not provided'}
  - Proud Moment: ${sanitizeForPrompt(personalStories.proudMoment) || 'Not provided'}

  Time Commitment:
  - School Year: ${sanitizeForPrompt(timeCommitment.hoursSchoolYear) || 'Not provided'}
  - Summer: ${sanitizeForPrompt(timeCommitment.hoursSummer) || 'Not provided'}
${(() => {
    const khByType: Record<string, string[]> = {}
    for (const r of knowledgeHubResources) {
      if (!khByType[r.type]) khByType[r.type] = []
      khByType[r.type].push(r.description ? `${r.title} (${r.description})` : r.title)
    }
    if (Object.keys(khByType).length === 0) return ''
    return '\n  School-Specific Resources (uploaded by the student\'s school — prioritize these in recommendations):\n' +
      Object.entries(khByType)
        .map(([type, items]) => `  - ${type.replace(/_/g, ' ')}: ${items.join('; ')}`)
        .join('\n')
  })()}
  IMPORTANT GUIDELINES:
  1. If the student is from India, you MUST include local Indian competitions, hackathons, and opportunities (e.g., Imperial STEM Hackathon, ISEF India, national coding challenges like ZCO/ZIO, various Olympiads, IRIS National Science Fair, etc.) in the roadmap.
  2. If the student is planning to study abroad, update the "Reach/Target/Safety schools" and recommendations based on the admissions data of universities in their target countries.
  3. Tailor the roadmap actions, goals, and projects to the student's specific location and curriculum (${sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)}).
  4. If the student is in a specific curriculum (like CBSE or IB), ensure the academic suggestions respect that curriculum's requirements and timelines.
  5. If school-specific resources are listed above (courses, clubs, competitions, extracurriculars), PRIORITIZE recommending those specific options over generic alternatives wherever applicable.

  Generate a comprehensive analysis with the following structure in JSON format:
  {
    "studentArchetype": "A unique 2-3 word descriptor",
    "archetypeScores": {
      "Visionary": number 0-100,
      "Builder": number 0-100,
      "Healer": number 0-100,
      "Analyst": number 0-100,
      "Artist": number 0-100,
      "Advocate": number 0-100,
      "Entrepreneur": number 0-100,
      "Researcher": number 0-100
    },
    "strengthsAnalysis": {
      "competitiveAdvantages": ["3-5 specific competitive advantages"],
      "uniqueDifferentiators": ["3-4 unique differentiators"],
      "alignedActivities": ["Specific activities that match their passions"]
    },
    "gapAnalysis": {
      "missingElements": ["5-7 specific elements missing"],
      "activitiesToDeepen": ["4-6 activities needing more depth"],
      "skillsToDevelope": ["5-7 skills needed"]
    },
    "roadmap": {
      "immediate": ["8-10 specific actions for next 3 months"],
      "shortTerm": ["8-10 goals for 3-6 months"],
      "mediumTerm": ["8-10 projects for 6-12 months"],
      "longTerm": ["8-10 trajectory items for 1+ years"]
    },
    "collegePlanning": {
      "reachSchools": ["3-4 reach schools based on target countries"],
      "targetSchools": ["3-4 target schools based on target countries"],
      "safetySchools": ["3-4 safety schools based on target countries"]
    },
    "competitivenessScore": number 0-100
  }

  Respond ONLY with valid JSON, no additional text.`

  const failedResult = (reason: string) => ({
    generationFailed: true,
    error: reason,
    studentArchetype: 'Pending',
    competitivenessScore: null,
    archetypeScores: null,
    strengthsAnalysis: null,
    gapAnalysis: null,
    roadmap: null
  })

  const MAX_RETRIES = 2
  let lastError: unknown = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const TIMEOUT_MS = 60000
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 8000,
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout after 60s')), TIMEOUT_MS)
        ),
      ])

      const content = response.text || ''

      if (!content.trim()) {
        console.error(`Gemini returned empty response (attempt ${attempt + 1})`)
        lastError = new Error('Empty response')
        continue
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('Gemini returned non-JSON response:', content.slice(0, 500))
        return failedResult('AI analysis failed - invalid response format')
      }

      let parsed
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error(`Gemini returned malformed JSON (attempt ${attempt + 1}):`, content.slice(0, 500))
        lastError = parseError
        continue // Retry — Gemini often succeeds on next attempt
      }

      // Validate critical fields
      if (!parsed.studentArchetype || parsed.competitivenessScore == null) {
        console.error('Gemini response missing critical fields')
        lastError = new Error('Incomplete response')
        continue
      }

      return parsed
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Gemini API error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, message)

      // Only retry on transient errors (network, rate limit, 5xx)
      const isTransient = message.includes('503') ||
        message.includes('429') ||
        message.includes('ECONNRESET') ||
        message.includes('timeout') ||
        message.includes('network')

      if (!isTransient || attempt === MAX_RETRIES) break

      // Exponential backoff: 1s, 2s
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  console.error('Gemini API failed after all retries:', {
    message: lastError instanceof Error ? lastError.message : String(lastError),
  })
  return failedResult('AI analysis failed - pending retry')
}
