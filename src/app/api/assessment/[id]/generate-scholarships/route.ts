import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import { buildStudentProfileContext } from '@/lib/assessment-prompts'
import { fetchKnowledgeHubWithContent } from '@/lib/knowledge-hub-content'

export const maxDuration = 120

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = createServerSupabaseClient()

    // Auth: allow verified email cookie OR admin session
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value
    const verifiedEmail = cookieStore.get('verified_email')?.value

    if (!adminId && !verifiedEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*, students(*)')
      .eq('id', assessmentId)
      .single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Already has 20+ scholarships
    const existing = assessment.scholarship_recommendations?.scholarships
    if (Array.isArray(existing) && existing.length >= 20) {
      return NextResponse.json({ message: 'Scholarships already generated' })
    }

    const formData = assessment.responses
    if (!formData) {
      return NextResponse.json({ error: 'No assessment responses found' }, { status: 400 })
    }

    // Fetch knowledge hub resources with file content extraction
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    const { context } = buildStudentProfileContext(formData, knowledgeHubResources)

    const prompt = `You are an expert college admissions counselor specializing in scholarship matching. Based on the following student profile, generate exactly 20 personalized scholarship recommendations.

${context}

Student Archetype: ${assessment.student_archetype || 'Unknown'}
Competitiveness Score: ${assessment.competitiveness_score || 0}/100

Generate exactly 20 scholarships that this specific student should apply for. Include a mix of:
- Merit-based scholarships matching their academics and test scores
- Activity-based scholarships matching their extracurriculars and interests
- Identity/background-based scholarships they may qualify for
- Career-specific scholarships aligned with their goals
- Local/regional scholarships based on their location
- National competitive scholarships for high-achieving students

For each scholarship, provide realistic and accurate information. If you are not certain about specific deadlines or amounts, provide reasonable estimates and note them.

Respond ONLY with valid JSON in this exact format:
{
  "scholarshipRecommendations": {
    "scholarships": [
      {
        "name": "Scholarship Name",
        "organization": "Sponsoring Organization",
        "amount": "Award amount or range",
        "deadline": "Application deadline or cycle",
        "why": "Specific reason why this student qualifies and should apply",
        "url": "Application URL"
      }
    ]
  }
}`

    const result = await callGemini(prompt, 90000)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'AI analysis failed' }, { status: 503 })
    }

    const scholarships = result.data.scholarshipRecommendations

    // Save to database
    const { error: saveError } = await supabase
      .from('assessments')
      .update({
        scholarship_recommendations: scholarships,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (saveError) {
      console.error('[Scholarships] Save error:', saveError)
      return NextResponse.json({ error: 'Failed to save scholarships' }, { status: 500 })
    }

    return NextResponse.json({ scholarships })
  } catch (error) {
    console.error('[Scholarships] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function callGemini(
  prompt: string,
  timeoutMs: number,
): Promise<{ success: true; data: Record<string, unknown> } | { success: false; error: string }> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
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
      if (!content.trim()) {
        console.error('[Scholarships/Gemini] Empty response')
      } else {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            return { success: true, data: JSON.parse(jsonMatch[0]) }
          } catch {
            console.error('[Scholarships/Gemini] Bad JSON')
          }
        }
      }
    } catch (err) {
      console.error('[Scholarships/Gemini] Error:', err instanceof Error ? err.message : err)
    }
  }

  // Fallback to Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return { success: false, error: 'No AI service configured' }
  }

  try {
    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await Promise.race([
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Claude timeout')), timeoutMs)
      ),
    ])

    const textBlock = response.content.find(block => block.type === 'text')
    const content = textBlock?.text || ''
    if (!content.trim()) {
      return { success: false, error: 'Empty response from AI' }
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: 'Non-JSON response from AI' }
    }

    return { success: true, data: JSON.parse(jsonMatch[0]) }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}
