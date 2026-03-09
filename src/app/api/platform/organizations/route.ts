import { NextResponse } from 'next/server'
import { requireSuperAdminContext } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    await requireSuperAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(`
        *,
        admins:admins(count),
        students:students(count),
        assessments:assessments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { name, slug, billing_email, plan_type, max_students, max_admins, assessment_price, primary_color, secondary_color } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'An organization with this slug already exists' },
        { status: 400 }
      )
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert({
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        billing_email,
        plan_type: plan_type || 'starter',
        max_students: max_students || 50,
        max_admins: max_admins || 3,
        assessment_price: assessment_price || 47.00,
        primary_color: primary_color || '#1e3a5f',
        secondary_color: secondary_color || '#c9a227',
        subscription_status: 'trial'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, organization })
  } catch (error) {
    console.error('Error creating organization:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSuperAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { id, ...raw } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const allowedFields = [
      "name", "slug", "billing_email", "plan_type", "max_students", "max_admins",
      "assessment_price", "subscription_status", "primary_color", "secondary_color",
      "logo_url", "trial_ends_at", "is_active", "domain", "settings"
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in raw) updates[key] = raw[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    if (updates.slug) {
      const normalizedSlug = (updates.slug as string).toLowerCase().replace(/[^a-z0-9-]/g, '-')
      updates.slug = normalizedSlug

      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', normalizedSlug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'An organization with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, organization })
  } catch (error) {
    console.error('Error updating organization:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSuperAdminContext(request)
    const supabase = createServerSupabaseClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', id)
      .single()

    if (org?.settings?.platformOwner) {
      return NextResponse.json(
        { error: 'Cannot delete platform owner organization' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
