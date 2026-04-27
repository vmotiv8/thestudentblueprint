import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { buildProcessPhase1Prompt } from '@/lib/assessment-prompts'
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
      .select('responses, organization_id, student_type')
      .eq('id', assessmentId)
      .single()

    if (!assessment?.responses) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const formData = assessment.responses as Record<string, unknown>
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    console.log(`[Phase1] Starting for assessment ${assessmentId} (type: ${assessment.student_type || 'high_school'})`)

    const result = await callAI(
      buildProcessPhase1Prompt(formData, knowledgeHubResources, assessment.student_type),
      8000,
      120000
    )

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
