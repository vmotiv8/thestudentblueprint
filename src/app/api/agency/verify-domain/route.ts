import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import dns from 'dns'
import { promisify } from 'util'
import {
  addDomainToVercel,
  removeDomainFromVercel,
  getDomainFromVercel,
  checkDomainConfig,
} from '@/lib/vercel-domains'
import { applyRateLimit } from '@/lib/rate-limit'
import type { Organization } from '@/types'

const resolveCname = promisify(dns.resolveCname)

async function getAuthenticatedAdmin(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value

  if (!adminId) return null

  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, organization_id, organization:organizations(plan_type, domain, domain_verified)')
    .eq('id', adminId)
    .single()

  if (error || !admin) return null
  return admin
}

export async function POST(request: Request) {
  // Rate limit: 5 domain verification attempts per minute
  const rateLimitResponse = await applyRateLimit(request, 'strict', 'verify-domain')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = createServerSupabaseClient()
    const admin = await getAuthenticatedAdmin(supabase)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Check uniqueness
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('domain', domain.toLowerCase())
      .neq('id', admin.organization_id)
      .single()

    if (existingOrg) {
      return NextResponse.json(
        { error: 'This domain is already in use by another organization' },
        { status: 400 }
      )
    }

    // Verify DNS CNAME record
    try {
      const cnameRecords = await resolveCname(domain)
      const validCnames = ['cname.vercel-dns.com', 'vercel-dns.com']
      const isValid = cnameRecords.some((record) =>
        validCnames.some((valid) => record.toLowerCase().includes(valid))
      )

      if (!isValid) {
        return NextResponse.json(
          {
            error: `DNS not configured correctly. Found CNAME: ${cnameRecords.join(', ')}. Expected: cname.vercel-dns.com`,
            verified: false,
          },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        {
          error: 'No CNAME record found. Please add the DNS record and try again. DNS changes can take up to 48 hours to propagate.',
          verified: false,
        },
        { status: 400 }
      )
    }

    // Add domain to Vercel project
    const vercelResult = await addDomainToVercel(domain.toLowerCase())
    if (!vercelResult.success) {
      return NextResponse.json(
        {
          error: vercelResult.error || 'Failed to add domain to hosting platform. Please try again.',
          verified: false,
        },
        { status: 400 }
      )
    }

    // Update organization with verified domain
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        domain: domain.toLowerCase(),
        domain_verified: true,
        domain_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.organization_id)

    if (updateError) {
      // Rollback: remove from Vercel if DB update fails
      await removeDomainFromVercel(domain.toLowerCase())
      return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 })
    }

    // Check SSL status
    const configResult = await checkDomainConfig(domain.toLowerCase())

    return NextResponse.json({
      verified: true,
      domain: domain.toLowerCase(),
      message: 'Domain verified and configured successfully',
      ssl_configured: configResult.configured,
      ssl_pending: !configResult.configured,
    })
  } catch (error) {
    console.error('Domain verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const admin = await getAuthenticatedAdmin(supabase)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = admin.organization as unknown as Organization

    if (!org.domain) {
      return NextResponse.json({ status: 'none', domain: null })
    }

    // Check DNS
    let dns_ok = false
    try {
      const cnameRecords = await resolveCname(org.domain)
      const validCnames = ['cname.vercel-dns.com', 'vercel-dns.com']
      dns_ok = cnameRecords.some((record) =>
        validCnames.some((valid) => record.toLowerCase().includes(valid))
      )
    } catch {
      dns_ok = false
    }

    // Check Vercel status
    const vercelStatus = await getDomainFromVercel(org.domain)
    const configStatus = await checkDomainConfig(org.domain)

    return NextResponse.json({
      status: 'configured',
      domain: org.domain,
      verified: org.domain_verified || false,
      dns_configured: dns_ok,
      vercel_added: vercelStatus.exists,
      ssl_configured: configStatus.configured,
    })
  } catch (error) {
    console.error('Domain status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check domain status' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()
    const admin = await getAuthenticatedAdmin(supabase)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = admin.organization as unknown as Organization

    if (org.domain) {
      // Remove from Vercel
      const vercelResult = await removeDomainFromVercel(org.domain)
      if (!vercelResult.success) {
        console.error('Failed to remove domain from Vercel:', vercelResult.error)
        // Continue anyway — don't block DB cleanup
      }
    }

    // Clear domain fields in DB
    const { error } = await supabase
      .from('organizations')
      .update({
        domain: null,
        domain_verified: false,
        domain_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.organization_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Domain removal error:', error)
    return NextResponse.json(
      { error: 'Failed to remove domain' },
      { status: 500 }
    )
  }
}
