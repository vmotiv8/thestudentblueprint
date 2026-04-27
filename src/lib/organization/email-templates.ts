/**
 * Email Template System for White-Label Organizations
 *
 * This module provides customizable email templates that respect
 * organization branding settings.
 */

import { getAppUrl, buildUrl, buildResultsUrl, buildOrgAssessmentUrl } from '@/lib/url'

export interface OrganizationBranding {
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  customEmailFrom: string | null
  customEmailReplyTo: string | null
  removeBranding: boolean
}

export interface EmailTemplateConfig {
  type:
    | 'student_invite'
    | 'assessment_complete'
    | 'resume_code'
    | 'otp'
    | 'admin_invite'
    | 'welcome'
  organization: OrganizationBranding
  data: Record<string, unknown>
}

/**
 * Generate a fully branded email HTML template
 */
export function generateEmailTemplate(config: EmailTemplateConfig): string {
  const { type, organization, data } = config

  switch (type) {
    case 'student_invite':
      return generateStudentInviteTemplate(organization, data)
    case 'assessment_complete':
      return generateAssessmentCompleteTemplate(organization, data)
    case 'resume_code':
      return generateResumeCodeTemplate(organization, data)
    case 'otp':
      return generateOTPTemplate(organization, data)
    default:
      throw new Error(`Unknown email template type: ${type}`)
  }
}

/**
 * Get the "from" email address with organization branding
 */
export function getFromEmail(
  organization: OrganizationBranding,
  defaultFrom: string
): string {
  if (organization.customEmailFrom) {
    // Extract just the email part from default, wrap with custom name
    const emailMatch = defaultFrom.match(/<(.+)>/)
    const email = emailMatch ? emailMatch[1] : defaultFrom
    return `${organization.customEmailFrom} <${email}>`
  }
  return defaultFrom
}

/**
 * Get the reply-to email address
 */
export function getReplyTo(organization: OrganizationBranding): string | undefined {
  return organization.customEmailReplyTo || undefined
}

// Template Generators

function generateStudentInviteTemplate(
  org: OrganizationBranding,
  data: Record<string, unknown>
): string {
  const { couponCode, message } = data as {
    couponCode?: string | null
    message?: string | null
  }

  const assessmentUrl = buildOrgAssessmentUrl(org.slug)
  const poweredBy = org.removeBranding
    ? ''
    : '<p style="margin: 8px 0 0; color: #5a7a9a; font-size: 12px;">Powered by The Student Blueprint Platform</p>'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${org.name}!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e0d5; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 40px; text-align: center;">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;">`
                  : `<div style="font-size: 32px; color: ${org.secondaryColor}; font-weight: bold; margin-bottom: 10px;">${org.name}</div>`
              }
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">You're Invited!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: ${org.primaryColor}; font-size: 22px; font-weight: 700;">Discover Your Personalized Roadmap</h2>
              <p style="margin: 0 0 24px; color: #5a7a9a; font-size: 16px; line-height: 1.6;">
                ${org.name} has invited you to take a comprehensive student assessment. This tool will help you identify your strengths, map out your college journey, and discover your unique student archetype.
              </p>

              ${
                message
                  ? `
                <div style="background-color: #faf8f3; border-left: 4px solid ${org.secondaryColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0; color: ${org.primaryColor}; font-size: 15px; font-style: italic;">"${message}"</p>
                </div>
              `
                  : ''
              }

              ${
                couponCode
                  ? `
                <div style="background-color: ${org.secondaryColor}15; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; color: ${org.primaryColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Your Access Code</p>
                  <p style="margin: 0; color: ${org.primaryColor}; font-size: 32px; font-weight: 800; letter-spacing: 4px;">${couponCode}</p>
                </div>
              `
                  : ''
              }

              <div style="text-align: center; margin-top: 32px;">
                <a href="${assessmentUrl}" style="display: inline-block; background-color: ${org.primaryColor}; color: #ffffff; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  Start My Assessment →
                </a>
                <p style="margin: 16px 0 0; color: #5a7a9a; font-size: 13px;">Takes about one hour to complete. You can save and resume later.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f3; padding: 30px; text-align: center; border-top: 1px solid #e5e0d5;">
              <p style="margin: 0; color: #5a7a9a; font-size: 14px;">&copy; ${new Date().getFullYear()} ${org.name}. All rights reserved.</p>
              ${poweredBy}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generateAssessmentCompleteTemplate(
  org: OrganizationBranding,
  data: Record<string, unknown>
): string {
  const { studentName, archetype, assessmentId, competitivenessScore, immediateActions } =
    data as {
      studentName: string
      archetype: string
      assessmentId: string
      competitivenessScore: number
      immediateActions: string[]
    }

  const dashboardUrl = buildResultsUrl(assessmentId)
  const poweredBy = org.removeBranding
    ? ''
    : `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.6); font-size: 12px;">Powered by The Student Blueprint</p>`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Results Are Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${org.primaryColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 60px 40px; text-align: center;">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 180px; max-height: 70px; margin-bottom: 24px;">`
                  : `<div style="font-size: 36px; color: ${org.secondaryColor}; font-weight: bold; margin-bottom: 16px;">${org.name}</div>`
              }
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 40px; font-weight: 800; letter-spacing: -1px;">Your Roadmap Is Ready!</h1>
              <p style="margin: 0; color: ${org.secondaryColor}; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">Personalized Assessment Results</p>
              <div style="width: 80px; height: 3px; background-color: ${org.secondaryColor}; margin: 20px auto 0;"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 50px 40px 30px;">
              <div style="text-align: center;">
                <h2 style="margin: 0 0 16px; color: ${org.primaryColor}; font-size: 28px; font-weight: 700;">
                  Congratulations, ${studentName}!
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 17px; line-height: 1.7; max-width: 500px; margin: 0 auto;">
                  Your comprehensive personalized growth roadmap has been generated. We've analyzed your unique profile to create a personalized action plan.
                </p>
              </div>
            </td>
          </tr>

          <!-- Archetype & Score Cards -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 8px;">
                    <div style="background-color: ${org.secondaryColor}; border-radius: 16px; padding: 2px; height: 100%;">
                      <div style="background-color: #fef9e7; border-radius: 14px; padding: 28px 24px; text-align: center; height: 100%;">
                        <p style="margin: 0 0 12px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Your Archetype</p>
                        <h3 style="margin: 0; color: ${org.primaryColor}; font-size: 24px; font-weight: 800; line-height: 1.3;">${archetype}</h3>
                      </div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <div style="background-color: ${org.primaryColor}; border-radius: 16px; padding: 2px; height: 100%;">
                      <div style="background-color: #f0f4f8; border-radius: 14px; padding: 28px 24px; text-align: center; height: 100%;">
                        <p style="margin: 0 0 12px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Competitiveness</p>
                        <h3 style="margin: 0; color: ${org.primaryColor}; font-size: 32px; font-weight: 800;"><span style="color: ${org.secondaryColor};">${competitivenessScore}</span>/100</h3>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            immediateActions && immediateActions.length > 0
              ? `
          <!-- Immediate Actions -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; color: ${org.primaryColor}; font-size: 22px; font-weight: 700;">
                  Your Top Actions
                </h3>
              </div>

              ${immediateActions
                .slice(0, 3)
                .map(
                  (action, i) => `
                <div style="background-color: ${i % 2 === 0 ? '#f8f6f1' : '#ffffff'}; border-left: 4px solid ${org.secondaryColor}; border-radius: 12px; padding: 20px 24px; margin-bottom: 12px; display: table; width: 100%;">
                  <div style="display: table-cell; width: 50px; vertical-align: top;">
                    <div style="width: 36px; height: 36px; background-color: ${org.secondaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px;">${i + 1}</div>
                  </div>
                  <div style="display: table-cell; vertical-align: middle; padding-left: 4px;">
                    <p style="margin: 0; color: ${org.primaryColor}; font-size: 15px; line-height: 1.6; font-weight: 500;">${action}</p>
                  </div>
                </div>
              `
                )
                .join('')}
            </td>
          </tr>
          `
              : ''
          }

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 50px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: ${org.secondaryColor}; color: ${org.primaryColor}; padding: 20px 56px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">
                View Your Complete Roadmap →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 40px; text-align: center; border-top: 1px solid ${org.secondaryColor};">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 120px; max-height: 40px; margin-bottom: 16px; filter: brightness(0) invert(1);">`
                  : `<h4 style="margin: 0 0 8px; color: ${org.secondaryColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${org.name}</h4>`
              }
              <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.8;">Your personalized growth roadmap</p>
              ${poweredBy}
              <div style="width: 50px; height: 2px; background-color: ${org.secondaryColor}; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generateResumeCodeTemplate(
  org: OrganizationBranding,
  data: Record<string, unknown>
): string {
  const { studentName, uniqueCode } = data as {
    studentName: string
    uniqueCode: string
  }

  const resumeUrl = buildUrl('/resume')
  const poweredBy = org.removeBranding
    ? ''
    : `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.6); font-size: 12px;">Powered by The Student Blueprint</p>`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Assessment Resume Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${org.primaryColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 60px 40px 50px; text-align: center;">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;">`
                  : `<h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">${org.name}</h1>`
              }
              <div style="width: 60px; height: 3px; background-color: ${org.secondaryColor}; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="margin: 0 0 16px; color: ${org.primaryColor}; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                  Progress Saved!
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 18px; line-height: 1.6; max-width: 500px; margin: 0 auto;">
                  Great progress, <strong style="color: ${org.primaryColor};">${studentName}</strong>! Your assessment has been securely saved.
                </p>
              </div>

              <!-- Resume Code Card -->
              <div style="background-color: ${org.secondaryColor}; border-radius: 20px; padding: 3px; margin: 40px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="background-color: #fef9e7; border-radius: 18px; padding: 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #f4e4b8; border-radius: 12px; padding: 8px 20px; margin-bottom: 16px;">
                    <p style="margin: 0; color: ${org.primaryColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Your Resume Code</p>
                  </div>
                  <h3 style="margin: 0; color: ${org.primaryColor}; font-size: 48px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">${uniqueCode}</h3>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 50px 0 40px;">
                <a href="${resumeUrl}" style="display: inline-block; background-color: ${org.primaryColor}; color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 17px;">
                  Continue Assessment →
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color: #f8f6f1; border-left: 4px solid ${org.secondaryColor}; border-radius: 12px; padding: 24px; margin-top: 40px;">
                <p style="margin: 0; color: #5a7a9a; font-size: 15px; line-height: 1.7;">
                  <strong style="color: ${org.primaryColor}; font-size: 16px;">Pro Tip:</strong><br>
                  Save this email! Your unique code <strong style="color: ${org.secondaryColor}; font-family: 'Courier New', monospace;">${uniqueCode}</strong> works from any device, anywhere.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 40px; text-align: center; border-top: 1px solid ${org.secondaryColor};">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 100px; max-height: 35px; margin-bottom: 12px;">`
                  : `<h4 style="margin: 0 0 8px; color: ${org.secondaryColor}; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">${org.name}</h4>`
              }
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized growth roadmap</p>
              ${poweredBy}
              <div style="width: 40px; height: 2px; background-color: ${org.secondaryColor}; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generateOTPTemplate(
  org: OrganizationBranding,
  data: Record<string, unknown>
): string {
  const { studentName, otpCode } = data as {
    studentName: string
    otpCode: string
  }

  const poweredBy = org.removeBranding
    ? ''
    : `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.6); font-size: 12px;">Powered by The Student Blueprint</p>`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${org.primaryColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 50px 40px; text-align: center;">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;">`
                  : `<h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">${org.name}</h1>`
              }
              <div style="width: 60px; height: 3px; background-color: ${org.secondaryColor}; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 16px; color: ${org.primaryColor}; font-size: 24px; font-weight: 700; text-align: center;">Your Login Code</h2>
              <p style="margin: 0 0 32px; color: #5a7a9a; font-size: 16px; line-height: 1.6; text-align: center;">
                Hi ${studentName},<br>
                Use this code to access your assessment:
              </p>

              <!-- OTP Code -->
              <div style="background-color: ${org.secondaryColor}; border-radius: 16px; padding: 3px; margin: 32px 0;">
                <div style="background-color: #fef9e7; border-radius: 14px; padding: 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #f4e4b8; border-radius: 8px; padding: 6px 16px; margin-bottom: 12px;">
                    <p style="margin: 0; color: ${org.primaryColor}; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">One-Time Password</p>
                  </div>
                  <h3 style="margin: 0; color: ${org.primaryColor}; font-size: 56px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otpCode}</h3>
                </div>
              </div>

              <!-- Info Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 32px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>This code expires in 10 minutes</strong><br>
                  For security, never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${org.primaryColor}; padding: 40px; text-align: center; border-top: 1px solid ${org.secondaryColor};">
              ${
                org.logoUrl
                  ? `<img src="${org.logoUrl}" alt="${org.name}" style="max-width: 100px; max-height: 35px; margin-bottom: 12px;">`
                  : `<h4 style="margin: 0 0 8px; color: ${org.secondaryColor}; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">${org.name}</h4>`
              }
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized growth roadmap</p>
              ${poweredBy}
              <div style="width: 40px; height: 2px; background-color: ${org.secondaryColor}; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Default branding for the platform (used when no organization context)
 */
export const defaultBranding: OrganizationBranding = {
  name: 'The Student Blueprint',
  slug: '',
  logoUrl: null,
  primaryColor: '#1e3a5f',
  secondaryColor: '#c9a227',
  customEmailFrom: null,
  customEmailReplyTo: null,
  removeBranding: false,
}

/**
 * Helper to create organization branding from database record
 */
export function createBrandingFromOrg(org: {
  name: string
  slug: string
  logo_url?: string | null
  primary_color?: string
  secondary_color?: string
  custom_email_from?: string | null
  custom_email_reply_to?: string | null
  remove_branding?: boolean
}): OrganizationBranding {
  return {
    name: org.name,
    slug: org.slug,
    logoUrl: org.logo_url || null,
    primaryColor: org.primary_color || defaultBranding.primaryColor,
    secondaryColor: org.secondary_color || defaultBranding.secondaryColor,
    customEmailFrom: org.custom_email_from || null,
    customEmailReplyTo: org.custom_email_reply_to || null,
    removeBranding: org.remove_branding || false,
  }
}
