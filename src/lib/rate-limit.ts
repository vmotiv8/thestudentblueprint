/**
 * Distributed rate limiting using Upstash Redis.
 * Works correctly across serverless invocations (unlike in-memory Map).
 */
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy-init Redis client (only when env vars are present)
let _redis: Redis | null = null
let warnedMissingRedis = false
function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

// Pre-configured rate limiters (created lazily)
const limiters = new Map<string, Ratelimit>()

function getLimiter(tier: keyof typeof rateLimitConfigs): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  if (limiters.has(tier)) return limiters.get(tier)!

  const config = rateLimitConfigs[tier]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs}ms`),
    prefix: `ratelimit:${tier}`,
  })
  limiters.set(tier, limiter)
  return limiter
}

// Pre-configured rate limit tiers
export const rateLimitConfigs = {
  // Strict: 5 requests per minute (OTP, login)
  strict: { windowMs: 60_000, maxRequests: 5 },
  // Standard: 30 requests per minute (general API)
  standard: { windowMs: 60_000, maxRequests: 30 },
  // Lenient: 100 requests per minute (read operations)
  lenient: { windowMs: 60_000, maxRequests: 100 },
  // Bulk: 10 requests per 5 minutes (bulk operations)
  bulk: { windowMs: 300_000, maxRequests: 10 },
  // Assessment: 5 per minute per IP (expensive AI calls)
  assessment: { windowMs: 60_000, maxRequests: 5 },
  // Scholarship: 3 per minute per IP
  scholarship: { windowMs: 60_000, maxRequests: 3 },
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.', retryAfter },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  )
}

/**
 * Apply rate limiting to a request.
 * Returns a 429 response if limited, null if allowed.
 * Falls back to allowing all requests if Redis is not configured.
 */
export async function applyRateLimit(
  request: Request,
  configType: keyof typeof rateLimitConfigs,
  additionalIdentifier?: string
): Promise<NextResponse | null> {
  const limiter = getLimiter(configType)
  if (!limiter) {
    // Redis not configured — allow all (log warning in production)
    if (process.env.NODE_ENV === 'production' && !warnedMissingRedis) {
      warnedMissingRedis = true
      console.warn('[RateLimit] Upstash Redis not configured — rate limiting disabled')
    }
    return null
  }

  const ip = getClientIp(request)
  const identifier = additionalIdentifier ? `${ip}:${additionalIdentifier}` : ip

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Rate limit timeout')), 3000)
    )
    const { success, reset } = await Promise.race([limiter.limit(identifier), timeout])
    if (!success) {
      return rateLimitResponse(reset)
    }
  } catch (err) {
    console.warn('[RateLimit] Redis error, failing open:', err)
  }

  return null
}

// Legacy sync wrapper for backward compatibility — checks nothing if Redis not configured
export function checkRateLimit(): { limited: boolean; remaining: number; resetAt: number } {
  // Distributed rate limiting is now async via applyRateLimit()
  // This sync function exists only for backward compatibility and does nothing
  return { limited: false, remaining: 999, resetAt: Date.now() + 60000 }
}
