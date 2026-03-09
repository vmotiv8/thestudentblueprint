import { createServerSupabaseClient } from '@/lib/supabase'
import { randomBytes, createHmac } from 'crypto'

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'assessment.started'
  | 'assessment.completed'
  | 'assessment.paid'
  | 'student.created'
  | 'student.invited'
  | 'report.generated'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'

/**
 * Webhook payload structure
 */
export interface WebhookPayload<T = Record<string, unknown>> {
  id: string
  event: WebhookEventType
  organization_id: string
  created_at: string
  data: T
}

/**
 * Webhook delivery status
 */
export interface WebhookDeliveryResult {
  success: boolean
  statusCode?: number
  error?: string
  deliveredAt: string
  retryCount: number
}

/**
 * Generate a webhook signature for payload verification
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret)
  return signature === expectedSignature
}

/**
 * Generate a unique webhook event ID
 */
function generateEventId(): string {
  return `evt_${randomBytes(16).toString('hex')}`
}

/**
 * Send a webhook to an organization's configured endpoint
 */
export async function sendWebhook<T = Record<string, unknown>>(
  organizationId: string,
  event: WebhookEventType,
  data: T,
  options?: {
    maxRetries?: number
    retryDelay?: number
  }
): Promise<WebhookDeliveryResult> {
  const supabase = createServerSupabaseClient()
  const maxRetries = options?.maxRetries ?? 3
  const retryDelay = options?.retryDelay ?? 1000

  // Get organization webhook config
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('webhook_url, api_key, name')
    .eq('id', organizationId)
    .single()

  if (orgError || !org || !org.webhook_url) {
    return {
      success: false,
      error: 'No webhook URL configured',
      deliveredAt: new Date().toISOString(),
      retryCount: 0,
    }
  }

  // Build payload
  const payload: WebhookPayload<T> = {
    id: generateEventId(),
    event,
    organization_id: organizationId,
    created_at: new Date().toISOString(),
    data,
  }

  const payloadString = JSON.stringify(payload)
  const signature = generateWebhookSignature(payloadString, org.api_key || '')

  // Attempt delivery with retries
  let lastError: string | undefined
  let statusCode: number | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(org.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-ID': payload.id,
          'X-Organization-Name': org.name,
        },
        body: payloadString,
      })

      statusCode = response.status

      if (response.ok) {
        // Log successful delivery
        await logWebhookDelivery(supabase, {
          organization_id: organizationId,
          event_id: payload.id,
          event_type: event,
          url: org.webhook_url,
          status: 'delivered',
          status_code: statusCode,
          attempt_count: attempt + 1,
        })

        return {
          success: true,
          statusCode,
          deliveredAt: new Date().toISOString(),
          retryCount: attempt,
        }
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
    }

    // Wait before retry
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
    }
  }

  // Log failed delivery
  await logWebhookDelivery(supabase, {
    organization_id: organizationId,
    event_id: payload.id,
    event_type: event,
    url: org.webhook_url,
    status: 'failed',
    status_code: statusCode,
    error_message: lastError,
    attempt_count: maxRetries + 1,
  })

  return {
    success: false,
    statusCode,
    error: lastError,
    deliveredAt: new Date().toISOString(),
    retryCount: maxRetries,
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  data: {
    organization_id: string
    event_id: string
    event_type: WebhookEventType
    url: string
    status: 'delivered' | 'failed'
    status_code?: number
    error_message?: string
    attempt_count: number
  }
) {
  try {
    await supabase.from('webhook_logs').insert({
      organization_id: data.organization_id,
      event_id: data.event_id,
      event_type: data.event_type,
      webhook_url: data.url,
      status: data.status,
      status_code: data.status_code,
      error_message: data.error_message,
      attempt_count: data.attempt_count,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log webhook delivery:', error)
  }
}

/**
 * Convenience functions for common webhook events
 */
export const webhookEvents = {
  assessmentStarted: (organizationId: string, data: { assessmentId: string; studentEmail: string }) =>
    sendWebhook(organizationId, 'assessment.started', data),

  assessmentCompleted: (
    organizationId: string,
    data: {
      assessmentId: string
      studentEmail: string
      studentName: string
      archetype: string
      competitivenessScore: number
      reportUrl: string
    }
  ) => sendWebhook(organizationId, 'assessment.completed', data),

  assessmentPaid: (
    organizationId: string,
    data: {
      assessmentId: string
      studentEmail: string
      amount: number
      paymentId: string
    }
  ) => sendWebhook(organizationId, 'assessment.paid', data),

  studentCreated: (
    organizationId: string,
    data: {
      studentId: string
      email: string
      firstName?: string
      lastName?: string
    }
  ) => sendWebhook(organizationId, 'student.created', data),

  studentInvited: (
    organizationId: string,
    data: {
      email: string
      invitedBy?: string
      assessmentUrl: string
    }
  ) => sendWebhook(organizationId, 'student.invited', data),

  reportGenerated: (
    organizationId: string,
    data: {
      assessmentId: string
      studentEmail: string
      reportUrl: string
      pdfUrl?: string
    }
  ) => sendWebhook(organizationId, 'report.generated', data),
}
