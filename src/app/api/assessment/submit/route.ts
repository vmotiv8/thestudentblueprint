import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { enqueuePhase } from '@/lib/qstash'

// No longer needs 300s — this is now a thin orchestrator
export const maxDuration = 30

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
    await supabase.from('assessments')
      .update({
        responses: formData,
        status: 'in_progress',
        phase_status: { phase1: 'pending', phase2: 'pending', phase3: 'pending', phase4: 'pending' },
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    console.log(`[Submit] Assessment ${assessmentId} saved, enqueueing Phase 1`)

    // Enqueue Phase 1 via QStash — this returns immediately
    try {
      await enqueuePhase(assessmentId, 1)
    } catch (qstashError) {
      // QStash failed — fall back to synchronous Phase 1 processing
      console.error('[Submit] QStash enqueue failed, falling back to sync:', qstashError)

      // Import and run Phase 1 synchronously as fallback
      const { callAI } = await import('@/lib/ai-caller')
      const { buildStudentProfileContext, sanitizeForPrompt } = await import('@/lib/assessment-prompts')
      const { fetchKnowledgeHubWithContent } = await import('@/lib/knowledge-hub-content')
      const { savePhaseResults } = await import('@/lib/assessment-save')

      const knowledgeHubResources = organization?.id
        ? await fetchKnowledgeHubWithContent(organization.id)
        : []

      const { context: studentContext, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
      const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
      const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
      const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

      const SYSTEM = `You are an elite college admissions strategist. Every recommendation must be SPECIFIC, ACTIONABLE, and AMBITIOUS. Respond ONLY with valid JSON, no additional text.`
      const GUIDELINES = `Tailor to the student's location and curriculum (${curriculum}). If school-specific resources are listed, PRIORITIZE those.`

      const phase1 = await callAI(`${SYSTEM}\n\nAnalyze this student profile:\n\n${studentContext}\n${GUIDELINES}\n\nGenerate JSON with: studentArchetype, archetypeScores, competitivenessScore, strengthsAnalysis, gapAnalysis, roadmap, gradeByGradeRoadmap, essayBrainstorm`, 16000, 120000)

      if (phase1.success) {
        await savePhaseResults(assessmentId, phase1.data, 'partial', { phase1: 'completed', phase2: 'pending', phase3: 'pending', phase4: 'pending' })
      } else {
        return NextResponse.json({ error: phase1.error }, { status: 503 })
      }
    }

    return NextResponse.json({ success: true, assessmentId })

  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string }
    const msg = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[Submit] Error:', { message: msg, code: err.code, details: err.details })
    return NextResponse.json({ error: 'Failed to submit assessment. Please try again.' }, { status: 500 })
  }
}
