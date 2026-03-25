import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildStudentProfileContext, sanitizeForPrompt } from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'
import { callAI } from '@/lib/ai-caller'
import { savePhaseResults, updatePhaseStatus } from '@/lib/assessment-save'
import { verifyQStashSignature, enqueueParallelPhases } from '@/lib/qstash'

export const maxDuration = 120

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assessmentId } = await params

  // Verify QStash signature
  const isValid = await verifyQStashSignature(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data: assessment } = await supabase
      .from('assessments')
      .select('responses, organization_id')
      .eq('id', assessmentId)
      .single()

    if (!assessment?.responses) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses as Record<string, unknown>
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

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

    console.log(`[Phase1] Starting for assessment ${assessmentId}`)

    const result = await callAI(`${SYSTEM}

Analyze this student profile and produce a brutally honest, deeply insightful analysis:

${studentContext}
${GUIDELINES}

Generate JSON:
{
  "studentArchetype": "A unique 2-3 word archetype (e.g., 'Analytical Entrepreneur', 'Creative Humanitarian', 'Scientific Visionary')",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100 (be realistic — most students are 40-70, only nationally ranked students get 80+),
  "strengthsAnalysis": {
    "competitiveAdvantages": ["5-6 SPECIFIC advantages with concrete evidence from their profile"],
    "uniqueDifferentiators": ["3-4 things that make this student genuinely different — what's their 'spike'?"],
    "alignedActivities": ["4-5 current activities that directly support their college narrative"]
  },
  "gapAnalysis": {
    "missingElements": ["EXACTLY 10 brutally honest gaps — be direct and aggressive about what is missing. Do NOT sugarcoat."],
    "activitiesToDeepen": ["3-4 existing activities that need more depth/recognition/leadership"],
    "skillsToDevelope": ["EXACTLY 10 skills — at least 5 must be AI/modern tech skills: prompt engineering, AI tools (Claude, ChatGPT, Gemini), vibe coding (Cursor, Copilot), AI-powered projects, AI data analysis, AI content creation, AI ethics, no-code AI app building. The remaining 5 should be traditional skills for their career path."],
    "vulnerabilities": ["3-4 specific vulnerabilities that admissions officers may flag — be harsh and specific"]
  },
  "roadmap": {
    "immediate": ["6-8 highly specific actions for next 3 months"],
    "shortTerm": ["6-8 detailed goals for 3-6 months"],
    "mediumTerm": ["5-6 transformative projects for 6-12 months"],
    "longTerm": ["5-6 trajectory items for 1+ years"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "2-3 sentence strategic focus",
      "academics": ["4-5 specific academic goals"],
      "extracurriculars": ["4-5 specific extracurricular milestones"],
      "testing": ["3-4 testing milestones with target scores"],
      "leadership": ["3-4 leadership positions to pursue"],
      "summerPlan": "Detailed summer plan"
    },
    "nextYears": [one entry per remaining year until 12th grade, same structure]
  },
  "essayBrainstorm": [
    {
      "title": "Compelling 5-8 word title",
      "hook": "A vivid opening sentence referencing a REAL detail from the student's life.",
      "narrative": "4-5 sentence description of the full narrative arc.",
      "connectingThreads": ["4-5 specific elements this essay weaves together"],
      "whyItWorks": "3-4 sentences on why admissions officers would be captivated."
    }
  ]
}

CRITICAL: Generate exactly 5 essay ideas. Each MUST be deeply personal and connect 3+ profile elements.`, 16000, 120000)

    if (!result.success) {
      console.error(`[Phase1] Failed for ${assessmentId}:`, result.error)
      const { phaseStatus } = await updatePhaseStatus(assessmentId, 'phase1', 'failed')
      await savePhaseResults(assessmentId, {}, 'partial', phaseStatus)
      return NextResponse.json({ error: result.error }, { status: 503 })
    }

    console.log(`[Phase1] Complete for ${assessmentId} — archetype: ${result.data.studentArchetype}`)

    // Save Phase 1 results
    const { phaseStatus } = await updatePhaseStatus(assessmentId, 'phase1', 'completed')
    await savePhaseResults(assessmentId, result.data, 'partial', phaseStatus)

    // Enqueue phases 2, 3, 4 in parallel (they only depend on Phase 1 output)
    await enqueueParallelPhases(assessmentId, [2, 3, 4])

    return NextResponse.json({ success: true, phase: 1 })
  } catch (error) {
    console.error(`[Phase1] Error for ${assessmentId}:`, error)
    return NextResponse.json({ error: 'Phase 1 processing failed' }, { status: 500 })
  }
}
