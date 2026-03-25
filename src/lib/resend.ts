import { Resend } from 'resend'
import { getAppUrl, buildUrl, buildResultsUrl, buildAdminLoginUrl } from '@/lib/url'
import { createServerSupabaseClient } from '@/lib/supabase'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'The Student Blueprint <onboarding@resend.dev>'

async function logEmailSend(template: string, to: string, success: boolean, error?: unknown) {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.from('email_logs').insert({
      template,
      recipient: to,
      success,
      error_message: error ? (error instanceof Error ? error.message : JSON.stringify(error)) : null,
      sent_at: new Date().toISOString(),
    })
  } catch {
    // Logging should never block email delivery
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function sendResumeCodeEmail(
  to: string,
  studentName: string,
  uniqueCode: string
) {
  const resumeUrl = buildUrl('/resume')
  const safeStudentName = escapeHtml(studentName)
  const safeUniqueCode = escapeHtml(uniqueCode)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your The Student Blueprint Assessment Resume Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 60px 40px 50px; text-align: center;">
              <div style="width: 90px; height: 90px; background-color: #c9a227; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 44px; line-height: 1;">💾</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <div style="width: 60px; height: 3px; background-color: #c9a227; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                  Progress Saved! 🎉
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 18px; line-height: 1.6; max-width: 500px; margin: 0 auto;">
                  Great progress, <strong style="color: #1e3a5f;">${safeStudentName}</strong>! Your assessment has been securely saved.
                </p>
              </div>

            <!-- Resume Code Card -->
            <div style="background-color: #c9a227; border-radius: 20px; padding: 3px; margin: 40px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <div style="background-color: #fef9e7; border-radius: 18px; padding: 40px; text-align: center;">
                <div style="display: inline-block; background-color: #f4e4b8; border-radius: 12px; padding: 8px 20px; margin-bottom: 16px;">
                  <p style="margin: 0; color: #1e3a5f; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Your Resume Code</p>
                </div>
                <h3 style="margin: 0; color: #1e3a5f; font-size: 48px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">${safeUniqueCode}</h3>
              </div>
            </div>

              <!-- Step-by-Step Guide -->
              <div style="margin: 50px 0;">
                <h3 style="margin: 0 0 24px; color: #1e3a5f; font-size: 20px; font-weight: 700; text-align: center;">
                  📝 How to Resume Your Assessment
                </h3>
                
              <div style="display: table; width: 100%; margin-bottom: 16px;">
                <div style="display: table-cell; width: 50px; vertical-align: top;">
                  <div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">1</div>
                </div>
                <div style="display: table-cell; vertical-align: top; padding-top: 8px;">
                  <p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;">
                    Visit <a href="${resumeUrl}" style="color: #c9a227; text-decoration: none; font-weight: 600; border-bottom: 2px solid #c9a227;">${resumeUrl}</a>
                  </p>
                </div>
              </div>

              <div style="width: 2px; height: 20px; background-color: #c9a227; margin-left: 19px; opacity: 0.3;"></div>
              
              <div style="display: table; width: 100%; margin-bottom: 16px;">
                <div style="display: table-cell; width: 50px; vertical-align: top;">
                  <div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">2</div>
                </div>
                <div style="display: table-cell; vertical-align: top; padding-top: 8px;">
                  <p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;">
                    Select the <strong style="color: #c9a227;">"By Code"</strong> tab
                  </p>
                </div>
              </div>

              <div style="width: 2px; height: 20px; background-color: #c9a227; margin-left: 19px; opacity: 0.3;"></div>
              
              <div style="display: table; width: 100%; margin-bottom: 16px;">
                <div style="display: table-cell; width: 50px; vertical-align: top;">
                  <div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">3</div>
                </div>
                <div style="display: table-cell; vertical-align: top; padding-top: 8px;">
                  <p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;">
                    Enter your code: <code style="background-color: #f8f6f1; padding: 4px 12px; border-radius: 6px; color: #c9a227; font-weight: 700; border: 1px solid #c9a227;">${safeUniqueCode}</code>
                  </p>
                </div>
              </div>
              </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 50px 0 40px;">
              <a href="${resumeUrl}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 17px;">
                Continue Assessment →
              </a>
            </div>

            <!-- Info Box -->
            <div style="background-color: #f8f6f1; border-left: 4px solid #c9a227; border-radius: 12px; padding: 24px; margin-top: 40px;">
              <p style="margin: 0; color: #5a7a9a; font-size: 15px; line-height: 1.7;">
                <strong style="color: #1e3a5f; font-size: 16px;">💡 Pro Tip:</strong><br>
                Save this email! Your unique code <strong style="color: #c9a227; font-family: 'Courier New', monospace;">${safeUniqueCode}</strong> works from any device, anywhere. Start on your phone, finish on your laptop—we've got you covered!
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
            <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">The Student Blueprint</h4>
            <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized path to college success</p>
            <div style="width: 40px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
          </td>
        </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `💾 Your The Student Blueprint Resume Code: ${safeUniqueCode}`,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('resume_code', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('resume_code', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send resume code email:', error)
    await logEmailSend('resume_code', to, false, error)
    return { success: false, error }
  }
}

export async function sendStudentInviteEmail(props: {
  to: string
  assessmentUrl: string
  couponCode: string | null
  message: string | null
  orgName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  fromName?: string
  replyTo?: string | null
}) {
  const { to, assessmentUrl, couponCode, message, orgName, logoUrl, primaryColor, secondaryColor, fromName, replyTo } = props

  const safePrimaryColor = isValidHexColor(primaryColor) ? primaryColor : '#1e3a5f'
  const safeSecondaryColor = isValidHexColor(secondaryColor) ? secondaryColor : '#c9a227'
  const safeOrgName = escapeHtml(orgName)
  const safeMessage = message ? escapeHtml(message) : null
  const safeCouponCode = couponCode ? escapeHtml(couponCode) : null
  const safeLogoUrl = logoUrl && isValidUrl(logoUrl) ? logoUrl : null

  const fromEmail = fromName
    ? `${escapeHtml(fromName)} ${FROM_EMAIL.includes('<') ? FROM_EMAIL.substring(FROM_EMAIL.indexOf('<')) : `<${FROM_EMAIL}>`}`
    : FROM_EMAIL

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${safeOrgName}!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e0d5; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${safePrimaryColor}; padding: 40px; text-align: center;">
              ${safeLogoUrl ?
                `<img src="${safeLogoUrl}" alt="${safeOrgName}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;">` :
                `<div style="font-size: 32px; color: ${safeSecondaryColor}; font-weight: bold; margin-bottom: 10px;">${safeOrgName}</div>`
              }
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">You're Invited!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: ${safePrimaryColor}; font-size: 22px; font-weight: 700;">Discover Your Personalized Roadmap</h2>
              <p style="margin: 0 0 24px; color: #5a7a9a; font-size: 16px; line-height: 1.6;">
                ${safeOrgName} has invited you to take a comprehensive student assessment. This tool will help you identify your strengths, map out your college journey, and discover your unique student archetype.
              </p>

              ${safeMessage ? `
                <div style="background-color: #faf8f3; border-left: 4px solid ${safeSecondaryColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0; color: ${safePrimaryColor}; font-size: 15px; font-style: italic;">"${safeMessage}"</p>
                </div>
              ` : ''}

              ${safeCouponCode ? `
                <div style="background-color: ${safeSecondaryColor}15; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; color: ${safePrimaryColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Your Access Code</p>
                  <p style="margin: 0; color: ${safePrimaryColor}; font-size: 32px; font-weight: 800; letter-spacing: 4px;">${safeCouponCode}</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 32px;">
                <a href="${assessmentUrl}" style="display: inline-block; background-color: ${safePrimaryColor}; color: #ffffff; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  Start My Assessment →
                </a>
                <p style="margin: 16px 0 0; color: #5a7a9a; font-size: 13px;">Takes about one hour to complete. You can save and resume later.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f3; padding: 30px; text-align: center; border-top: 1px solid #e5e0d5;">
              <p style="margin: 0; color: #5a7a9a; font-size: 14px;">&copy; ${new Date().getFullYear()} ${safeOrgName}. All rights reserved.</p>
              <p style="margin: 8px 0 0; color: #5a7a9a; font-size: 12px;">Powered by The Student Blueprint Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    console.log(`[Email:invite] Sending to ${to} from "${fromEmail}" for org "${orgName}"`)

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      ...(replyTo ? { replyTo } : {}),
      subject: `You're Invited to ${safeOrgName} - Your College Success Roadmap`,
      html
    })

    if (error) {
      console.error(`[Email:invite] Resend API error for ${to}:`, {
        error,
        from: fromEmail,
        orgName,
        timestamp: new Date().toISOString(),
      })
      await logEmailSend('student_invite', to, false, error)
      return { success: false, error }
    }

    console.log(`[Email:invite] Successfully sent to ${to}, id: ${data?.id}`)
    await logEmailSend('student_invite', to, true)
    return { success: true, data }
  } catch (error) {
    console.error(`[Email:invite] Exception sending to ${to}:`, {
      error: error instanceof Error ? error.message : error,
      from: fromEmail,
      orgName,
      timestamp: new Date().toISOString(),
    })
    await logEmailSend('student_invite', to, false, error)
    return { success: false, error }
  }
}

export async function sendStudentResultsEmail(
  to: string,
  studentName: string,
  archetype: string,
  assessmentId: string,
  analysis: Record<string, unknown>,
  orgBranding?: {
    orgName?: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fromName?: string
    replyTo?: string
  }
) {
  const dashboardUrl = buildResultsUrl(assessmentId)

  const roadmap = analysis.roadmap as { immediate: string[] } | undefined
  const immediateActions = roadmap?.immediate?.slice(0, 3) || []
  const competitivenessScore = (analysis.competitivenessScore as number) ?? 75
  const safeStudentName = escapeHtml(studentName)
  const safeArchetype = escapeHtml(archetype)

  // White-label colors and name from organization
  const brandName = orgBranding?.orgName || 'The Student Blueprint'
  const primaryColor = (orgBranding?.primaryColor && isValidHexColor(orgBranding.primaryColor)) ? orgBranding.primaryColor : '#1e3a5f'
  const accentColor = (orgBranding?.secondaryColor && isValidHexColor(orgBranding.secondaryColor)) ? orgBranding.secondaryColor : '#c9a227'
  const safeBrandName = escapeHtml(brandName)
  const logoHtml = orgBranding?.logoUrl && isValidUrl(orgBranding.logoUrl)
    ? `<img src="${escapeHtml(orgBranding.logoUrl)}" alt="${safeBrandName}" style="max-height: 48px; max-width: 200px; margin-bottom: 16px;" />`
    : `<div style="font-size: 64px; line-height: 1; margin-bottom: 24px;">&#127891;</div>`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${safeBrandName} Results Are Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${primaryColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 60px 40px; text-align: center;">
              ${logoHtml}
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 40px; font-weight: 800; letter-spacing: -1px;">Your Roadmap Is Ready!</h1>
              <p style="margin: 0; color: ${accentColor}; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">Personalized Assessment Results</p>
              <div style="width: 80px; height: 3px; background-color: ${accentColor}; margin: 20px auto 0;"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 50px 40px 30px;">
              <div style="text-align: center;">
                <h2 style="margin: 0 0 16px; color: ${primaryColor}; font-size: 28px; font-weight: 700;">
                  Congratulations, ${safeStudentName}! &#127881;
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 17px; line-height: 1.7; max-width: 500px; margin: 0 auto;">
                  Your comprehensive college success roadmap has been generated. We've analyzed your unique profile to create a personalized action plan for Ivy League success.
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
                    <div style="background-color: ${accentColor}; border-radius: 16px; padding: 2px; height: 100%;">
                      <div style="background-color: #fef9e7; border-radius: 14px; padding: 28px 24px; text-align: center; height: 100%;">
                        <p style="margin: 0 0 12px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Your Archetype</p>
                        <h3 style="margin: 0; color: ${primaryColor}; font-size: 24px; font-weight: 800; line-height: 1.3;">${safeArchetype}</h3>
                      </div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <div style="background-color: ${primaryColor}; border-radius: 16px; padding: 2px; height: 100%;">
                      <div style="background-color: #f0f4f8; border-radius: 14px; padding: 28px 24px; text-align: center; height: 100%;">
                        <p style="margin: 0 0 12px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Competitiveness</p>
                        <h3 style="margin: 0; color: ${primaryColor}; font-size: 32px; font-weight: 800;"><span style="color: ${accentColor};">${competitivenessScore}</span>/100</h3>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Immediate Actions -->
          ${immediateActions.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; color: ${primaryColor}; font-size: 22px; font-weight: 700;">
                  &#127919; Your Top 3 Immediate Actions
                </h3>
              </div>

                ${immediateActions.map((action, i) => `
                <div style="background-color: ${i % 2 === 0 ? '#f8f6f1' : '#ffffff'}; border-left: 4px solid ${accentColor}; border-radius: 12px; padding: 20px 24px; margin-bottom: 12px; display: table; width: 100%;">
                  <div style="display: table-cell; width: 50px; vertical-align: top;">
                    <div style="width: 36px; height: 36px; background-color: ${accentColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px;">${i + 1}</div>
                  </div>
                  <div style="display: table-cell; vertical-align: middle; padding-left: 4px;">
                    <p style="margin: 0; color: ${primaryColor}; font-size: 15px; line-height: 1.6; font-weight: 500;">${escapeHtml(String(action))}</p>
                  </div>
                </div>
                `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 50px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: ${accentColor}; color: ${primaryColor}; padding: 20px 56px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">
                View Your Complete Roadmap &rarr;
              </a>
            </td>
          </tr>

          <!-- What's Inside -->
          <tr>
            <td style="padding: 0 40px 50px;">
              <div style="background-color: ${primaryColor}; border-radius: 16px; padding: 36px;">
                <h4 style="margin: 0 0 24px; color: ${accentColor}; font-size: 18px; font-weight: 700; text-align: center;">&#128202; Inside Your Dashboard</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding: 0 8px 16px 0;">
                      <div style="display: flex; align-items: flex-start;">
                        <span style="font-size: 24px; margin-right: 12px;">🧬</span>
                        <div>
                          <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4;">Personality Analysis</p>
                          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.4;">Interactive archetype radar chart</p>
                        </div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 16px 8px;">
                      <div style="display: flex; align-items: flex-start;">
                        <span style="font-size: 24px; margin-right: 12px;">🗓️</span>
                        <div>
                          <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4;">Timeline Roadmap</p>
                          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.4;">Grade-by-grade action plan</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 0 8px 16px 0;">
                      <div style="display: flex; align-items: flex-start;">
                        <span style="font-size: 24px; margin-right: 12px;">💡</span>
                        <div>
                          <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4;">Passion Projects</p>
                          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.4;">Tailored to your interests</p>
                        </div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 16px 8px;">
                      <div style="display: flex; align-items: flex-start;">
                        <span style="font-size: 24px; margin-right: 12px;">📈</span>
                        <div>
                          <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4;">Gap Analysis</p>
                          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.4;">What's missing from your profile</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 8px; text-align: center;">
                        <div style="display: inline-flex; align-items: center; background-color: ${accentColor}; border-radius: 8px; padding: 10px 16px;">
                          <span style="font-size: 20px; margin-right: 10px;">&#128196;</span>
                          <span style="color: ${primaryColor}; font-size: 13px; font-weight: 600;">Plus downloadable PDF report</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: ${primaryColor}; padding: 40px; text-align: center; border-top: 1px solid ${accentColor};">
                <h4 style="margin: 0 0 8px; color: ${accentColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${safeBrandName}</h4>
                <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.8;">Your personalized path to college success</p>
                <div style="width: 50px; height: 2px; background-color: ${accentColor}; margin: 20px auto 0;"></div>
              </td>
            </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    // Use org branding for from name if available
    const fromName = orgBranding?.fromName || 'The Student Blueprint'
    const fromEmail = FROM_EMAIL.includes('<')
      ? `${fromName} ${FROM_EMAIL.substring(FROM_EMAIL.indexOf('<'))}`
      : `${fromName} <${FROM_EMAIL}>`

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      ...(orgBranding?.replyTo ? { replyTo: orgBranding.replyTo } : {}),
      subject: `Your Personalized Roadmap is Ready, ${safeStudentName}!`,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('student_results', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('student_results', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    await logEmailSend('student_results', to, false, error)
    return { success: false, error }
  }
}

export async function sendParentEmail(
  to: string,
  studentName: string,
  archetype: string,
  assessmentId: string,
  analysis: Record<string, unknown>
) {
  const dashboardUrl = buildResultsUrl(assessmentId)

  const forParents = analysis.forParentsCounselors as {
    keyTalkingPoints?: string[]
    supportAreas?: string[]
  } | undefined

  const competitivenessScore = (analysis.competitivenessScore as number) ?? 75
  const safeStudentName = escapeHtml(studentName)
  const safeArchetype = escapeHtml(archetype)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeStudentName}'s Assessment Results</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          
          <!-- Parent Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 50px 40px; text-align: center;">
              <div style="display: inline-block; background-color: #c9a227; border-radius: 16px; padding: 16px 28px; margin-bottom: 20px;">
                <span style="font-size: 32px; line-height: 1;">👪</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <p style="margin: 0; color: #c9a227; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Parent Report</p>
              <div style="width: 60px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

          <!-- Student Info -->
          <tr>
            <td style="padding: 50px 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0 0 8px; color: #1e3a5f; font-size: 26px; font-weight: 700;">
                  ${safeStudentName}'s Assessment Complete ✓
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 16px;">Here's a summary of their personalized roadmap</p>
              </div>

              <!-- Profile Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                <tr>
                  <td width="58%" style="padding-right: 12px;">
                    <div style="background-color: #f8f6f1; border: 2px solid #c9a227; border-radius: 16px; padding: 28px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Student Archetype</p>
                      <h3 style="margin: 0; color: #1e3a5f; font-size: 22px; font-weight: 800; line-height: 1.3;">${safeArchetype}</h3>
                    </div>
                  </td>
                  <td width="42%" style="padding-left: 12px;">
                    <div style="background-color: #e8f4f8; border: 2px solid #5a7a9a; border-radius: 16px; padding: 28px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Score</p>
                      <h3 style="margin: 0; color: #1e3a5f; font-size: 28px; font-weight: 800;"><span style="color: #c9a227;">${competitivenessScore}</span>/100</h3>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Insights -->
          ${forParents?.keyTalkingPoints && forParents.keyTalkingPoints.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f8f6f1; border-radius: 16px; padding: 32px; border-left: 4px solid #c9a227;">
                <h3 style="margin: 0 0 20px; color: #1e3a5f; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 12px;">💡</span>
                  Key Insights About ${safeStudentName}
                </h3>
                <ul style="margin: 0; padding-left: 24px; color: #1e3a5f; font-size: 15px; line-height: 2;">
                  ${forParents.keyTalkingPoints.map(point => `<li style="margin-bottom: 8px;"><strong style="color: #5a7a9a;">•</strong> ${escapeHtml(String(point))}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Support Areas -->
          ${forParents?.supportAreas && forParents.supportAreas.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background-color: #e8f4f8; border-radius: 16px; padding: 32px; border-left: 4px solid #5a7a9a;">
                <h3 style="margin: 0 0 20px; color: #1e3a5f; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 12px;">🤝</span>
                  Where ${safeStudentName} Needs Support
                </h3>
                <ul style="margin: 0; padding-left: 24px; color: #1e3a5f; font-size: 15px; line-height: 2;">
                  ${forParents.supportAreas.map(area => `<li style="margin-bottom: 8px;"><strong style="color: #5a7a9a;">•</strong> ${escapeHtml(String(area))}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 20px 40px 50px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 17px;">
                View Complete Report →
              </a>
              <p style="margin: 20px 0 0; color: #5a7a9a; font-size: 13px;">Access the full roadmap, recommendations, and detailed analysis</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
              <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 800;">The Student Blueprint</h4>
              <p style="margin: 0; color: #ffffff; font-size: 13px; opacity: 0.8;">Supporting families on the path to college success</p>
              <div style="width: 50px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `📊 ${safeStudentName}'s The Student Blueprint Assessment Results`,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('parent_report', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('parent_report', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send parent email:', error)
    await logEmailSend('parent_report', to, false, error)
    return { success: false, error }
  }
}

export async function sendOTPEmail(to: string, studentName: string, otpCode: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your The Student Blueprint Login Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 50px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #c9a227; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px; line-height: 1;">🔐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <div style="width: 60px; height: 3px; background-color: #c9a227; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 700; text-align: center;">Your Login Code</h2>
              <p style="margin: 0 0 32px; color: #5a7a9a; font-size: 16px; line-height: 1.6; text-align: center;">
                Hi ${escapeHtml(studentName)},<br>
                Use this code to access your assessment:
              </p>

              <!-- OTP Code -->
              <div style="background-color: #c9a227; border-radius: 16px; padding: 3px; margin: 32px 0;">
                <div style="background-color: #fef9e7; border-radius: 14px; padding: 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #f4e4b8; border-radius: 8px; padding: 6px 16px; margin-bottom: 12px;">
                    <p style="margin: 0; color: #1e3a5f; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">One-Time Password</p>
                  </div>
                  <h3 style="margin: 0; color: #1e3a5f; font-size: 56px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otpCode}</h3>
                </div>
              </div>

              <!-- Info Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 32px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⏰ This code expires in 10 minutes</strong><br>
                  For security, never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
              <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">The Student Blueprint</h4>
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized path to college success</p>
              <div style="width: 40px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Your The Student Blueprint Login Code: ${otpCode}`,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('otp', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('otp', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    await logEmailSend('otp', to, false, error)
    return { success: false, error }
  }
}

export async function sendAgencyWelcomeEmail(
  to: string,
  agencyName: string,
  loginUrl: string,
  tempPassword: string,
  ownerName?: string
) {
  const greeting = ownerName ? `Welcome, ${escapeHtml(ownerName)}!` : 'Welcome!'
  const safeAgencyName = escapeHtml(agencyName)
  const safeTempPassword = escapeHtml(tempPassword)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Student Blueprint - Your Agency Account is Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 60px 40px 50px; text-align: center;">
              <div style="width: 90px; height: 90px; background-color: #c9a227; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 44px; line-height: 1;">&#127970;</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <div style="width: 60px; height: 3px; background-color: #c9a227; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                  ${greeting}
                </h2>
                <p style="margin: 0; color: #5a7a9a; font-size: 18px; line-height: 1.6; max-width: 500px; margin: 0 auto;">
                  Your agency account for <strong style="color: #1e3a5f;">${safeAgencyName}</strong> has been created and is ready to go.
                </p>
              </div>

              <!-- Credentials Card -->
              <div style="background-color: #c9a227; border-radius: 20px; padding: 3px; margin: 40px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="background-color: #fef9e7; border-radius: 18px; padding: 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #f4e4b8; border-radius: 12px; padding: 8px 20px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #1e3a5f; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Your Login Credentials</p>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px 0; text-align: left;"><span style="color: #5a7a9a; font-size: 14px; font-weight: 600;">Agency Name:</span></td>
                      <td style="padding: 12px 0; text-align: right;"><span style="color: #1e3a5f; font-size: 14px; font-weight: 700;">${safeAgencyName}</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; text-align: left; border-top: 1px solid #f4e4b8;"><span style="color: #5a7a9a; font-size: 14px; font-weight: 600;">Email:</span></td>
                      <td style="padding: 12px 0; text-align: right; border-top: 1px solid #f4e4b8;"><span style="color: #1e3a5f; font-size: 14px; font-weight: 700;">${escapeHtml(to)}</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; text-align: left; border-top: 1px solid #f4e4b8;"><span style="color: #5a7a9a; font-size: 14px; font-weight: 600;">Temporary Password:</span></td>
                      <td style="padding: 12px 0; text-align: right; border-top: 1px solid #f4e4b8;"><code style="background-color: #ffffff; padding: 6px 14px; border-radius: 8px; color: #1e3a5f; font-weight: 800; font-size: 16px; border: 2px solid #c9a227; letter-spacing: 1px;">${safeTempPassword}</code></td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Warning Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.7;">
                  <strong style="font-size: 16px;">Important:</strong><br>
                  Please change your password immediately after your first login for security purposes.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 50px 0 40px;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 17px;">
                  Log In to Your Dashboard
                </a>
              </div>

              <!-- Next Steps -->
              <div style="margin: 50px 0;">
                <h3 style="margin: 0 0 24px; color: #1e3a5f; font-size: 20px; font-weight: 700; text-align: center;">Next Steps</h3>
                <div style="display: table; width: 100%; margin-bottom: 16px;">
                  <div style="display: table-cell; width: 50px; vertical-align: top;"><div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">1</div></div>
                  <div style="display: table-cell; vertical-align: top; padding-top: 8px;"><p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;"><strong style="color: #c9a227;">Complete Onboarding</strong> &mdash; Log in and finish setting up your agency profile</p></div>
                </div>
                <div style="width: 2px; height: 20px; background-color: #c9a227; margin-left: 19px; opacity: 0.3;"></div>
                <div style="display: table; width: 100%; margin-bottom: 16px;">
                  <div style="display: table-cell; width: 50px; vertical-align: top;"><div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">2</div></div>
                  <div style="display: table-cell; vertical-align: top; padding-top: 8px;"><p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;"><strong style="color: #c9a227;">Customize Branding</strong> &mdash; Upload your logo and set your brand colors</p></div>
                </div>
                <div style="width: 2px; height: 20px; background-color: #c9a227; margin-left: 19px; opacity: 0.3;"></div>
                <div style="display: table; width: 100%; margin-bottom: 16px;">
                  <div style="display: table-cell; width: 50px; vertical-align: top;"><div style="width: 40px; height: 40px; background-color: #c9a227; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">3</div></div>
                  <div style="display: table-cell; vertical-align: top; padding-top: 8px;"><p style="margin: 0; color: #1e3a5f; font-size: 16px; line-height: 1.6;"><strong style="color: #c9a227;">Invite Your First Student</strong> &mdash; Start sending assessment invitations right away</p></div>
                </div>
              </div>

              <!-- Support Info Box -->
              <div style="background-color: #f8f6f1; border-left: 4px solid #c9a227; border-radius: 12px; padding: 24px; margin-top: 40px;">
                <p style="margin: 0; color: #5a7a9a; font-size: 15px; line-height: 1.7;">
                  <strong style="color: #1e3a5f; font-size: 16px;">Need Help?</strong><br>
                  Our support team is here for you. Reach out at <a href="mailto:support@thestudentblueprint.com" style="color: #c9a227; text-decoration: none; font-weight: 600;">support@thestudentblueprint.com</a> or reply directly to this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
              <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">The Student Blueprint</h4>
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized path to college success</p>
              <div style="width: 40px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Welcome to The Student Blueprint - Your Agency Account is Ready',
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('agency_welcome', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('agency_welcome', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send agency welcome email:', error)
    await logEmailSend('agency_welcome', to, false, error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - The Student Blueprint</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 50px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #c9a227; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px; line-height: 1;">&#128273;</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <div style="width: 60px; height: 3px; background-color: #c9a227; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 700; text-align: center;">Reset Your Password</h2>
              <p style="margin: 0 0 32px; color: #5a7a9a; font-size: 16px; line-height: 1.6; text-align: center;">
                We received a request to reset your password. Click the button below to set a new password.
              </p>

              <!-- CTA -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #c9a227; color: #1e3a5f; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 4px 14px rgba(201, 162, 39, 0.4);">
                  Reset Password
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 32px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>This link expires in 1 hour.</strong><br>
                  If you did not request a password reset, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
              <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">The Student Blueprint</h4>
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized path to college success</p>
              <div style="width: 40px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset Your Password - The Student Blueprint',
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('password_reset', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('password_reset', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    await logEmailSend('password_reset', to, false, error)
    return { success: false, error }
  }
}

export async function sendAdminInviteEmail(to: string, role: string, tempPassword: string, inviterEmail: string) {
  const adminLoginUrl = buildAdminLoginUrl()
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Student Blueprint Admin Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1e3a5f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 50px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #c9a227; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px; line-height: 1;">👑</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">The Student Blueprint</h1>
              <div style="width: 60px; height: 3px; background-color: #c9a227; margin: 16px auto 0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 700; text-align: center;">Admin Team Invitation</h2>
              <p style="margin: 0 0 32px; color: #5a7a9a; font-size: 16px; line-height: 1.6; text-align: center;">
                Welcome to the The Student Blueprint Admin Team!<br>
                You've been invited by <strong>${escapeHtml(inviterEmail)}</strong> to join as a <span style="background-color: #c9a227; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">${escapeHtml(role.replace('_', ' '))}</span>.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8f6f1; border: 2px solid #c9a227; border-radius: 16px; padding: 32px; margin: 32px 0;">
                <h3 style="margin: 0 0 20px; color: #1e3a5f; font-size: 18px; font-weight: 700; text-align: center;">🔐 Your Login Credentials</h3>
                
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #5a7a9a; font-size: 14px; font-weight: 600;">Email:</span>
                  <span style="font-family: 'Courier New', monospace; background-color: white; padding: 6px 12px; border-radius: 6px; border: 1px solid #e5e0d5; color: #1e3a5f; font-size: 14px;">${escapeHtml(to)}</span>
                </div>

                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #5a7a9a; font-size: 14px; font-weight: 600;">Password:</span>
                  <span style="font-family: 'Courier New', monospace; background-color: white; padding: 6px 12px; border-radius: 6px; border: 1px solid #e5e0d5; color: #1e3a5f; font-size: 14px;">${escapeHtml(tempPassword)}</span>
                </div>
              </div>

              <!-- Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 32px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Please change your password immediately after your first login for security purposes.
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${adminLoginUrl}" style="display: inline-block; background-color: #c9a227; color: #1e3a5f; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 4px 14px rgba(201, 162, 39, 0.4);">
                  🚀 Access Admin Dashboard
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px; text-align: center; border-top: 1px solid #c9a227;">
              <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">The Student Blueprint</h4>
              <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; opacity: 0.8;">Your personalized path to college success</p>
              <div style="width: 40px; height: 2px; background-color: #c9a227; margin: 20px auto 0;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '🎉 The Student Blueprint Admin Invitation',
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmailSend('admin_invite', to, false, error)
      return { success: false, error }
    }

    await logEmailSend('admin_invite', to, true)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send admin invite email:', error)
    await logEmailSend('admin_invite', to, false, error)
    return { success: false, error }
  }
}
