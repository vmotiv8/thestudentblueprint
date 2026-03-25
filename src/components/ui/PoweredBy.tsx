'use client'

import { useTenantOptional } from '@/contexts/TenantContext'

interface PoweredByProps {
  className?: string
  variant?: 'light' | 'dark'
}

/**
 * "Powered by The Student Blueprint" component that respects organization's
 * remove_branding setting for Enterprise plans.
 */
export function PoweredBy({ className = '', variant = 'dark' }: PoweredByProps) {
  const tenant = useTenantOptional()

  // If tenant context exists and branding should be removed, don't render
  if (tenant?.removeBranding) {
    return null
  }

  const textColor = variant === 'light' ? 'text-white/60' : 'text-slate-500'
  const linkColor = variant === 'light' ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-800'

  return (
    <div className={`text-center text-sm ${textColor} ${className}`}>
      Powered by{' '}
      <a
        href="https://thestudentblueprint.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium transition-colors ${linkColor}`}
      >
        The Student Blueprint
      </a>
    </div>
  )
}

/**
 * Footer component that includes PoweredBy and respects branding settings
 */
export function BrandedFooter({
  className = '',
  variant = 'dark',
}: {
  className?: string
  variant?: 'light' | 'dark'
}) {
  const tenant = useTenantOptional()

  const bgColor = variant === 'light' ? 'bg-white/5' : 'bg-slate-100'
  const borderColor = variant === 'light' ? 'border-white/10' : 'border-slate-200'
  const textColor = variant === 'light' ? 'text-white/60' : 'text-slate-500'

  return (
    <footer className={`border-t ${borderColor} ${bgColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Organization info */}
          {tenant?.organization && (
            <div className={`text-sm ${textColor}`}>
              &copy; {new Date().getFullYear()} {tenant.organization.name}. All rights reserved.
            </div>
          )}

          {/* Powered by - hidden if branding removed */}
          <PoweredBy variant={variant} />
        </div>
      </div>
    </footer>
  )
}
