import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'

export async function POST(request: Request) {
  try {
    const { code, email, organization_slug } = await request.json()
    const supabase = createServerSupabaseClient()

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const organization = organization_slug 
      ? await getOrganizationBySlug(organization_slug)
      : await getDefaultOrganization()

    if (!organization) {
      return NextResponse.json(
        { valid: false, error: 'Organization not found' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('organization_id', organization.id)
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', coupon.id)

      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 400 }
      )
    }

    if (email) {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('organization_id', organization.id)
        .single()
      
      if (student) {
        const { data: assessment } = await supabase
          .from('assessments')
          .select('id')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (assessment) {
          await supabase
            .from('assessments')
            .update({ 
              payment_status: coupon.discount_type === 'free' ? 'free' : 'paid',
              coupon_code: code.toUpperCase()
            })
            .eq('id', assessment.id)
        }
      }
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
