import { createServerSupabaseClient } from '@/lib/supabase'
import type { KnowledgeHubResource } from '@/lib/assessment-prompts'

const MAX_CONTENT_LENGTH = 4000 // per file, to avoid prompt bloat

/**
 * Fetch knowledge hub resources for an organization, including extracted file content.
 * Caches extracted content in the metadata JSONB field to avoid re-extracting.
 */
export async function fetchKnowledgeHubWithContent(
  organizationId: string
): Promise<KnowledgeHubResource[]> {
  const supabase = createServerSupabaseClient()

  const { data: resources } = await supabase
    .from('knowledge_hub_resources')
    .select('id, type, title, description, file_url, metadata')
    .eq('organization_id', organizationId)

  if (!resources || resources.length === 0) return []

  const results: KnowledgeHubResource[] = []

  for (const r of resources) {
    let fileContent: string | null = null

    // Check if content was already extracted and cached
    const metadata = (r.metadata || {}) as Record<string, unknown>
    if (metadata.extractedContent && typeof metadata.extractedContent === 'string') {
      fileContent = metadata.extractedContent
    } else if (r.file_url) {
      // Extract content from the file
      try {
        fileContent = await extractFileContent(r.file_url)

        // Cache it in metadata for future use
        if (fileContent) {
          const truncated = fileContent.length > MAX_CONTENT_LENGTH
            ? fileContent.slice(0, MAX_CONTENT_LENGTH) + '\n...[truncated]'
            : fileContent
          fileContent = truncated

          await supabase
            .from('knowledge_hub_resources')
            .update({
              metadata: { ...metadata, extractedContent: truncated, extractedAt: new Date().toISOString() },
            })
            .eq('id', r.id)
        }
      } catch (err) {
        console.error(`[KH] Failed to extract content from ${r.title}:`, err)
      }
    }

    results.push({
      type: r.type,
      title: r.title,
      description: r.description,
      fileContent,
    })
  }

  return results
}

/**
 * Extract text content from a file URL based on its type.
 */
async function extractFileContent(fileUrl: string): Promise<string | null> {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || ''
    const url = fileUrl.toLowerCase()

    // CSV files
    if (contentType.includes('text/csv') || url.endsWith('.csv')) {
      const text = await response.text()
      return text.slice(0, MAX_CONTENT_LENGTH)
    }

    // Plain text files
    if (contentType.includes('text/plain') || url.endsWith('.txt')) {
      const text = await response.text()
      return text.slice(0, MAX_CONTENT_LENGTH)
    }

    // PDF files — skip extraction in this environment (pdf-parse has webpack compatibility issues)
    // Content will be available via the title and description fields instead
    if (contentType.includes('application/pdf') || url.endsWith('.pdf')) {
      return null
    }

    // For Word/Excel — just note we can't extract (would need mammoth/xlsx libs)
    return null
  } catch (err) {
    console.error('[KH] File fetch error:', err)
    return null
  }
}
