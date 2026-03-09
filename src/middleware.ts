import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|public).*)',
  ],
};

// Known top-level app routes that should NOT be treated as org slugs
const RESERVED_PATHS = new Set([
  'admin', 'agency', 'api', 'assessment', 'checkout', 'login',
  'payment', 'platform', 'privacy',
  'reset-password', 'results', 'resume', 'terms', 'org',
]);

// In-memory cache for custom domain → slug lookups (persists within edge worker)
const domainCache = new Map<string, { slug: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;     // 5 min positive cache
const NEG_CACHE_TTL = 60 * 1000;     // 1 min negative cache

async function lookupDomainSlug(hostname: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return null;

  try {
    // Direct REST call to Supabase PostgREST — edge-runtime compatible
    const response = await fetch(
      `${supabaseUrl}/rest/v1/organizations?domain=eq.${encodeURIComponent(hostname)}&domain_verified=eq.true&select=slug&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length > 0 && data[0].slug) {
      return data[0].slug;
    }
  } catch {
    // Fail silently — pass through rather than block
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Check for path-based tenant: /org/[slug]/...
  const pathMatch = url.pathname.match(/^\/org\/([^/]+)(.*)/);
  if (pathMatch) {
    const slug = pathMatch[1];
    const rest = pathMatch[2] || '/';

    url.searchParams.set('org', slug);
    url.pathname = rest;

    return NextResponse.rewrite(url);
  }

  // 2. Check for slug-prefixed paths: /[slug] or /[slug]/checkout etc.
  const slugPrefixMatch = url.pathname.match(/^\/([a-z0-9-]+)(\/.*)?$/);
  if (slugPrefixMatch) {
    const maybeSlug = slugPrefixMatch[1];
    if (!RESERVED_PATHS.has(maybeSlug)) {
      url.searchParams.set('org', maybeSlug);
      url.pathname = slugPrefixMatch[2] || '/';
      return NextResponse.rewrite(url);
    }
  }

  // 3. Check for subdomain-based tenant: [slug].thestudentblueprint.com
  const subdomain = hostname.split('.')[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const rootDomainBase = rootDomain.split(':')[0];

  if (
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== 'app' &&
    subdomain !== 'api' &&
    subdomain !== 'admin' &&
    !hostname.startsWith(rootDomain) &&
    hostname.includes(rootDomainBase)
  ) {
    url.searchParams.set('org', subdomain);
    return NextResponse.rewrite(url);
  }

  // 4. Check for custom domain: assessments.agency.com → org slug via DB lookup
  const isKnownHost =
    hostname === rootDomain ||
    hostname.includes(rootDomainBase) ||
    hostname.includes('localhost') ||
    hostname.includes('vercel.app');

  if (!isKnownHost) {
    const now = Date.now();
    const cached = domainCache.get(hostname);

    if (cached && cached.expires > now) {
      if (cached.slug) {
        url.searchParams.set('org', cached.slug);
        return NextResponse.rewrite(url);
      }
      // Negative cache hit — domain not found
      return NextResponse.next();
    }

    // Cache miss — query Supabase
    const slug = await lookupDomainSlug(hostname);
    if (slug) {
      domainCache.set(hostname, { slug, expires: now + CACHE_TTL });
      url.searchParams.set('org', slug);
      return NextResponse.rewrite(url);
    } else {
      // Negative cache — avoid hitting DB on every request for unknown domains
      domainCache.set(hostname, { slug: '', expires: now + NEG_CACHE_TTL });
    }
  }

  return NextResponse.next();
}
