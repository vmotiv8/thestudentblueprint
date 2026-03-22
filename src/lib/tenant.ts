import { createServerSupabaseClient } from './supabase';
import { cookies } from 'next/headers';
import type { Organization, Admin } from '@/types';

export interface TenantContext {
  organization: Organization;
  admin: Admin | null;
  isSuperAdmin: boolean;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) return null;
  return data as Organization;
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data as Organization;
}

export async function getOrganizationByDomain(domain: string): Promise<Organization | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('domain', domain)
    .single();
  
  if (error || !data) return null;
  return data as Organization;
}

export async function getDefaultOrganization(): Promise<Organization | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', 'studentblueprint')
    .single();
  
  if (error || !data) return null;
  return data as Organization;
}

export async function resolveOrganization(request: Request): Promise<Organization | null> {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  
  // Check /org/{slug} path
  const pathMatch = url.pathname.match(/^\/org\/([^/]+)/);
  if (pathMatch) {
    const org = await getOrganizationBySlug(pathMatch[1]);
    if (org) return org;
  }

  // Check /{slug}/checkout or /{slug}/assessment path patterns (used in invite links)
  const slugPathMatch = url.pathname.match(/^\/([^/]+)\/(checkout|assessment)/);
  if (slugPathMatch) {
    const org = await getOrganizationBySlug(slugPathMatch[1]);
    if (org) return org;
  }
  
  const subdomain = hostname.split('.')[0];
  const EXCLUDED_SUBDOMAINS = new Set(['www', 'localhost', 'api', 'admin', 'app']);
  if (subdomain && !EXCLUDED_SUBDOMAINS.has(subdomain)) {
    const org = await getOrganizationBySlug(subdomain);
    if (org) return org;
  }
  
  const org = await getOrganizationByDomain(hostname);
  if (org) return org;
  
  return getDefaultOrganization();
}

export async function getAdminFromCookies(): Promise<Admin | null> {
  const supabase = createServerSupabaseClient();
  
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_session')?.value;
    
    if (!adminId) return null;
    
    const { data, error } = await supabase
      .from('admins')
      .select('*, organization:organizations(*)')
      .eq('id', adminId)
      .eq('is_active', true)
      .single();
    
    if (error || !data) return null;
    return data as Admin;
  } catch {
    return null;
  }
}

export async function getTenantContext(request: Request): Promise<TenantContext | null> {
  const admin = await getAdminFromCookies();
  
  if (admin) {
    if (admin.role === 'super_admin') {
      const url = new URL(request.url);
      const orgSlug = url.searchParams.get('org') || 
                      url.pathname.match(/^\/org\/([^/]+)/)?.[1];
      
      let organization: Organization | null = null;
      
      if (orgSlug) {
        organization = await getOrganizationBySlug(orgSlug);
      }
      
      if (!organization && admin.organization_id) {
        organization = await getOrganizationById(admin.organization_id);
      }
      
      if (!organization) {
        organization = await getDefaultOrganization();
      }
      
      if (!organization) return null;
      
      return {
        organization,
        admin,
        isSuperAdmin: true,
      };
    }
    
    if (admin.organization_id) {
      const organization = await getOrganizationById(admin.organization_id);
      if (!organization) return null;
      
      return {
        organization,
        admin,
        isSuperAdmin: false,
      };
    }
  }
  
  const organization = await resolveOrganization(request);
  if (!organization) return null;
  
  return {
    organization,
    admin: null,
    isSuperAdmin: false,
  };
}

export async function requireTenantContext(request: Request): Promise<TenantContext> {
  const context = await getTenantContext(request);
  if (!context) {
    throw new Error('Organization not found');
  }
  return context;
}

export async function requireAdminContext(request: Request): Promise<TenantContext> {
  const context = await getTenantContext(request);
  if (!context || !context.admin) {
    throw new Error('Unauthorized');
  }
  return context;
}

export async function requireSuperAdminContext(request: Request): Promise<TenantContext> {
  const context = await getTenantContext(request);
  if (!context || !context.admin || !context.isSuperAdmin) {
    throw new Error('Unauthorized - Super Admin required');
  }
  return context;
}
