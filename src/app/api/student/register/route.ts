// src/app/api/student/register/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { sendResumeCodeEmail } from '@/lib/resend'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Issue #2: Rate limiting
  const rateLimitResponse = await applyRateLimit(request, 'standard', 'student-register')
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Issue #4: Wrap request.json() in try/catch
    let body: {
      fullName: string
      email: string
      phone?: string
      sessionId?: string
      couponCode?: string
      organizationSlug?: string
      referralCode?: string
    }
    try {
      body = await request.json()
    } catch (e) {
      console.error('[StudentRegister] Invalid JSON body:', e)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { fullName, email, phone, sessionId, couponCode, organizationSlug, referralCode } = body

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required (min 2 characters)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Resolve organization
    const organization = organizationSlug
      ? await getOrganizationBySlug(organizationSlug)
      : await getDefaultOrganization()

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Determine payment status
    let paymentStatus: 'paid' | 'free' | 'unpaid' = 'unpaid'
    const normalizedCouponCode = couponCode ? couponCode.trim().toUpperCase() : null
    let validatedCoupon: {
      id: string
      discount_type: string
      max_uses: number | null
      current_uses: number
      valid_until: string | null
    } | null = null

    if (organization.free_assessments) {
      paymentStatus = 'free'
    } else if (sessionId) {
      // Verify Stripe payment
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('stripe_session_id', sessionId)
        .eq('organization_id', organization.id)
        .single()

      if (payment?.status === 'completed') {
        paymentStatus = 'paid'
      }
    }

    // Validate coupon if provided
    if (normalizedCouponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, discount_type, max_uses, current_uses, valid_until, is_active')
        .eq('code', normalizedCouponCode)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .single()

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json({ error: 'Coupon has reached its usage limit' }, { status: 400 })
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
      }

      paymentStatus = coupon.discount_type === 'free' ? 'free' : 'paid'
      validatedCoupon = coupon
    }

    const incrementCouponUsage = async () => {
      if (!validatedCoupon) return null

      const previousUses = validatedCoupon.current_uses || 0
      if (validatedCoupon.max_uses && previousUses >= validatedCoupon.max_uses) {
        return NextResponse.json({ error: 'Coupon has reached its usage limit' }, { status: 400 })
      }

      const { data, error: incrementError } = await supabase
        .from('coupons')
        .update({ current_uses: previousUses + 1 })
        .eq('id', validatedCoupon.id)
        .eq('current_uses', previousUses)
        .select('id, current_uses')
        .maybeSingle()

      if (incrementError) {
        console.error('[StudentRegister] Coupon usage increment failed:', incrementError)
        return NextResponse.json({ error: 'Coupon usage conflict. Please try again.' }, { status: 409 })
      }
      if (!data) {
        return NextResponse.json({ error: 'Coupon usage changed. Please try again.' }, { status: 409 })
      }

      validatedCoupon.current_uses = data.current_uses
      return null
    }

    // Check org student limits
    if (organization.max_students !== -1) {
      const { count: actualCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      if (actualCount !== null && actualCount >= organization.max_students) {
        return NextResponse.json(
          { error: `Student license limit reached (${organization.max_students} max). Please upgrade your plan.` },
          { status: 403 }
        )
      }
    }

    // Generate unique 8-character resume code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
      return code
    }

    // Parse name
    const trimmedName = fullName.trim()
    const nameParts = trimmedName.split(/\s+/)
    const firstName = nameParts[0] || null
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    // Look up existing student by email + org, or create new
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id, unique_code')
      .eq('organization_id', organization.id)
      .eq('email', email.trim())
      .maybeSingle()

    let studentId: string
    let uniqueCode: string
    let isNewStudent = false

    if (existingStudent) {
      studentId = existingStudent.id
      uniqueCode = existingStudent.unique_code || generateCode()

      await supabase
        .from('students')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName,
          unique_code: uniqueCode,
          phone: phone?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStudent.id)
    } else {
      uniqueCode = generateCode()
      isNewStudent = true

      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          organization_id: organization.id,
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName,
          unique_code: uniqueCode,
          phone: phone?.trim() || null,
        })
        .select('id')
        .single()

      if (studentError) throw studentError
      studentId = newStudent.id
    }

    // Increment student count for new students
    if (isNewStudent) {
      await supabase.rpc('increment_students_count', { org_id: organization.id, amount: 1 })
        .then(({ error: rpcErr }) => {
          if (rpcErr) console.error('[StudentRegister] increment_students_count failed:', rpcErr.message)
        })
    }

    // Check for existing in-progress assessment
    let assessmentId: string

    // Issue #3: Deduplicated assessment insert — resolve existing or fall through to single insert
    if (existingStudent) {
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('id, coupon_code, coupon_code_used')
        .eq('student_id', studentId)
        .eq('organization_id', organization.id)
        .in('status', ['in_progress', 'partial'])
        .maybeSingle()

      if (existingAssessment) {
        assessmentId = existingAssessment.id
        const existingCouponCode = existingAssessment.coupon_code || existingAssessment.coupon_code_used || null
        if (normalizedCouponCode && existingCouponCode !== normalizedCouponCode) {
          const incrementResponse = await incrementCouponUsage()
          if (incrementResponse) return incrementResponse
        }

        // Update payment status if needed
        await supabase
          .from('assessments')
          .update({
            payment_status: paymentStatus,
            ...(normalizedCouponCode ? { coupon_code: normalizedCouponCode, coupon_code_used: normalizedCouponCode } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAssessment.id)

        // Send resume code email (fire and forget — don't block response)
        sendResumeCodeEmail(email.trim(), trimmedName, uniqueCode).catch((err) => {
          console.error('[StudentRegister] Failed to send resume code email:', err)
        })

        const earlyResponse = NextResponse.json({
          success: true,
          studentId,
          assessmentId,
          uniqueCode,
        })
        earlyResponse.cookies.set('verified_email', email.trim().toLowerCase(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        })
        return earlyResponse
      }
    }

    if (normalizedCouponCode) {
      const incrementResponse = await incrementCouponUsage()
      if (incrementResponse) return incrementResponse
    }

    // Single assessment insert for both new students and existing students without an in-progress assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        organization_id: organization.id,
        student_id: studentId,
        status: 'in_progress',
        current_section: 1,
        payment_status: paymentStatus,
        coupon_code: normalizedCouponCode,
        coupon_code_used: normalizedCouponCode,
        responses: {
          basicInfo: {
            fullName: trimmedName,
            email: email.trim(),
            phone: phone?.trim() || '',
          },
        },
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (assessmentError) throw assessmentError
    assessmentId = assessment.id

    // Track referral if referral code provided
    if (referralCode) {
      try {
        const { data: refPartner } = await supabase
          .from('referral_partners')
          .select('id')
          .eq('referral_code', referralCode.toUpperCase().trim())
          .in('status', ['active', 'invited'])
          .single()

        if (refPartner) {
          // Determine sale amount
          let saleAmount = Number(organization.assessment_price) || 0
          if (sessionId) {
            const { data: paymentRecord } = await supabase
              .from('payments')
              .select('amount')
              .eq('stripe_session_id', sessionId)
              .single()
            if (paymentRecord?.amount != null) {
              saleAmount = Number(paymentRecord.amount)
            }
          } else if (couponCode || organization.free_assessments) {
            saleAmount = 0
          }

          await supabase.from('referral_students').insert({
            partner_id: refPartner.id,
            student_email: email.trim(),
            student_name: trimmedName,
            payment_status: 'paid',
            sale_amount: saleAmount,
            stripe_session_id: sessionId || null,
          })
        }
      } catch (refErr) {
        console.error('[StudentRegister] Referral tracking error:', refErr)
        // Non-blocking — don't fail registration for referral issues
      }
    }

    // Send resume code email (fire and forget — don't block response)
    sendResumeCodeEmail(email.trim(), trimmedName, uniqueCode).catch((err) => {
      console.error('[StudentRegister] Failed to send resume code email:', err)
    })

    const response = NextResponse.json({
      success: true,
      studentId,
      assessmentId,
      uniqueCode,
    })

    // Set verified_email cookie so the results page can access the assessment
    response.cookies.set('verified_email', email.trim().toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    // Issue #5: Structured error logging
    const err = error as { message?: string; code?: string; details?: string; hint?: string; stack?: string }
    const errorMessage = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[StudentRegister] Error:', {
      message: errorMessage,
      code: err.code,
      details: err.details,
      hint: err.hint,
      stack: err.stack || (error instanceof Error ? error.stack : undefined),
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: 'Failed to register student. Please try again.' },
      { status: 500 }
    )
  }
}
