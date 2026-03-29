/**
 * Shared AI caller for all assessment phases.
 * Tries Gemini first, falls back to Claude.
 */
import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'

type AIResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string }

/**
 * Call Gemini (primary) with Claude Haiku as fallback.
 * Returns parsed JSON data or an error.
 */
export async function callAI(
  prompt: string,
  maxTokens: number,
  timeoutMs: number,
): Promise<AIResult> {
  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    const result = await callGemini(prompt, maxTokens, timeoutMs)
    if (result.success) return result
    console.warn('[AI] Gemini failed, falling back to Claude')
  } else {
    console.warn('[AI] No GEMINI_API_KEY set')
  }

  // Fallback to Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey && !geminiKey) {
    console.error('[AI] CRITICAL: Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is configured')
    return { success: false, error: 'AI service not configured. Please contact support.' }
  }

  return callClaude(prompt, maxTokens, timeoutMs)
}

async function callGemini(
  prompt: string,
  maxTokens: number,
  timeoutMs: number,
): Promise<AIResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { success: false, error: 'No Gemini API key' }

  const MAX_RETRIES = 1
  const ai = new GoogleGenAI({ apiKey })

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            maxOutputTokens: maxTokens,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ])

      const content = response.text || ''
      if (!content.trim()) {
        console.error(`[Gemini] Empty response (attempt ${attempt + 1})`)
        continue
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`[Gemini] Non-JSON (attempt ${attempt + 1}):`, content.slice(0, 200))
        continue
      }

      try {
        return { success: true, data: JSON.parse(jsonMatch[0]) }
      } catch {
        console.error(`[Gemini] Bad JSON (attempt ${attempt + 1}), length: ${jsonMatch[0].length}`)
        continue
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`[Gemini] Error (attempt ${attempt + 1}):`, msg)
      const isTransient = /429|500|503|timeout|network|ECONNRESET/.test(msg)
      if (!isTransient || attempt === MAX_RETRIES) break
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }

  return { success: false, error: 'Gemini failed' }
}

async function callClaude(
  prompt: string,
  maxTokens: number,
  timeoutMs: number,
): Promise<AIResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { success: false, error: 'No Anthropic API key' }

  const MAX_RETRIES = 1
  const client = new Anthropic({ apiKey })

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await Promise.race([
        client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Claude timeout after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ])

      const textBlock = response.content.find(b => b.type === 'text')
      const content = textBlock?.text || ''

      if (!content.trim()) {
        console.error(`[Claude] Empty response (attempt ${attempt + 1})`)
        continue
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`[Claude] Non-JSON (attempt ${attempt + 1}):`, content.slice(0, 200))
        continue
      }

      try {
        return { success: true, data: JSON.parse(jsonMatch[0]) }
      } catch {
        console.error(`[Claude] Bad JSON (attempt ${attempt + 1}), length: ${jsonMatch[0].length}`)
        continue
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`[Claude] Error (attempt ${attempt + 1}):`, msg)
      const isTransient = /529|429|ECONNRESET|timeout|network|overloaded/.test(msg)
      if (!isTransient || attempt === MAX_RETRIES) break
      await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
    }
  }

  return { success: false, error: 'AI analysis failed. Please try again.' }
}
