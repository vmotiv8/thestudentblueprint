'use client'

import { useState } from 'react'
import { Globe, Check, AlertCircle, Copy, Loader2 } from 'lucide-react'

interface CustomDomainSettingsProps {
  organizationId: string
  currentDomain?: string | null
  slug: string
  planType?: string
  onDomainUpdate?: (domain: string | null) => void
}

export function CustomDomainSettings({
  currentDomain,
  slug,
  onDomainUpdate,
}: CustomDomainSettingsProps) {
  const [domain, setDomain] = useState(currentDomain || '')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(!!currentDomain)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const defaultUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`

  const handleSaveDomain = async () => {
    if (!domain.trim()) {
      // Remove domain via DELETE endpoint (also removes from Vercel)
      setSaving(true)
      try {
        const res = await fetch('/api/agency/verify-domain', {
          method: 'DELETE',
        })
        if (res.ok) {
          setVerified(false)
          onDomainUpdate?.(null)
        }
      } finally {
        setSaving(false)
      }
      return
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i
    if (!domainRegex.test(domain)) {
      setError('Please enter a valid domain (e.g., assessments.youragency.com)')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.toLowerCase() }),
      })

      if (res.ok) {
        setVerified(false) // Need to verify after saving
        onDomainUpdate?.(domain.toLowerCase())
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save domain')
      }
    } catch {
      setError('Failed to save domain')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!domain) return

    setVerifying(true)
    setError(null)

    try {
      const res = await fetch('/api/agency/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      const data = await res.json()

      if (res.ok && data.verified) {
        setVerified(true)
      } else {
        setError(data.error || 'Domain verification failed. Please check your DNS settings.')
      }
    } catch {
      setError('Failed to verify domain')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Custom Domain</h3>
          <p className="text-slate-400 text-sm mb-6">
            Use your own domain for a fully branded experience. Students will access your portal at
            your custom domain.
          </p>

          {/* Domain Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Custom Domain
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value)
                      setVerified(false)
                      setError(null)
                    }}
                    placeholder="assessments.youragency.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  {verified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSaveDomain}
                  disabled={saving}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-900 rounded-lg font-medium transition-colors"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* DNS Instructions */}
            {domain && !verified && (
              <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                <h4 className="text-white font-medium mb-3">DNS Configuration Required</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Add the following CNAME record to your domain&apos;s DNS settings:
                </p>

                <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4 text-slate-400 mb-2">
                    <span>Type</span>
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-white">
                    <span>CNAME</span>
                    <span>{domain.split('.')[0]}</span>
                    <div className="flex items-center gap-2">
                      <span className="truncate">cname.vercel-dns.com</span>
                      <button
                        onClick={() => copyToClipboard('cname.vercel-dns.com')}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-slate-500 text-sm">
                    DNS changes can take up to 48 hours to propagate.
                  </p>
                  <button
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Verify Domain
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {verified && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-green-400 font-medium">Domain Verified</div>
                  <div className="text-slate-400 text-sm">
                    Your portal is now accessible at{' '}
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      https://{domain}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
