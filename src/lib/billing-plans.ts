/**
 * Centralized billing plan configuration.
 * Used by both the billing API and the provisioning system.
 */

export interface BillingPlan {
  id: 'starter' | 'pro' | 'enterprise'
  name: string
  price: number
  priceDisplay: string
  students: number
  admins: number
  features: string[]
  popular?: boolean
}

export interface PlanConfig {
  maxStudents: number
  maxAdmins: number
  featureFlags: string[]
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    priceDisplay: '$99/mo',
    students: 100,
    admins: 5,
    features: [
      'Up to 100 students',
      'Up to 5 admin accounts',
      'Basic branding (logo & colors)',
      'Custom domain support',
      'Email support',
      'Standard reports',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceDisplay: '$299/mo',
    students: 500,
    admins: 15,
    features: [
      'Up to 500 students',
      'Up to 15 admin accounts',
      'Full branding customization',
      'Custom domain support',
      'Priority email support',
      'Advanced analytics',
      'Custom email templates',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    priceDisplay: '$999/mo',
    students: -1,
    admins: -1,
    features: [
      'Unlimited students',
      'Unlimited admin accounts',
      'White-label branding',
      'Remove all platform branding',
      'Dedicated support',
      'API access',
      'Custom integrations',
    ],
  },
]

export const PLAN_CONFIGS: Record<BillingPlan['id'], PlanConfig> = {
  starter: {
    maxStudents: 100,
    maxAdmins: 5,
    featureFlags: ['basic_analytics', 'email_invites', 'pdf_reports', 'custom_domain'],
  },
  pro: {
    maxStudents: 500,
    maxAdmins: 15,
    featureFlags: ['basic_analytics', 'email_invites', 'pdf_reports', 'custom_emails', 'api_access', 'webhooks', 'custom_domain'],
  },
  enterprise: {
    maxStudents: -1,
    maxAdmins: -1,
    featureFlags: ['basic_analytics', 'email_invites', 'pdf_reports', 'custom_emails', 'api_access', 'webhooks', 'white_label', 'remove_branding', 'custom_domain', 'priority_support'],
  },
}

export function getPlanConfig(planType: BillingPlan['id']): PlanConfig {
  return PLAN_CONFIGS[planType]
}

export function getPlanById(planId: string): BillingPlan | undefined {
  return BILLING_PLANS.find(p => p.id === planId)
}

export function hasFeature(planType: BillingPlan['id'], feature: string): boolean {
  return PLAN_CONFIGS[planType].featureFlags.includes(feature)
}

export function formatPlanPrice(price: number | null, billingType: 'subscription' | 'one_time'): string {
  if (price === null || price === undefined) return '—'
  if (billingType === 'one_time') return `$${price} one-time`
  return `$${price}/mo`
}
