import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildProcessPhase3Prompt } from '@/lib/assessment-prompts'
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
      .select('responses, organization_id, student_archetype, competitiveness_score, student_type')
      .eq('id', assessmentId)
      .single()

    if (!assessment?.responses) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses as Record<string, unknown>
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    console.log(`[Phase3] Starting for assessment ${assessmentId} (type: ${assessment.student_type || 'high_school'})`)

    const result = await callAI(
      buildProcessPhase3Prompt(
        formData,
        knowledgeHubResources,
        assessment.student_type,
        assessment.student_archetype || 'Unknown',
        assessment.competitiveness_score || 0
      ),
      7000,
      90000
    )

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
