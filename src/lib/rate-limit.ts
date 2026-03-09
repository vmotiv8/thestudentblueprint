import { NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object indicating if rate limited and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++
  rateLimitStore.set(key, entry)

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  )
}

// Pre-configured rate limiters for common use cases
export const rateLimitConfigs = {
  // Strict: 5 requests per minute (for sensitive operations like OTP, login)
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // Standard: 30 requests per minute (for general API operations)
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // Lenient: 100 requests per minute (for read operations)
  lenient: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Bulk: 10 requests per 5 minutes (for bulk operations)
  bulk: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },
}

/**
 * Convenience wrapper for rate limiting in API routes
 * @param request - The request object
 * @param configType - Pre-configured rate limit type
 * @param additionalIdentifier - Additional identifier to combine with IP (e.g., route name)
 * @returns NextResponse if rate limited, null otherwise
 */
export function applyRateLimit(
  request: Request,
  configType: keyof typeof rateLimitConfigs,
  additionalIdentifier?: string
): NextResponse | null {
  const ip = getClientIp(request)
  const identifier = additionalIdentifier ? `${ip}:${additionalIdentifier}` : ip
  const config = rateLimitConfigs[configType]

  const { limited, resetAt } = checkRateLimit(identifier, config)

  if (limited) {
    return rateLimitResponse(resetAt)
  }

  return null
}
