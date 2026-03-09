import { NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'

export * from './schemas'

/**
 * Validates request body against a Zod schema
 * Returns parsed data on success, or a NextResponse error on failure
 */
export async function validateRequest<T extends ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: errors,
          },
          { status: 400 }
        ),
      }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: NextResponse } {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  const result = schema.safeParse(params)

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: errors,
        },
        { status: 400 }
      ),
    }
  }

  return { success: true, data: result.data }
}

/**
 * Validates a single value against a schema
 */
export function validateValue<T extends ZodSchema>(
  value: unknown,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; message: string } {
  const result = schema.safeParse(value)

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message || 'Validation failed',
    }
  }

  return { success: true, data: result.data }
}
