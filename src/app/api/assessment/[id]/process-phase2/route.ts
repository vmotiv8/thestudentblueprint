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

    console.log(`[Phase2] Starting for assessment ${assessmentId}`)

    const result = await callAI(`${SYSTEM}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${assessment.student_archetype || 'Unknown'} (Competitiveness: ${assessment.competitiveness_score || 0}/100)

${studentContext}
${GUIDELINES}

Generate DETAILED JSON:
{
  "academicCoursesRecommendations": {
    "apCourses": ["6-8 specific AP courses with reasoning — ONLY if AP/US curriculum, otherwise empty array"],
    "ibCourses": ["4-5 IB courses — ONLY if IB curriculum, otherwise empty array"],
    "curriculumSpecificCourses": {"label": "Curriculum name (e.g. CBSE, A-Levels)", "courses": ["4-6 courses — ONLY if NOT AP/IB, otherwise empty array"]},
    "honorsCourses": ["4-5 Honors courses"],
    "electivesRecommended": ["4-5 strategic electives"]
  },
  "satActGoals": {
    "targetSATScore": "Specific target",
    "satSectionGoals": { "reading": "target with strategy", "math": "target" },
    "targetACTScore": "Specific target",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "Detailed prep plan with specific resources",
    "timeline": "Month-by-month testing timeline"
  },
  "collegeRecommendations": {
    "collegeBreakdown": {
      "reach": ["10 reach schools with 1-sentence fit reason"],
      "target": ["10 target schools with reasons"],
      "safety": ["10 safety schools with reasons"]
    },
    "schoolMatches": [{"schoolName": "University Name", "matchScore": 0-100, "why": "2-3 sentence fit explanation"}]
  },
  "careerRecommendations": {
    "jobTitles": ["5 specific job titles"],
    "blueOceanIndustries": [{"industry": "Emerging industry", "why": "Why it's a blue ocean for this student"}],
    "salaryPotential": "Salary range with trajectory",
    "linkedInBioHeadline": "Professional headline"
  }
}

CRITICAL: Generate at least 12 schoolMatches with detailed why.`, 16000, 90000)

    if (!result.success) {
      console.error(`[Phase2] Failed for ${assessmentId}:`, result.error)
      const { phaseStatus } = await updatePhaseStatus(assessmentId, 'phase2', 'failed')
      await savePhaseResults(assessmentId, {}, 'partial', phaseStatus)
      return NextResponse.json({ error: result.error }, { status: 503 })
    }

    console.log(`[Phase2] Complete for ${assessmentId}`)

    const { phaseStatus, allCompleted } = await updatePhaseStatus(assessmentId, 'phase2', 'completed')
    await savePhaseResults(assessmentId, result.data, allCompleted ? 'completed' : 'partial', phaseStatus)

    return NextResponse.json({ success: true, phase: 2 })
  } catch (error) {
    console.error(`[Phase2] Error for ${assessmentId}:`, error)
    return NextResponse.json({ error: 'Phase 2 processing failed' }, { status: 500 })
  }
}
