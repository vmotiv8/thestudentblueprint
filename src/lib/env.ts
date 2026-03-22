/**
 * Environment variable validation
 * Validates required environment variables on startup and provides typed access
 */

type EnvConfig = {
  // Required - Application will fail to start without these
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  STRIPE_SECRET_KEY: string

  // Optional but recommended
  STRIPE_WEBHOOK_SECRET?: string
  RESEND_API_KEY?: string
  ANTHROPIC_API_KEY?: string

  // Runtime
  NODE_ENV: 'development' | 'production' | 'test'
}

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
] as const

const optionalVars = [
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'ANTHROPIC_API_KEY',
  'VERCEL_API_TOKEN',
  'VERCEL_PROJECT_ID',
  'VERCEL_TEAM_ID',
] as const

let validated = false
let cachedEnv: EnvConfig | null = null

export function validateEnv(): EnvConfig {
  if (validated && cachedEnv) {
    return cachedEnv
  }

  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  }

  // Fail fast if required vars are missing
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n  - ${missing.join('\n  - ')}`
    console.error(`\n❌ ${errorMessage}\n`)
    throw new Error(errorMessage)
  }

  // Warn about optional vars
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `\n⚠️  Missing optional environment variables (some features may be disabled):\n  - ${warnings.join('\n  - ')}\n`
    )
  }

  cachedEnv = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  }

  validated = true
  return cachedEnv
}

// Export individual getters for type-safe access
export function getSupabaseUrl(): string {
  return validateEnv().SUPABASE_URL
}

export function getSupabaseServiceKey(): string {
  return validateEnv().SUPABASE_SERVICE_ROLE_KEY
}

export function getStripeSecretKey(): string {
  return validateEnv().STRIPE_SECRET_KEY
}

export function getStripeWebhookSecret(): string | undefined {
  return validateEnv().STRIPE_WEBHOOK_SECRET
}

export function getResendApiKey(): string | undefined {
  return validateEnv().RESEND_API_KEY
}

export function getAnthropicApiKey(): string | undefined {
  return validateEnv().ANTHROPIC_API_KEY
}

export function isProduction(): boolean {
  return validateEnv().NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return validateEnv().NODE_ENV === 'development'
}
