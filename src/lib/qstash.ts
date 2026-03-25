import { Client } from '@upstash/qstash'

let _client: Client | null = null

export function getQStashClient(): Client {
  if (!_client) {
    const token = process.env.QSTASH_TOKEN
    if (!token) throw new Error('QSTASH_TOKEN environment variable is required')
    _client = new Client({
      token,
      // Use QSTASH_URL env var if set (for EU region: https://qstash.upstash.io)
      ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}),
    })
  }
  return _client
}

/**
 * Get the base URL for QStash callbacks.
 * Uses QSTASH_CURRENT_SIGNING_KEY to verify incoming requests.
 */
export function getBaseUrl(): string {
  // Vercel deployment URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  // Custom domain
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  // Local development
  return 'http://localhost:3000'
}

/**
 * Verify that a request came from QStash using the signature header.
 * Returns true if valid, false otherwise.
 */
export async function verifyQStashSignature(request: Request): Promise<boolean> {
  // In development, skip verification if no signing keys configured
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

  if (!currentSigningKey && !nextSigningKey) {
    if (process.env.NODE_ENV === 'development') return true
    console.error('[QStash] No signing keys configured')
    return false
  }

  try {
    const { Receiver } = await import('@upstash/qstash')
    const receiver = new Receiver({
      currentSigningKey: currentSigningKey || '',
      nextSigningKey: nextSigningKey || '',
    })

    const signature = request.headers.get('upstash-signature') || ''
    const body = await request.text()

    const isValid = await receiver.verify({ signature, body }).catch(() => false)
    return !!isValid
  } catch (err) {
    console.error('[QStash] Signature verification error:', err)
    return false
  }
}

/**
 * Enqueue a phase for processing via QStash.
 */
export async function enqueuePhase(
  assessmentId: string,
  phase: 1 | 2 | 3 | 4,
  body: Record<string, unknown> = {}
): Promise<void> {
  const client = getQStashClient()
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/assessment/${assessmentId}/process-phase${phase}`

  await client.publishJSON({
    url,
    body: { assessmentId, ...body },
    retries: 3,
  })

  console.log(`[QStash] Enqueued phase ${phase} for assessment ${assessmentId}`)
}

/**
 * Enqueue multiple phases in parallel (used after Phase 1 completes).
 */
export async function enqueueParallelPhases(
  assessmentId: string,
  phases: (2 | 3 | 4)[],
  body: Record<string, unknown> = {}
): Promise<void> {
  const client = getQStashClient()
  const baseUrl = getBaseUrl()

  await Promise.all(
    phases.map(phase =>
      client.publishJSON({
        url: `${baseUrl}/api/assessment/${assessmentId}/process-phase${phase}`,
        body: { assessmentId, ...body },
        retries: 3,
      })
    )
  )

  console.log(`[QStash] Enqueued phases [${phases.join(', ')}] in parallel for assessment ${assessmentId}`)
}
