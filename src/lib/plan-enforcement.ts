import { createServerSupabaseClient } from './supabase'
import type { Organization } from '@/types'

/**
 * Returns true if the organization has an active subscription/license.
 *
 * Rules:
 *   - 'active'  => always allowed (both subscription and one_time)
 *   - 'trial'   => allowed only if trial_ends_at is in the future (subscription only)
 *   - all other statuses (past_due, canceled, suspended) => NOT allowed
 */
export function isSubscriptionActive(
  org: Pick<Organization, 'subscription_status' | 'trial_ends_at' | 'billing_type'>
): boolean {
  if (org.subscription_status === 'active') return true

  if ((org.billing_type ?? 'subscription') === 'one_time') return false

  if (org.subscription_status === 'trial' && org.trial_ends_at) {
    return new Date(org.trial_ends_at) > new Date()
  }

  return false
}

/**
 * Checks if a new student can be added to the org.
 * Verifies: subscription active AND student limit not reached.
 */
export function canAddStudent(
  org: Pick<Organization, 'subscription_status' | 'trial_ends_at' | 'billing_type' | 'max_students' | 'current_students_count'>
): { allowed: boolean; reason?: string } {
  if (!isSubscriptionActive(org)) {
    return { allowed: false, reason: 'Your subscription is not active. Please contact support to restore access.' }
  }

  if (org.max_students !== -1 && org.current_students_count >= org.max_students) {
    return { allowed: false, reason: `Student license limit reached (${org.max_students} max). Please upgrade your plan to add more students.` }
  }

  return { allowed: true }
}

/**
 * Queries the actual active admin count for an org from the database.
 */
export async function getAdminCount(orgId: string): Promise<number> {
  const supabase = createServerSupabaseClient()
  const { count, error } = await supabase
    .from('admins')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_active', true)

  if (error) throw error
  return count ?? 0
}

/**
 * Checks if a new admin can be added to the org.
 * Verifies: subscription active AND admin limit not reached.
 * Async because it queries current admin count from DB.
 */
export async function canAddAdmin(
  org: Pick<Organization, 'id' | 'subscription_status' | 'trial_ends_at' | 'billing_type' | 'max_admins'>
): Promise<{ allowed: boolean; reason?: string }> {
  if (!isSubscriptionActive(org)) {
    return { allowed: false, reason: 'Your subscription is not active. Please contact support to restore access.' }
  }

  if (org.max_admins === -1) {
    return { allowed: true }
  }

  const currentCount = await getAdminCount(org.id)
  if (currentCount >= org.max_admins) {
    return { allowed: false, reason: `Admin limit reached (${org.max_admins} max). Please upgrade your plan to add more admins.` }
  }

  return { allowed: true }
}
