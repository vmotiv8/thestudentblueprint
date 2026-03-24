import { NextResponse } from 'next/server';
import { resolveOrganization, getOrganizationBySlug } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    // Check for explicit org slug in query params (set by middleware rewrite or client)
    const { searchParams } = new URL(request.url);
    const orgSlug = searchParams.get('org');

    let organization = null;
    if (orgSlug) {
      organization = await getOrganizationBySlug(orgSlug);
    }
    if (!organization) {
      organization = await resolveOrganization(request);
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Return only public branding info
    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo_url: organization.logo_url,
      primary_color: organization.primary_color,
      secondary_color: organization.secondary_color,
      assessment_price: organization.assessment_price,
      free_assessments: organization.free_assessments,
    });
  } catch (error: any) {
    console.error('Error fetching tenant info:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
