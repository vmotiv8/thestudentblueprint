// src/app/api/student/register/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { sendResumeCodeEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, sessionId, couponCode, organizationSlug } = body as {
      fullName: string
      email: string
      phone?: string
      sessionId?: string
      couponCode?: string
      organizationSlug?: string
    }

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
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, discount_type, max_uses, current_uses, valid_until, is_active')
        .eq('code', couponCode.toUpperCase())
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

    // Generate unique 6-character resume code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
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

    if (existingStudent) {
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .eq('organization_id', organization.id)
        .in('status', ['in_progress', 'partial'])
        .maybeSingle()

      if (existingAssessment) {
        assessmentId = existingAssessment.id
        // Update payment status if needed
        await supabase
          .from('assessments')
          .update({
            payment_status: paymentStatus,
            ...(couponCode ? { coupon_code: couponCode.toUpperCase() } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAssessment.id)
      } else {
        // Create new assessment for existing student
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            organization_id: organization.id,
            student_id: studentId,
            status: 'in_progress',
            current_section: 1,
            payment_status: paymentStatus,
            coupon_code: couponCode ? couponCode.toUpperCase() : null,
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
      }
    } else {
      // Create new assessment for new student
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          organization_id: organization.id,
          student_id: studentId,
          status: 'in_progress',
          current_section: 1,
          payment_status: paymentStatus,
          coupon_code: couponCode ? couponCode.toUpperCase() : null,
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
    }

    // Send resume code email (fire and forget — don't block response)
    sendResumeCodeEmail(email.trim(), trimmedName, uniqueCode).catch((err) => {
      console.error('[StudentRegister] Failed to send resume code email:', err)
    })

    return NextResponse.json({
      success: true,
      studentId,
      assessmentId,
      uniqueCode,
    })
  } catch (error) {
    console.error('[StudentRegister] Error:', error)
    return NextResponse.json(
      { error: 'Failed to register student. Please try again.' },
      { status: 500 }
    )
  }
}
