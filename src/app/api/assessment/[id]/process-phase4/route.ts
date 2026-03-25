import { NextResponse, after } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildStudentProfileContext, sanitizeForPrompt } from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'
import { callAI } from '@/lib/ai-caller'
import { savePhaseResults, updatePhaseStatus } from '@/lib/assessment-save'
import { verifyQStashSignature } from '@/lib/qstash'
import { webhookEvents } from '@/lib/organization/webhooks'
import { buildResultsUrl } from '@/lib/url'
import { sendStudentResultsEmail, sendParentEmail } from '@/lib/resend'

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
      .select('responses, organization_id, student_archetype, competitiveness_score')
      .eq('id', assessmentId)
      .single()

    if (!assessment?.responses) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses as Record<string, unknown>
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    const { context: studentContext } = buildStudentProfileContext(formData, knowledgeHubResources)
    const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
    const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
    const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

    const GUIDELINES = `
IMPORTANT GUIDELINES:
1. If the student is from India, include local Indian competitions, hackathons, and opportunities.
2. If planning to study abroad, tailor recommendations to target countries.
3. Tailor to the student's location and curriculum (${curriculum}).
4. If school-specific resources are listed, PRIORITIZE those in recommendations.`

    const SYSTEM = `You are an elite college admissions strategist. Every recommendation must be SPECIFIC, ACTIONABLE, and AMBITIOUS. Respond ONLY with valid JSON, no additional text.`

    console.log(`[Phase4] Starting for assessment ${assessmentId}`)

    const result = await callAI(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${assessment.student_archetype || 'Unknown'} (Competitiveness: ${assessment.competitiveness_score || 0}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON for each activity item as an object with {name, description, dates, relevance}:
{
  "summerIvyProgramsRecommendations": {
    "preFreshmanPrograms": [{"name": "Program name", "description": "What it offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "competitivePrograms": [{"name": "Program name", "description": "What it offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "researchPrograms": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "enrichmentPrograms": [{"name": "Program name", "description": "What it offers", "dates": "Dates", "relevance": "Why this fits"}]
  },
  "sportsRecommendations": {
    "varsitySports": [{"name": "Sport", "description": "Goals", "dates": "Season", "relevance": "Why this matters"}],
    "clubSports": [{"name": "Club", "description": "What it involves", "dates": "Season", "relevance": "Why this matters"}],
    "recruitingStrategy": [{"name": "Strategy", "description": "Steps", "dates": "Timeline", "relevance": "Why this matters"}],
    "fitnessLeadership": [{"name": "Opportunity", "description": "What it involves", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "competitionsRecommendations": {
    "academicCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Registration and competition dates", "relevance": "Why this fits"}],
    "businessCompetitions": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "artsCompetitions": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "debateSpeech": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}]
  },
  "internshipsRecommendations": {
    "industryInternships": [{"name": "Internship", "description": "Role details", "dates": "Application deadline", "relevance": "Why this fits"}],
    "researchInternships": [{"name": "Program", "description": "Research details", "dates": "Dates", "relevance": "Why this fits"}],
    "nonprofitInternships": [{"name": "Organization", "description": "Role", "dates": "Dates", "relevance": "Why this fits"}],
    "virtualOpportunities": [{"name": "Opportunity", "description": "What it involves", "dates": "Availability", "relevance": "Why this fits"}]
  },
  "serviceCommunityRecommendations": {
    "localOpportunities": [{"name": "Opportunity", "description": "What it involves", "dates": "Availability", "relevance": "Why this matters"}],
    "nationalPrograms": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "internationalService": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "sustainedCommitment": [{"name": "Strategy", "description": "How to build impact", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "cultureArtsRecommendations": {
    "performingArts": [{"name": "Opportunity", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "visualArts": [{"name": "Opportunity", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "creativeWriting": [{"name": "Publication", "description": "What it involves", "dates": "Deadline", "relevance": "Why this fits"}],
    "culturalClubs": [{"name": "Organization", "description": "What it involves", "dates": "Schedule", "relevance": "Why this fits"}]
  },
  "studentGovernmentRecommendations": {
    "schoolGovernment": [{"name": "Position", "description": "How to pursue it", "dates": "Election timeline", "relevance": "Why this matters"}],
    "districtStateRoles": [{"name": "Role", "description": "What it involves", "dates": "Deadline", "relevance": "Why this matters"}],
    "youthGovernment": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "advocacyRoles": [{"name": "Role", "description": "What it involves", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "leadershipRecommendations": {
    "clubLeadership": ["3-4 specific leadership positions"],
    "schoolWideRoles": ["2-3 student body positions"],
    "communityLeadership": ["3-4 external leadership opportunities"],
    "leadershipDevelopment": ["4-5 specific skills and experiences"]
  }
}

Be SPECIFIC — name real programs, competitions, and deadlines.`, 12000, 90000)

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
