import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (e) {
      console.error('[AssessmentSave] Invalid JSON body:', e)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const assessmentId = body.assessmentId as string | undefined
    const rawFormData = body.formData as Record<string, Record<string, unknown>> | undefined
    const currentSection = typeof body.currentSection === 'number' ? body.currentSection : null
    const couponCode = body.couponCode as string | undefined
    const normalizedCouponCode = couponCode ? couponCode.trim().toUpperCase() : null
    const organization_slug = body.organization_slug as string | undefined

    console.log('[AssessmentSave] Request:', { assessmentId: assessmentId || 'new', section: currentSection, org_slug: organization_slug, hasFormData: !!rawFormData })

    if (!rawFormData || typeof rawFormData !== 'object') {
      console.error('[AssessmentSave] Missing or invalid formData:', { hasFormData: !!rawFormData, type: typeof rawFormData })
      return NextResponse.json({ error: 'formData is required' }, { status: 400 })
    }

    const formData = rawFormData
    const supabase = createServerSupabaseClient()

    const organization = organization_slug 
      ? await getOrganizationBySlug(organization_slug)
      : await getDefaultOrganization()

    if (!organization) {
      console.error('[AssessmentSave] Organization not found for slug:', organization_slug || '(default)')
      return NextResponse.json(
        { error: `Organization not found for: ${organization_slug || 'default'}` },
        { status: 400 }
      )
    }
    console.log('[AssessmentSave] Resolved org:', { id: organization.id, slug: organization.slug })

    // Validate coupon if provided
    let validatedCoupon: {
      id: string
      discount_type: string
      max_uses: number | null
      current_uses: number
      valid_until: string | null
    } | null = null
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
        console.error('[AssessmentSave] Coupon usage increment failed:', incrementError)
        return NextResponse.json({ error: 'Coupon usage conflict. Please try again.' }, { status: 409 })
      }
      if (!data) {
        return NextResponse.json({ error: 'Coupon usage changed. Please try again.' }, { status: 409 })
      }

      validatedCoupon.current_uses = data.current_uses
      return null
    }

    const studentTypeFromForm = (formData?.basicInfo?.studentType as string) || undefined

    if (assessmentId) {
      const updateData: Record<string, unknown> = {
        responses: formData,
        updated_at: new Date().toISOString(),
        ...(currentSection !== null && { current_section: currentSection }),
        ...(studentTypeFromForm && { student_type: studentTypeFromForm }),
      }

      if (organization.free_assessments) {
        updateData.payment_status = 'free'
      } else if (validatedCoupon) {
        const { data: existingAssessment } = await supabase
          .from('assessments')
          .select('coupon_code, coupon_code_used, payment_status')
          .eq('id', assessmentId)
          .eq('organization_id', organization.id)
          .maybeSingle()
        const existingCouponCode = existingAssessment?.coupon_code || existingAssessment?.coupon_code_used || null
        if (validatedCoupon.discount_type !== 'free') {
          if (existingAssessment?.payment_status !== 'paid' || existingCouponCode !== normalizedCouponCode) {
            return NextResponse.json({ error: 'Payment is required for this discount coupon' }, { status: 402 })
          }
        } else if (existingCouponCode !== normalizedCouponCode) {
          const incrementResponse = await incrementCouponUsage()
          if (incrementResponse) return incrementResponse
        }

        updateData.coupon_code = normalizedCouponCode
        updateData.coupon_code_used = normalizedCouponCode
        updateData.payment_status = validatedCoupon.discount_type === 'free' ? 'free' : 'paid'
      }

      const { error } = await supabase
        .from('assessments')
        .update(updateData)
        .eq('id', assessmentId)
        .eq('organization_id', organization.id)

      if (error) {
        console.error('[AssessmentSave] Update failed:', { code: error.code, message: error.message, details: error.details, hint: error.hint, assessmentId, orgId: organization.id })
        throw error
      }

      const { data: assessment } = await supabase
        .from('assessments')
        .select('id, student_id')
        .eq('id', assessmentId)
        .eq('organization_id', organization.id)
        .single()

      // Fetch the student's unique_code for the response
      let uniqueCode: string | null = null
      if (assessment?.student_id) {
        const { data: student } = await supabase
          .from('students')
          .select('unique_code')
          .eq('id', assessment.student_id)
          .single()
        uniqueCode = student?.unique_code || null
      }

      if (assessment?.student_id && formData.basicInfo) {
        try {
          const fullName = String(formData.basicInfo.fullName || '')
          const nameParts = fullName.trim().split(/\s+/)
          const firstName = formData.basicInfo.firstName || nameParts[0] || null
          const lastName = formData.basicInfo.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null)

          const { error: studentError } = await supabase
            .from('students')
            .update({
              first_name: firstName,
              last_name: lastName,
              full_name: fullName || null,
              phone: formData.basicInfo.phone || null,
              grade_level: formData.basicInfo.currentGrade || formData.basicInfo.gradeLevel || null,
              current_grade: formData.basicInfo.currentGrade || null,
              school_name: formData.basicInfo.schoolName || null,
              parent_email: formData.basicInfo.parentEmail || null,
              parent_phone: formData.basicInfo.parentPhone || null,
              metadata: {
                parentName: formData.basicInfo.parentName,
                dateOfBirth: formData.basicInfo.dateOfBirth,
                address: formData.basicInfo.address,
                city: formData.basicInfo.city,
                state: formData.basicInfo.state,
                country: formData.basicInfo.country,
                gender: formData.basicInfo.gender,
                ethnicity: formData.basicInfo.ethnicity,
                targetCollegeYear: formData.basicInfo.targetCollegeYear,
                dreamSchools: formData.basicInfo.dreamSchools,
                curriculum: formData.basicInfo.curriculum,
                studyAbroad: formData.basicInfo.studyAbroad,
                targetCountries: formData.basicInfo.targetCountries
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', assessment.student_id)

          if (studentError) {
            console.error('[AssessmentSave] Student update failed (non-fatal):', studentError.message, studentError.code)
          }
        } catch (studentErr) {
          // Don't fail the whole save if student metadata update fails
          console.error('[AssessmentSave] Student update error (non-fatal):', studentErr)
        }
      }
  
      return NextResponse.json({
        success: true,
        assessmentId,
        uniqueCode
      })
    }

    // Check org limits before creating a new student — use actual DB count, not cached counter
    if (organization.max_students !== -1) {
      const { count: actualCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      if (actualCount !== null && actualCount >= organization.max_students) {
        console.error(`[AssessmentSave] License limit reached for org ${organization.slug}: ${actualCount}/${organization.max_students}`)
        return NextResponse.json(
          { error: `Student license limit reached (${organization.max_students} max). Please upgrade your plan.` },
          { status: 403 }
        )
      }
    }

    // Extract name parts from fullName if firstName/lastName not provided
    const fullName = String(formData.basicInfo?.fullName || '')
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = formData.basicInfo?.firstName || nameParts[0] || null
    const lastName = formData.basicInfo?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null)

    // Generate a unique 8-character resume code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
      return code
    }
    const newUniqueCode = generateCode()

    // Check if student already exists in this org (e.g., created via invite)
    const studentEmail = formData.basicInfo?.email || ''
    let student: { id: string; unique_code?: string } | null = null
    let isExistingStudent = false

    if (studentEmail) {
      const { data: existing } = await supabase
        .from('students')
        .select('id, unique_code')
        .eq('organization_id', organization.id)
        .eq('email', studentEmail)
        .maybeSingle()

      if (existing) {
        student = existing
        isExistingStudent = true
        // Update existing student with latest info
        await supabase
          .from('students')
          .update({
            first_name: firstName,
            last_name: lastName,
            full_name: fullName || null,
            unique_code: existing.unique_code || newUniqueCode,
            phone: formData.basicInfo?.phone || null,
            grade_level: formData.basicInfo?.currentGrade || formData.basicInfo?.gradeLevel || null,
            current_grade: formData.basicInfo?.currentGrade || null,
            school_name: formData.basicInfo?.schoolName || null,
            parent_email: formData.basicInfo?.parentEmail || null,
            parent_phone: formData.basicInfo?.parentPhone || null,
            metadata: {
              parentName: formData.basicInfo?.parentName,
              dateOfBirth: formData.basicInfo?.dateOfBirth,
              address: formData.basicInfo?.address,
              city: formData.basicInfo?.city,
              state: formData.basicInfo?.state,
              country: formData.basicInfo?.country,
              gender: formData.basicInfo?.gender,
              ethnicity: formData.basicInfo?.ethnicity,
              targetCollegeYear: formData.basicInfo?.targetCollegeYear,
              dreamSchools: formData.basicInfo?.dreamSchools,
              curriculum: formData.basicInfo?.curriculum,
              studyAbroad: formData.basicInfo?.studyAbroad,
              targetCountries: formData.basicInfo?.targetCountries
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      }
    }

    if (!student) {
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          organization_id: organization.id,
          email: studentEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName || null,
          unique_code: newUniqueCode,
          phone: formData.basicInfo?.phone || null,
          grade_level: formData.basicInfo?.currentGrade || formData.basicInfo?.gradeLevel || null,
          current_grade: formData.basicInfo?.currentGrade || null,
          school_name: formData.basicInfo?.schoolName || null,
          parent_email: formData.basicInfo?.parentEmail || null,
          parent_phone: formData.basicInfo?.parentPhone || null,
          metadata: {
            parentName: formData.basicInfo?.parentName,
            dateOfBirth: formData.basicInfo?.dateOfBirth,
            address: formData.basicInfo?.address,
            city: formData.basicInfo?.city,
            state: formData.basicInfo?.state,
            country: formData.basicInfo?.country,
            gender: formData.basicInfo?.gender,
            ethnicity: formData.basicInfo?.ethnicity,
            targetCollegeYear: formData.basicInfo?.targetCollegeYear,
            dreamSchools: formData.basicInfo?.dreamSchools,
            curriculum: formData.basicInfo?.curriculum,
            studyAbroad: formData.basicInfo?.studyAbroad,
            targetCountries: formData.basicInfo?.targetCountries
          }
        })
        .select()
        .single()

      if (studentError) throw studentError
      student = newStudent
    }

    // Only increment student count for genuinely new students
    if (!isExistingStudent) {
      await supabase.rpc('increment_students_count', { org_id: organization.id, amount: 1 })
        .then(({ error: rpcErr }) => { if (rpcErr) console.error('[AssessmentSave] increment_students_count failed (non-fatal):', rpcErr.message) })
    }

    // If existing student, check if they already have an in-progress assessment
    if (isExistingStudent && student) {
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('id, coupon_code, coupon_code_used, payment_status')
        .eq('student_id', student.id)
        .eq('organization_id', organization.id)
        .in('status', ['in_progress', 'partial'])
        .maybeSingle()

      if (existingAssessment) {
        // Update existing assessment instead of creating a new one
        const updateData: Record<string, unknown> = {
          responses: formData,
          current_section: currentSection || 1,
          updated_at: new Date().toISOString(),
          ...(studentTypeFromForm && { student_type: studentTypeFromForm }),
        }
        if (organization.free_assessments) updateData.payment_status = 'free'
        if (validatedCoupon) {
          const existingCouponCode = existingAssessment.coupon_code || existingAssessment.coupon_code_used || null
          if (validatedCoupon.discount_type !== 'free') {
            if (existingAssessment.payment_status !== 'paid' || existingCouponCode !== normalizedCouponCode) {
              return NextResponse.json({ error: 'Payment is required for this discount coupon' }, { status: 402 })
            }
          } else if (existingCouponCode !== normalizedCouponCode) {
            const incrementResponse = await incrementCouponUsage()
            if (incrementResponse) return incrementResponse
          }
          updateData.coupon_code = normalizedCouponCode
          updateData.coupon_code_used = normalizedCouponCode
          updateData.payment_status = validatedCoupon.discount_type === 'free' ? 'free' : 'paid'
        }

        await supabase
          .from('assessments')
          .update(updateData)
          .eq('id', existingAssessment.id)

        return NextResponse.json({
          success: true,
          assessmentId: existingAssessment.id,
          studentId: student.id,
          uniqueCode: student.unique_code || newUniqueCode
        })
      }
    }

    if (validatedCoupon) {
      if (validatedCoupon.discount_type !== 'free') {
        return NextResponse.json({ error: 'Payment is required for this discount coupon' }, { status: 402 })
      }
      const incrementResponse = await incrementCouponUsage()
      if (incrementResponse) return incrementResponse
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        organization_id: organization.id,
        student_id: student!.id,
        status: 'in_progress',
        responses: formData,
        current_section: currentSection || 1,
        student_type: studentTypeFromForm || 'high_school',
        coupon_code: validatedCoupon ? normalizedCouponCode : null,
        coupon_code_used: validatedCoupon ? normalizedCouponCode : null,
        payment_status: organization.free_assessments
          ? 'free'
          : (validatedCoupon ? (validatedCoupon.discount_type === 'free' ? 'free' : 'paid') : 'unpaid'),
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (assessmentError) throw assessmentError

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      studentId: student!.id,
      uniqueCode: (student as { unique_code?: string })?.unique_code || newUniqueCode
    })

  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string; hint?: string; stack?: string }
    const errorMessage = err.message || (error instanceof Error ? error.message : JSON.stringify(error))
    console.error('[AssessmentSave] Error:', {
      message: errorMessage,
      code: err.code,
      details: err.details,
      hint: err.hint,
      stack: err.stack || (error instanceof Error ? error.stack : undefined),
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: 'Failed to save assessment. Please try again.' },
      { status: 500 }
    )
  }
}
