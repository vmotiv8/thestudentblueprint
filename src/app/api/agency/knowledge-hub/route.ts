import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { resolveOrganization } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const organization = await resolveOrganization(request)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('knowledge_hub_resources')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching knowledge hub resources:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const organization = await resolveOrganization(request)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, title, description, file_url, metadata } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('knowledge_hub_resources')
      .insert({
        organization_id: organization.id,
        type,
        title,
        description,
        file_url,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating knowledge hub resource:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const organization = await resolveOrganization(request)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('knowledge_hub_resources')
      .delete()
      .eq('id', id)
      .eq('organization_id', organization.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting knowledge hub resource:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
