const VERCEL_API_BASE = 'https://api.vercel.com'

function getVercelHeaders(): HeadersInit {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) throw new Error('VERCEL_API_TOKEN is not configured')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getTeamParam(): string {
  const teamId = process.env.VERCEL_TEAM_ID
  return teamId ? `?teamId=${teamId}` : ''
}

function getProjectId(): string {
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!projectId) throw new Error('VERCEL_PROJECT_ID is not configured')
  return projectId
}

export interface VercelDomainResponse {
  name: string
  apexName: string
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
  error?: { code: string; message: string }
}

export interface VercelDomainConfig {
  configuredBy: 'CNAME' | 'A' | 'http' | null
  acceptedChallenges?: string[]
  misconfigured: boolean
}

/**
 * Add a domain to the Vercel project.
 */
export async function addDomainToVercel(domain: string): Promise<{
  success: boolean
  data?: VercelDomainResponse
  error?: string
}> {
  try {
    const projectId = getProjectId()
    const url = `${VERCEL_API_BASE}/v10/projects/${projectId}/domains${getTeamParam()}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getVercelHeaders(),
      body: JSON.stringify({ name: domain }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error?.code === 'domain_already_in_use') {
        return {
          success: false,
          error: `Domain "${domain}" is already in use on another Vercel project. Remove it there first.`,
        }
      }
      // Already on this project — treat as success
      if (data.error?.code === 'domain_already_in_use_on_this_project') {
        return { success: true, data }
      }
      return {
        success: false,
        error: data.error?.message || `Vercel API error: ${response.status}`,
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add domain to Vercel',
    }
  }
}

/**
 * Remove a domain from the Vercel project.
 */
export async function removeDomainFromVercel(domain: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const projectId = getProjectId()
    const url = `${VERCEL_API_BASE}/v10/projects/${projectId}/domains/${domain}${getTeamParam()}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getVercelHeaders(),
    })

    // 404 means domain wasn't there — fine for removal
    if (!response.ok && response.status !== 404) {
      const data = await response.json()
      return {
        success: false,
        error: data.error?.message || `Vercel API error: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove domain from Vercel',
    }
  }
}

/**
 * Get domain status from Vercel project.
 */
export async function getDomainFromVercel(domain: string): Promise<{
  exists: boolean
  data?: VercelDomainResponse
  error?: string
}> {
  try {
    const projectId = getProjectId()
    const url = `${VERCEL_API_BASE}/v10/projects/${projectId}/domains/${domain}${getTeamParam()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getVercelHeaders(),
    })

    if (response.status === 404) {
      return { exists: false }
    }

    if (!response.ok) {
      const data = await response.json()
      return { exists: false, error: data.error?.message }
    }

    const data = await response.json()
    return { exists: true, data }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to check domain on Vercel',
    }
  }
}

/**
 * Check domain DNS configuration and SSL status.
 */
export async function checkDomainConfig(domain: string): Promise<{
  configured: boolean
  data?: VercelDomainConfig
  error?: string
}> {
  try {
    const url = `${VERCEL_API_BASE}/v6/domains/${domain}/config${getTeamParam()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getVercelHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      return {
        configured: false,
        error: data.error?.message || `Vercel API error: ${response.status}`,
      }
    }

    const data = await response.json()
    return {
      configured: !data.misconfigured,
      data,
    }
  } catch (error) {
    return {
      configured: false,
      error: error instanceof Error ? error.message : 'Failed to check domain config',
    }
  }
}
