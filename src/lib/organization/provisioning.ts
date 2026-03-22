import { createServerSupabaseClient } from '@/lib/supabase'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { PLAN_CONFIGS } from '@/lib/billing-plans'

export interface CreateOrganizationInput {
  name: string
  slug: string
  ownerEmail: string
  ownerPassword: string
  ownerName?: string
  planType?: 'starter' | 'pro' | 'enterprise'
  billingEmail?: string
  primaryColor?: string
  secondaryColor?: string
  logoUrl?: string
  assessmentPrice?: number
  trialDays?: number
}

export interface ProvisioningResult {
  success: boolean
  organization?: {
    id: string
    name: string
    slug: string
    apiKey: string
  }
  admin?: {
    id: string
    email: string
  }
  error?: string
}

/**
 * Default organization settings for new organizations
 */
const DEFAULT_ORG_SETTINGS = {
  sendParentEmails: true,
  sendStudentEmails: true,
  enabledSections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  customQuestions: [],
}

/**
 * Generate a secure API key for the organization
 */
function generateApiKey(): string {
  const prefix = 'sb_live_'
  const key = randomBytes(32).toString('base64url')
  return `${prefix}${key}`
}

/**
 * Provision a complete organization with all required resources
 */
export async function provisionOrganization(input: CreateOrganizationInput): Promise<ProvisioningResult> {
  const supabase = createServerSupabaseClient()

  try {
    // 1. Validate inputs
    const slug = input.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    // Check for duplicate slug
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingOrg) {
      return { success: false, error: 'Organization URL is already taken' }
    }

    // Check for duplicate admin email
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', input.ownerEmail.toLowerCase())
      .single()

    if (existingAdmin) {
      return { success: false, error: 'Email is already registered' }
    }

    // 2. Get plan configuration
    const planType = input.planType || 'starter'
    const planConfig = PLAN_CONFIGS[planType]

    // 3. Calculate trial end date
    const trialDays = input.trialDays ?? 14
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    // 4. Generate API key
    const apiKey = generateApiKey()

    // 5. Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug,
        billing_email: input.billingEmail || input.ownerEmail,
        plan_type: planType,
        subscription_status: 'trial',
        max_students: planConfig.maxStudents,
        max_admins: planConfig.maxAdmins,
        current_students_count: 0,
        assessment_price: input.assessmentPrice ?? 47,
        primary_color: input.primaryColor || '#1e3a5f',
        secondary_color: input.secondaryColor || '#c9a227',
        logo_url: input.logoUrl || null,
        api_key: apiKey,
        settings: DEFAULT_ORG_SETTINGS,
        trial_ends_at: trialEndsAt.toISOString(),
        remove_branding: false,
        custom_email_from: null,
        custom_email_reply_to: null,
        webhook_url: null,
        domain: null,
      })
      .select()
      .single()

    if (orgError || !organization) {
      console.error('Failed to create organization:', orgError)
      return { success: false, error: 'Failed to create organization' }
    }

    // 6. Create owner admin account
    const passwordHash = await bcrypt.hash(input.ownerPassword, 12)
    const ownerName = input.ownerName || input.ownerEmail.split('@')[0]
    const [firstName, ...lastNames] = ownerName.split(' ')

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .insert({
        email: input.ownerEmail.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastNames.join(' ') || null,
        role: 'owner',
        organization_id: organization.id,
        is_active: true,
      })
      .select()
      .single()

    if (adminError || !admin) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id)
      console.error('Failed to create admin:', adminError)
      return { success: false, error: 'Failed to create admin account' }
    }

    // Steps 7-10 are non-critical — failures should not block provisioning
    try {
      // 7. Create default coupon for the organization
      await supabase.from('coupons').insert({
        organization_id: organization.id,
        code: `WELCOME${slug.toUpperCase().slice(0, 6)}`,
        discount_type: 'percentage',
        discount_value: 10,
        max_uses: 50,
        current_uses: 0,
        is_active: true,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      })
    } catch (e) { console.error('Non-critical: coupon creation failed:', e) }

    try {
      // 8. Create default FAQs
      const defaultFaqs = [
        {
          organization_id: organization.id,
          question: 'How long does the assessment take?',
          answer: 'The assessment typically takes about one hour to complete. You can save your progress and return later if needed.',
          sort_order: 1,
          is_active: true,
        },
        {
          organization_id: organization.id,
          question: 'What happens after I complete the assessment?',
          answer: 'You will receive a comprehensive personalized report with your student archetype, strengths analysis, and a detailed roadmap for college success.',
          sort_order: 2,
          is_active: true,
        },
        {
          organization_id: organization.id,
          question: 'Can I retake the assessment?',
          answer: 'Each assessment purchase is for a single comprehensive evaluation. Contact us if you need to update your information.',
          sort_order: 3,
          is_active: true,
        },
      ]
      await supabase.from('cms_faqs').insert(defaultFaqs)
    } catch (e) { console.error('Non-critical: FAQ creation failed:', e) }

    try {
      // 9. Create audit log entry
      await supabase.from('audit_logs').insert({
        organization_id: organization.id,
        admin_id: admin.id,
        action: 'organization_created',
        entity_type: 'organization',
        entity_id: organization.id,
        new_values: {
          name: organization.name,
          slug: organization.slug,
          plan_type: planType,
        },
      })
    } catch (e) { console.error('Non-critical: audit log failed:', e) }

    try {
      // 10. Initialize usage tracking
      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      await supabase.from('usage_logs').insert({
        organization_id: organization.id,
        metric: 'organization_created',
        count: 1,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      })
    } catch (e) { console.error('Non-critical: usage log failed:', e) }

    return {
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        apiKey,
      },
      admin: {
        id: admin.id,
        email: admin.email,
      },
    }

  } catch (error) {
    console.error('Organization provisioning error:', error)
    return { success: false, error: 'An unexpected error occurred during setup' }
  }
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', normalizedSlug)
    .single()

  return !data
}

/**
 * Generate a unique slug from organization name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

/**
 * Upgrade organization plan
 */
export async function upgradeOrganizationPlan(
  organizationId: string,
  newPlanType: 'starter' | 'pro' | 'enterprise'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()
  const planConfig = PLAN_CONFIGS[newPlanType]

  const { error } = await supabase
    .from('organizations')
    .update({
      plan_type: newPlanType,
      max_students: planConfig.maxStudents,
      max_admins: planConfig.maxAdmins,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)

  if (error) {
    return { success: false, error: 'Failed to upgrade plan' }
  }

  return { success: true }
}

/**
 * Get organization feature access
 */
export function getOrganizationFeatures(planType: 'starter' | 'pro' | 'enterprise'): string[] {
  return PLAN_CONFIGS[planType].featureFlags
}

/**
 * Check if organization has access to a feature
 */
export function hasFeatureAccess(planType: 'starter' | 'pro' | 'enterprise', feature: string): boolean {
  return PLAN_CONFIGS[planType].featureFlags.includes(feature)
}
