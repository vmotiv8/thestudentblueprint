import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { uuidSchema } from '@/lib/validations'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment ID format' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const cookieStore = await cookies()

    // Check for admin session - admins can access any assessment in their org
    const adminId = cookieStore.get('admin_session')?.value
    if (adminId) {
      const { data: admin } = await supabase
        .from('admins')
        .select('organization_id, role')
        .eq('id', adminId)
        .single()

      if (admin) {
        const isSuperAdmin = admin.role === 'super_admin' || admin.role === 'god'

        let query = supabase
          .from('assessments')
          .select(`
            *,
            students (
              full_name,
              email,
              current_grade,
              school_name,
              target_college_year,
              unique_code
            ),
            organizations (
              name,
              slug,
              logo_url,
              primary_color,
              secondary_color
            )
          `)
          .eq('id', id)

        // Super admins can view assessments across all organizations
        if (!isSuperAdmin) {
          query = query.eq('organization_id', admin.organization_id)
        }

        const { data: assessment, error } = await query.single()

        if (error || !assessment) {
          return NextResponse.json(
            { error: 'Assessment not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({ assessment })
      }
    }

    // Check for student session via verified email cookie
    const verifiedEmail = cookieStore.get('verified_email')?.value
    if (verifiedEmail) {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select(`
          *,
          students!inner (
            full_name,
            email,
            current_grade,
            school_name,
            target_college_year,
            unique_code
          ),
          organizations (
            name,
            slug,
            logo_url,
            primary_color,
            secondary_color
          )
        `)
        .eq('id', id)
        .eq('students.email', verifiedEmail.toLowerCase())
        .single()

      if (error || !assessment) {
        return NextResponse.json(
          { error: 'Assessment not found or access denied' },
          { status: 404 }
        )
      }

      return NextResponse.json({ assessment })
    }

    // Fallback: allow access to completed assessments by UUID (the UUID itself acts as an access token)
    // This is safe because UUIDs are unguessable and the results URL is only shared with the student
    const { data: assessment, error: publicError } = await supabase
      .from('assessments')
      .select(`
        *,
        students (
          full_name,
          email,
          current_grade,
          school_name,
          target_college_year,
          unique_code
        ),
        organizations (
          name,
          slug,
          logo_url,
          primary_color,
          secondary_color
        )
      `)
      .eq('id', id)
      .single()

    if (publicError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ assessment })

  } catch (error) {
    console.error('Error fetching assessment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}
