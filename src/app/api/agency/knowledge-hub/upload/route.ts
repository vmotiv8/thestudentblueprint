import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

// POST with file body — legacy full upload (fallback)
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

    const contentType = request.headers.get('content-type') || ''

    // --- Signed URL request (JSON body with fileName + fileType) ---
    if (contentType.includes('application/json')) {
      const { fileName, fileType } = await request.json()

      if (!fileName || !fileType) {
        return NextResponse.json({ error: 'fileName and fileType required' }, { status: 400 })
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
      if (!allowed.includes(fileType)) {
        return NextResponse.json({ error: 'Unsupported file type. Allowed: PDF, Word, Excel, CSV, PNG, JPEG.' }, { status: 400 })
      }

      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${admin.organization_id}/${Date.now()}-${safeName}`

      const { data: signedData, error: signError } = await supabase.storage
        .from('knowledge-hub')
        .createSignedUploadUrl(filePath)

      if (signError || !signedData) {
        console.error('Signed URL error:', signError)
        return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from('knowledge-hub')
        .getPublicUrl(filePath)

      return NextResponse.json({
        signedUrl: signedData.signedUrl,
        token: signedData.token,
        path: filePath,
        publicUrl: urlData.publicUrl,
        fileName,
      })
    }

    // --- Direct file upload (FormData — original flow as fallback) ---
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
