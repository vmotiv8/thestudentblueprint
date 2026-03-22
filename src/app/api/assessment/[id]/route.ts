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

    console.log("[FETCH_ASSESSMENT] Fetching assessment:", id)

    // Check for admin session - admins can access any assessment in their org
    const adminId = cookieStore.get('admin_session')?.value
    console.log("[FETCH_ASSESSMENT] Admin session:", adminId ? "found" : "none")
    if (adminId) {
      const { data: admin } = await supabase
        .from('admins')
        .select('organization_id, role')
        .eq('id', adminId)
        .single()

      console.log("[FETCH_ASSESSMENT] Admin lookup:", admin ? { role: admin.role, org_id: admin.organization_id } : "not found")

      if (admin) {
        const isSuperAdmin = admin.role === 'super_admin' || admin.role === 'god'
        console.log("[FETCH_ASSESSMENT] isSuperAdmin:", isSuperAdmin)

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
            )
          `)
          .eq('id', id)

        // Super admins can view assessments across all organizations
        if (!isSuperAdmin) {
          console.log("[FETCH_ASSESSMENT] Filtering by org_id:", admin.organization_id)
          query = query.eq('organization_id', admin.organization_id)
        }

        const { data: assessment, error } = await query.single()

        console.log("[FETCH_ASSESSMENT] Query result:", {
          found: !!assessment,
          error: error?.message || null,
          assessment_org_id: assessment?.organization_id || null,
        })

        if (error || !assessment) {
          console.log("[FETCH_ASSESSMENT] Assessment NOT FOUND. Error:", error)
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
    console.log("[FETCH_ASSESSMENT] Verified email:", verifiedEmail || "none")
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

    // No valid session - deny access
    return NextResponse.json(
      { error: 'Authentication required to access assessment' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Error fetching assessment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}
