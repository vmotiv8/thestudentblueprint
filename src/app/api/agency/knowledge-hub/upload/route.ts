import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: admin } = await supabase
      .from('admins')
      .select('organization_id')
      .eq('id', adminId)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/csv',
    ]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Allowed: PDF, Word, Excel, CSV, PNG, JPEG.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'pdf'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${admin.organization_id}/${Date.now()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('knowledge-hub')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('knowledge-hub')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: urlData.publicUrl, fileName: file.name })
  } catch (error) {
    console.error('Knowledge hub upload error:', error)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}
