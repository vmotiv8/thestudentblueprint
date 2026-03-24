import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { canAddStudent } from '@/lib/plan-enforcement'

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (e) {
      console.error('[AssessmentSave] Invalid JSON body:', e)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Extract fields manually to be more permissive than strict Zod validation
    const assessmentId = body.assessmentId as string | undefined
    const rawFormData = body.formData as Record<string, Record<string, unknown>> | undefined
    const couponCode = body.couponCode as string | undefined
    const organization_slug = body.organization_slug as string | undefined

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
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // Validate coupon if provided
    let validatedCoupon: { discount_type: string } | null = null
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
      validatedCoupon = coupon
    }

    if (assessmentId) {
      const updateData: Record<string, unknown> = {
        responses: formData,
        updated_at: new Date().toISOString()
      }

      if (organization.free_assessments) {
        updateData.payment_status = 'free'
      } else if (validatedCoupon) {
        updateData.coupon_code = couponCode!.toUpperCase()
        updateData.payment_status = validatedCoupon.discount_type === 'free' ? 'free' : 'paid'
      }

      const { error } = await supabase
        .from('assessments')
        .update(updateData)
        .eq('id', assessmentId)
        .eq('organization_id', organization.id)

      if (error) throw error

      const { data: assessment } = await supabase
        .from('assessments')
        .select('id, student_id')
        .eq('id', assessmentId)
        .eq('organization_id', organization.id)
        .single()

      if (assessment?.student_id && formData.basicInfo) {
        const fullName = String(formData.basicInfo.fullName || '')
        const nameParts = fullName.trim().split(/\s+/)
        const firstName = formData.basicInfo.firstName || nameParts[0] || null
        const lastName = formData.basicInfo.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null)

        await supabase
          .from('students')
          .update({
            first_name: firstName,
            last_name: lastName,
            full_name: fullName || null,
            email: formData.basicInfo.email,
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
      }
  
      return NextResponse.json({ 
        success: true, 
        assessmentId
      })
    }

    // Check org limits before creating a new student
    const studentLimitCheck = canAddStudent(organization)
    if (!studentLimitCheck.allowed) {
      return NextResponse.json(
        { error: studentLimitCheck.reason },
        { status: 403 }
      )
    }

    // Extract name parts from fullName if firstName/lastName not provided
    const fullName = String(formData.basicInfo?.fullName || '')
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = formData.basicInfo?.firstName || nameParts[0] || null
    const lastName = formData.basicInfo?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null)

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        organization_id: organization.id,
        email: formData.basicInfo?.email || '',
        first_name: firstName,
        last_name: lastName,
        full_name: fullName || null,
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

    // Increment student count so this self-serve student is tracked
    await supabase.rpc('increment_students_count', { org_id: organization.id, amount: 1 })

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        organization_id: organization.id,
        student_id: student.id,
        status: 'in_progress',
        responses: formData,
        coupon_code: validatedCoupon ? couponCode!.toUpperCase() : null,
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
      studentId: student.id
    })

  } catch (error) {
    console.error('[AssessmentSave] Error:', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    )
  }
}
