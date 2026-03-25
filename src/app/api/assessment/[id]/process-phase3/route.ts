import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildStudentProfileContext, sanitizeForPrompt } from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'
import { callAI } from '@/lib/ai-caller'
import { savePhaseResults, updatePhaseStatus } from '@/lib/assessment-save'
import { verifyQStashSignature } from '@/lib/qstash'

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

    console.log(`[Phase3] Starting for assessment ${assessmentId}`)

    const result = await callAI(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${assessment.student_archetype || 'Unknown'} (Competitiveness: ${assessment.competitiveness_score || 0}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON:
{
  "passionProjects": [
    {
      "title": "Specific project title",
      "description": "4-5 sentence description — AMBITIOUS (PhD-level, startup-worthy, competition-winning)",
      "timeCommitment": "Hours per week and duration",
      "skillsDeveloped": ["5-6 specific skills"],
      "applicationImpact": "How this transforms their college application",
      "resources": "Specific tools, platforms, funding sources",
      "implementationSteps": ["6-8 detailed step-by-step actions"]
    }
  ],
  "researchPublicationsRecommendations": {
    "researchTopics": ["5-7 SPECIFIC PhD-level research topics"],
    "publicationOpportunities": ["5-6 REAL journals and conferences for high school students"],
    "mentorshipSuggestions": ["4-5 specific strategies to find research mentors"],
    "timeline": "Detailed research timeline"
  },
  "mentorRecommendations": {
    "mentors": [
      {
        "name": "Professor Name or 'Professor in [field]'",
        "university": "Nearby or relevant university",
        "department": "Specific department",
        "why": "3-4 sentences on fit and approach strategy"
      }
    ]
  },
  "wasteOfTimeActivities": {
    "activities": [{"activity": "Activity to stop", "whyQuit": "2-3 sentence explanation"}]
  }
}

CRITICAL: Generate exactly 3 passion projects. Generate 5+ mentor recommendations.`, 10000, 90000)

    if (!result.success) {
      console.error(`[Phase3] Failed for ${assessmentId}:`, result.error)
      const { phaseStatus } = await updatePhaseStatus(assessmentId, 'phase3', 'failed')
      await savePhaseResults(assessmentId, {}, 'partial', phaseStatus)
      return NextResponse.json({ error: result.error }, { status: 503 })
    }

    console.log(`[Phase3] Complete for ${assessmentId}`)

    const { phaseStatus, allCompleted } = await updatePhaseStatus(assessmentId, 'phase3', 'completed')
    await savePhaseResults(assessmentId, result.data, allCompleted ? 'completed' : 'partial', phaseStatus)

    return NextResponse.json({ success: true, phase: 3 })
  } catch (error) {
    console.error(`[Phase3] Error for ${assessmentId}:`, error)
    return NextResponse.json({ error: 'Phase 3 processing failed' }, { status: 500 })
  }
}
