/**
 * Get the base URL for the application
 * Falls back to localhost in development
 */
export function getAppUrl(): string {
  // Check multiple env vars for flexibility
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL

  if (url) {
    // Ensure the URL has a protocol
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Add https for production URLs
    return `https://${url}`
  }

  // Default to localhost in development
  return process.env.NODE_ENV === 'production'
    ? 'https://thestudentblueprint.com'
    : 'http://localhost:3000'
}

/**
 * Get the origin from request headers or fall back to app URL.
 * Validates against allowed hosts to prevent host header injection.
 */
export function getOriginFromRequest(request: Request): string {
  const appUrl = getAppUrl()

  // Build allowed hosts list from environment
  const allowedHosts = new Set<string>()
  try {
    allowedHosts.add(new URL(appUrl).host)
  } catch { /* ignore */ }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  if (rootDomain) allowedHosts.add(rootDomain)

  // Always allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    allowedHosts.add('localhost:3000')
    allowedHosts.add('localhost')
  }

  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (allowedHosts.has(originHost)) {
        return origin
      }
    } catch { /* invalid origin, fall through */ }
  }

  const host = request.headers.get('host')
  if (host && allowedHosts.has(host)) {
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  }

  return appUrl
}

/**
 * Build a URL for a specific path
 */
export function buildUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getAppUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Build a URL for an organization, using custom domain when available.
 * When org has a verified custom domain: https://{domain}/{path}
 * Otherwise falls back to: {baseUrl}/{slug}/{path}
 */
export function buildOrgUrl(
  org: { slug: string; domain?: string | null; domain_verified?: boolean },
  path?: string
): string {
  if (org.domain && org.domain_verified === true) {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
    return `https://${org.domain}${cleanPath}`
  }
  const base = getAppUrl()
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${base}/${org.slug}${cleanPath}`
}

/**
 * Build a URL for an organization's assessment
 */
export function buildOrgAssessmentUrl(orgSlug: string, path?: string, orgDomain?: string | null, freeAssessments?: boolean): string {
  const assessmentPath = path || (freeAssessments ? 'assessment' : 'checkout')
  if (orgDomain) {
    const cleanPath = assessmentPath.startsWith('/') ? assessmentPath : `/${assessmentPath}`
    return `https://${orgDomain}${cleanPath}`
  }
  const base = getAppUrl()
  return `${base}/${orgSlug}/${assessmentPath}`
}

/**
 * Build a URL for the results page
 */
export function buildResultsUrl(assessmentId: string): string {
  return buildUrl(`/results/${assessmentId}`)
}

/**
 * Build the admin login URL
 */
export function buildAdminLoginUrl(): string {
  return buildUrl('/admin/login')
}

/**
 * Build the agency portal URL
 */
export function buildAgencyUrl(path?: string): string {
  return buildUrl(`/agency${path ? `/${path}` : ''}`)
}
