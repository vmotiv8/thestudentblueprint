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

    // Extract key student details for targeted scholarship matching
    const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
    const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
    const testingInfo = (formData.testingInfo || {}) as Record<string, unknown>
    const familyContext = (formData.familyContext || {}) as Record<string, unknown>
    const passions = (formData.passions || {}) as Record<string, unknown>
    const careerAspirations = (formData.careerAspirations || {}) as Record<string, unknown>
    const extracurriculars = (formData.extracurriculars || {}) as Record<string, unknown>
    const personality = (formData.personality || {}) as Record<string, unknown>

    const studentState = basicInfo.state || ''
    const studentCity = basicInfo.city || ''
    const studentCountry = basicInfo.country || ''
    const ethnicity = basicInfo.ethnicity || ''
    const gender = basicInfo.gender || ''
    const grade = basicInfo.currentGrade || ''
    const gpa = academicProfile.gpaUnweighted || academicProfile.gpaWeighted || ''
    const financialAid = familyContext.financialAidNeeded ? 'Yes' : 'No'
    const careers = [careerAspirations.career1, careerAspirations.career2, careerAspirations.dreamJobTitle].filter(Boolean).join(', ')
    const interests = Array.isArray(passions.topicsYouLove) ? passions.topicsYouLove.join(', ') : ''
    const industries = Array.isArray(passions.industriesCurious) ? passions.industriesCurious.join(', ') : ''
    const activities = JSON.stringify(extracurriculars.activities || []).slice(0, 1500)
    const archetypes = Array.isArray(personality.archetypes) ? personality.archetypes.join(', ') : ''

    const prompt = `You are a scholarship matching specialist. Your job is to find REALISTIC, ATTAINABLE scholarships that this specific student has a genuine chance of winning — NOT prestigious national scholarships that only 0.1% of students win.

STUDENT PROFILE:
- Location: ${studentCity}, ${studentState}, ${studentCountry}
- Grade: ${grade}
- GPA: ${gpa}
- Ethnicity/Background: ${ethnicity || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Financial Aid Needed: ${financialAid}
- Career Interests: ${careers || 'Not specified'}
- Topics They Love: ${interests || 'Not specified'}
- Industries: ${industries || 'Not specified'}
- Archetypes: ${archetypes || 'Not specified'}
- Competitiveness Score: ${assessment.competitiveness_score || 0}/100
- Student Archetype: ${assessment.student_archetype || 'Unknown'}
- Activities: ${activities}

${context}

CRITICAL RULES:
1. DO NOT recommend ultra-competitive national scholarships (Gates, Coca-Cola, Jack Kent Cooke, etc.) unless the student has a competitiveness score above 85.
2. PRIORITIZE scholarships the student can REALISTICALLY win based on their actual profile:
   - Local/community scholarships in ${studentCity || 'their city'}, ${studentState || 'their state'} (easiest to win, fewer applicants)
   - Scholarships matching their specific ethnicity, background, or heritage if provided
   - Scholarships matching their specific career interests (${careers || 'general'})
   - Scholarships matching their extracurricular activities and interests
   - School-specific and university-specific merit scholarships at their target schools
   - Smaller, less-known scholarships ($500-$5,000) that have fewer applicants
   - State-level scholarships specific to ${studentState || 'their state'}
3. Only include 2-3 national competitive scholarships MAX — the rest should be attainable.
4. For the "why" field, reference SPECIFIC details from this student's profile (their activities, GPA, location, background, interests).
5. Include the actual application URL where possible. If you don't know the exact URL, provide the organization's scholarship page URL.

Generate exactly 20 scholarships. Distribute them roughly as:
- 5-6 local/community scholarships (city, county, or state level)
- 3-4 identity/background-based scholarships (ethnicity, gender, first-gen, etc.)
- 3-4 career/interest-specific scholarships
- 3-4 merit scholarships at universities they might attend
- 2-3 national scholarships they could realistically compete for

Respond ONLY with valid JSON in this exact format:
{
  "scholarshipRecommendations": {
    "scholarships": [
      {
        "name": "Scholarship Name",
        "organization": "Sponsoring Organization",
        "amount": "Award amount or range",
        "deadline": "Application deadline or cycle",
        "why": "Specific reason referencing THIS student's profile — their activities, grades, location, background, or interests",
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
