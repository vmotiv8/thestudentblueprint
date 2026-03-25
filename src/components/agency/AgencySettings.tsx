"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Settings,
  Palette,
  Users,
  CreditCard,
  Shield,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  UserPlus,
  RefreshCw,
  Copy,
  Zap,
  Crown,
  Star,
  Infinity,
  Webhook,
  Globe,
  AlertCircle,
  ExternalLink,
  ClipboardList,
  Eye,
  EyeOff
} from "lucide-react"
import {
  SECTION_TITLES
} from "@/lib/assessment-types"
import {
  SECTION_DESCRIPTIONS,
  REQUIRED_SECTIONS,
  SECTION_PRESETS,
  SectionPresetKey,
  validateSectionConfig
} from "@/lib/organization/assessment-config"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Suspense } from "react"

interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  billing_email: string | null
  subscription_status: string
  plan_type: string
  max_students: number
  max_admins: number
  assessment_price: number
  free_assessments: boolean
  stripe_connect_account_id: string | null
  api_key: string | null
  custom_email_from: string | null
  custom_email_reply_to: string | null
  webhook_url: string | null
  remove_branding: boolean
  domain: string | null
  domain_verified: boolean
  current_students_count: number
  current_admins_count: number
  enabled_sections: number[]
  billing_type: 'subscription' | 'one_time'
}

interface Admin {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
}

interface Plan {
  id: string
  name: string
  price: number
  priceDisplay: string
  students: number
  admins: number
  features: string[]
  popular?: boolean
}

// Custom Domain Settings Card Component (light theme)
function CustomDomainSettingsCard({
  org,
  onDomainUpdate,
}: {
  org: Organization
  onDomainUpdate: (domain: string | null) => void
}) {
  const [domain, setDomain] = useState(org.domain || '')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(!!org.domain_verified)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const slugUrl = typeof window !== 'undefined' ? `${window.location.origin}/org/${org.slug}` : `/org/${org.slug}`
  const portalUrl = verified && domain ? `https://${domain}` : slugUrl

  const handleSaveDomain = async () => {
    if (!domain.trim()) {
      setSaving(true)
      try {
        const res = await fetch('/api/agency/verify-domain', {
          method: 'DELETE',
        })
        if (res.ok) {
          setVerified(false)
          onDomainUpdate(null)
          toast.success('Domain removed')
        }
      } finally {
        setSaving(false)
      }
      return
    }

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
        setVerified(false)
        onDomainUpdate(domain.toLowerCase())
        toast.success('Domain saved. Please verify DNS settings.')
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
        toast.success('Domain verified successfully!')
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
    toast.success('Copied to clipboard!')
  }

  return (
    <Card className="border-[#e5e0d5]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0a192f]/5 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#0a192f]" />
          </div>
          <div>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>
              Use your own domain for your assessment portal
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current URL */}
        <div className="p-4 bg-[#faf8f3] rounded-xl border border-[#e5e0d5]">
          <p className="text-sm text-[#5a7a9a] mb-2">Your current portal URL:</p>
          <div className="flex items-center gap-2">
            <code className="text-[#0a192f] font-mono text-sm flex-1 truncate">{portalUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(portalUrl)}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(portalUrl, '_blank')}
              className="shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Domain Input */}
            <div className="space-y-3">
              <Label>Your Custom Domain</Label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value)
                      setVerified(false)
                      setError(null)
                    }}
                    placeholder="assessments.youragency.com"
                  />
                  {verified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSaveDomain}
                  disabled={saving}
                  className="bg-[#0a192f] hover:bg-[#152a45]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* DNS Instructions */}
            {domain && !verified && (
              <div className="p-5 bg-[#faf8f3] rounded-xl border border-[#e5e0d5]">
                <h4 className="font-bold text-[#0a192f] mb-3">DNS Configuration Required</h4>
                <p className="text-sm text-[#5a7a9a] mb-4">
                  Add the following CNAME record to your domain&apos;s DNS settings:
                </p>

                <div className="bg-white rounded-lg p-4 border border-[#e5e0d5] font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4 text-[#5a7a9a] mb-2 text-xs font-sans uppercase tracking-wide">
                    <span>Type</span>
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-[#0a192f]">
                    <span>CNAME</span>
                    <span>{domain.split('.')[0]}</span>
                    <div className="flex items-center gap-2">
                      <span className="truncate">cname.vercel-dns.com</span>
                      <button
                        onClick={() => copyToClipboard('cname.vercel-dns.com')}
                        className="p-1 hover:bg-[#faf8f3] rounded"
                      >
                        <Copy className="w-3 h-3 text-[#5a7a9a]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-[#5a7a9a]">
                    DNS changes can take up to 48 hours to propagate.
                  </p>
                  <Button
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                    variant="outline"
                    className="border-[#0a192f] text-[#0a192f]"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verify Domain
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {verified && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Domain Verified</p>
                  <p className="text-sm text-green-700">
                    Your portal is now accessible at{' '}
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      https://{domain}
                    </a>
                  </p>
                </div>
              </div>
            )}
      </CardContent>
    </Card>
  )
}

// Assessment Customization Card Component
function AssessmentCustomizationCard({
  org,
  onSectionsUpdate,
}: {
  org: Organization
  onSectionsUpdate: (sections: number[]) => void
}) {
  const [localSections, setLocalSections] = useState<number[]>(
    org.enabled_sections || Array.from({ length: 15 }, (_, i) => i + 1)
  )
  const [saving, setSaving] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<SectionPresetKey | null>(null)

  const isPro = org.plan_type === 'pro' || org.plan_type === 'enterprise'

  const toggleSection = (sectionId: number) => {
    if (REQUIRED_SECTIONS.includes(sectionId)) return // Cannot toggle required sections

    setLocalSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId)
      }
      return [...prev, sectionId].sort((a, b) => a - b)
    })
    setSelectedPreset(null)
  }

  const applyPreset = (presetKey: SectionPresetKey) => {
    const preset = SECTION_PRESETS[presetKey]
    setLocalSections(preset.sections)
    setSelectedPreset(presetKey)
  }

  const handleSave = async () => {
    const validation = validateSectionConfig(localSections)
    if (!validation.valid) {
      validation.errors.forEach((err) => toast.error(err))
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled_sections: localSections }),
      })

      if (res.ok) {
        onSectionsUpdate(localSections)
        toast.success('Assessment configuration saved')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save configuration')
      }
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#e5e0d5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a192f]/5 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#0a192f]" />
              </div>
              <div>
                <CardTitle>Assessment Sections</CardTitle>
                <CardDescription>
                  Choose which sections students see in the assessment
                </CardDescription>
              </div>
            </div>
            {isPro && (
              <Button onClick={handleSave} disabled={saving} className="bg-[#0a192f] hover:bg-[#152a45]">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPro ? (
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                <Crown className="w-5 h-5" />
                Pro Feature
              </div>
              <p className="text-sm text-amber-800 mb-4">
                Upgrade to Pro or Enterprise to customize which assessment sections are shown to students.
              </p>
              <Link href="/agency/settings?tab=billing">
                <Button
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  <Star className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Presets */}
              <div>
                <Label className="mb-3 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SECTION_PRESETS) as SectionPresetKey[]).map((presetKey) => {
                    const preset = SECTION_PRESETS[presetKey]
                    return (
                      <Button
                        key={presetKey}
                        variant={selectedPreset === presetKey ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyPreset(presetKey)}
                        className={selectedPreset === presetKey ? 'bg-[#0a192f]' : ''}
                      >
                        {preset.name}
                      </Button>
                    )
                  })}
                </div>
                {selectedPreset && (
                  <p className="text-xs text-[#5a7a9a] mt-2">
                    {SECTION_PRESETS[selectedPreset].description}
                  </p>
                )}
              </div>

              {/* Section List */}
              <div className="border border-[#e5e0d5] rounded-xl overflow-hidden">
                <div className="bg-[#faf8f3] px-4 py-3 border-b border-[#e5e0d5]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#0a192f] text-sm">
                      {localSections.length} of 15 sections enabled
                    </span>
                    <span className="text-xs text-[#5a7a9a]">
                      Est. completion time: ~{Math.round(localSections.length * 1.3)} minutes
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#e5e0d5]">
                  {SECTION_TITLES.map((title, index) => {
                    const sectionId = index + 1
                    const isEnabled = localSections.includes(sectionId)
                    const isRequired = REQUIRED_SECTIONS.includes(sectionId)

                    return (
                      <div
                        key={sectionId}
                        className={`flex items-center justify-between px-4 py-3 transition-colors ${
                          isEnabled ? 'bg-white' : 'bg-[#faf8f3]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isEnabled
                                ? 'bg-[#0a192f] text-white'
                                : 'bg-[#e5e0d5] text-[#5a7a9a]'
                            }`}
                          >
                            {sectionId}
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${isEnabled ? 'text-[#0a192f]' : 'text-[#5a7a9a]'}`}>
                              {title}
                            </p>
                            <p className="text-xs text-[#5a7a9a]">
                              {SECTION_DESCRIPTIONS[sectionId]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isRequired && (
                            <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 bg-blue-50">
                              Required
                            </Badge>
                          )}
                          <button
                            onClick={() => toggleSection(sectionId)}
                            disabled={isRequired}
                            className={`p-2 rounded-lg transition-colors ${
                              isRequired
                                ? 'opacity-50 cursor-not-allowed'
                                : isEnabled
                                ? 'hover:bg-red-50 text-green-600'
                                : 'hover:bg-green-50 text-[#5a7a9a]'
                            }`}
                          >
                            {isEnabled ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Reducing sections can improve completion rates. The Full Assessment
                  provides the most comprehensive analysis, but shorter assessments work well for initial
                  screening.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AgencySettingsContent({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [org, setOrg] = useState<Organization | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [billingLoading, setBillingLoading] = useState<string | null>(null)
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; charges_enabled?: boolean; details_submitted?: boolean } | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "branding")
  const [showAdminInviteDialog, setShowAdminInviteDialog] = useState(false)
  const [adminInvite, setAdminInvite] = useState({ email: "", fullName: "", role: "admin" as string })
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false)

  useEffect(() => {
    fetchData()
    if (searchParams.get("status") === "success") {
      toast.success("Subscription updated successfully!")
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [settingsRes, adminsRes, plansRes] = await Promise.all([
        fetch("/api/agency/settings"),
        fetch("/api/admin/manage-admins"),
        fetch("/api/agency/billing/plans")
      ])

      const settingsData = await settingsRes.json()
      const adminsData = await adminsRes.json()
      const plansData = await plansRes.json()

      if (settingsData.organization) setOrg(settingsData.organization)
      if (adminsData.admins) setAdmins(adminsData.admins)
      if (plansData.plans) setPlans(plansData.plans)

      // Fetch Stripe Connect status
      fetchConnectStatus()
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const fetchConnectStatus = async () => {
    try {
      const res = await fetch("/api/agency/stripe-connect")
      const data = await res.json()
      setConnectStatus(data)
    } catch {
      console.error("Failed to fetch Stripe Connect status")
    }
  }

  const handleConnectStripe = async () => {
    setConnectLoading(true)
    try {
      const res = await fetch("/api/agency/stripe-connect", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to start Stripe Connect setup")
      }
    } catch {
      toast.error("Failed to start Stripe Connect setup")
    } finally {
      setConnectLoading(false)
    }
  }

  const handleDisconnectStripe = async () => {
    if (!confirm("Are you sure you want to disconnect your Stripe account? Students will not be able to pay until you reconnect.")) return
    try {
      await fetch("/api/agency/stripe-connect", { method: "DELETE" })
      setConnectStatus({ connected: false })
      toast.success("Stripe account disconnected")
    } catch {
      toast.error("Failed to disconnect Stripe account")
    }
  }

  const handleUpdateOrg = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!org) return

    setSaving(true)
    try {
      const response = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(org)
      })

      if (response.ok) {
        toast.success("Settings updated successfully")
      } else {
        toast.error("Failed to update settings")
      }
    } catch {
      toast.error("Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    if (!org) return
    setBillingLoading(planId)
    try {
      const response = await fetch("/api/agency/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: org.id,
          plan_type: planId,
          billing_email: org.billing_email
        })
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to start checkout")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setBillingLoading(null)
    }
  }

  const handleManageBilling = async () => {
    if (!org) return
    setBillingLoading("portal")
    try {
      const response = await fetch("/api/agency/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: org.id })
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to open billing portal")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setBillingLoading(null)
    }
  }

  const generateApiKey = async () => {
    if (!org) return
    setSaving(true)
    try {
      const response = await fetch("/api/agency/api-key", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        setOrg({ ...org, api_key: data.api_key })
        toast.success("New API key generated")
      } else {
        toast.error(data.error || "Failed to generate API key")
      }
    } catch {
      toast.error("Failed to generate API key")
    } finally {
      setSaving(false)
    }
  }

  const handleInviteAdmin = async () => {
    if (!adminInvite.email.trim()) {
      toast.error("Please enter an email address")
      return
    }
    setIsInvitingAdmin(true)
    try {
      const response = await fetch("/api/admin/invite-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminInvite.email,
          fullName: adminInvite.fullName || undefined,
          role: adminInvite.role,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Admin invitation sent successfully!")
        setShowAdminInviteDialog(false)
        setAdminInvite({ email: "", fullName: "", role: "admin" })
        fetchData()
      } else {
        toast.error(data.error || "Failed to invite admin")
      }
    } catch {
      toast.error("Failed to invite admin")
    } finally {
      setIsInvitingAdmin(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${adminEmail} from the team?`)) return
    try {
      const res = await fetch(`/api/admin/manage-admins?id=${adminId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== adminId))
        toast.success(`${adminEmail} has been removed`)
      } else {
        toast.error(data.error || 'Failed to remove admin')
      }
    } catch {
      toast.error('Failed to remove admin')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  if (loading) {
    if (embedded) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  if (!org) return null

  const settingsContent = (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border border-[#e5e0d5] p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="branding" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing & Plans
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <KeyRound className="w-4 h-4 mr-2" />
              API Access
            </TabsTrigger>
            <TabsTrigger value="domains" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="assessment" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
              <ClipboardList className="w-4 h-4 mr-2" />
              Assessment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <CardTitle>Visual Identity</CardTitle>
                  <CardDescription>Customize how your agency appears to students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Agency Name</Label>
                    <Input 
                      value={org.name} 
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <div className="flex gap-4">
                      <Input 
                        value={org.logo_url || ""} 
                        onChange={(e) => setOrg({ ...org, logo_url: e.target.value })}
                        placeholder="https://..."
                      />
                      {org.logo_url && (
                        <div className="w-10 h-10 rounded border p-1 bg-white">
                          <img src={org.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={org.primary_color} 
                          onChange={(e) => setOrg({ ...org, primary_color: e.target.value })}
                          className="w-12 p-1 h-10 cursor-pointer"
                        />
                        <Input 
                          value={org.primary_color} 
                          onChange={(e) => setOrg({ ...org, primary_color: e.target.value })}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={org.secondary_color} 
                          onChange={(e) => setOrg({ ...org, secondary_color: e.target.value })}
                          className="w-12 p-1 h-10 cursor-pointer"
                        />
                        <Input 
                          value={org.secondary_color} 
                          onChange={(e) => setOrg({ ...org, secondary_color: e.target.value })}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <CardTitle>White-label Settings</CardTitle>
                  <CardDescription>Control The Student Blueprint branding visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#faf8f3] rounded-xl border border-[#e5e0d5]">
                    <div className="space-y-1">
                      <p className="font-bold text-[#0a192f]">Remove The Student Blueprint Branding</p>
                      <p className="text-sm text-[#5a7a9a]">Hide &quot;Powered by The Student Blueprint&quot; from the platform</p>
                    </div>
                    {org.plan_type === 'enterprise' ? (
                      <Switch 
                        checked={org.remove_branding} 
                        onCheckedChange={(checked) => setOrg({ ...org, remove_branding: checked })}
                      />
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        <Crown className="w-3 h-3 mr-1" />
                        Enterprise Only
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border-2 border-dashed border-[#e5e0d5]">
                    <p className="text-sm font-bold text-[#0a192f] mb-4">Preview</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#faf8f3] flex items-center justify-center border border-[#e5e0d5]">
                          {org.logo_url ? <img src={org.logo_url} className="w-5 h-5 object-contain" /> : <Settings className="w-4 h-4 text-[#5a7a9a]" />}
                        </div>
                        <span className="font-bold text-sm" style={{ color: org.primary_color }}>{org.name}</span>
                      </div>
                      <Button className="w-full font-bold" style={{ backgroundColor: org.primary_color }}>
                        Sample Button
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="border-[#e5e0d5]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage administrators who can access this dashboard</CardDescription>
                </div>
                <Button className="bg-[#0a192f]" onClick={() => setShowAdminInviteDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-[#faf8f3] rounded-xl border border-[#e5e0d5]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#0a192f] flex items-center justify-center text-white font-bold">
                          {admin.first_name?.[0] || admin.email[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#0a192f]">{[admin.first_name, admin.last_name].filter(Boolean).join(' ') || admin.email}</p>
                          <p className="text-sm text-[#5a7a9a]">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">{admin.role.replace('_', ' ')}</Badge>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteAdmin(admin.id, admin.email)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-[#e5e0d5] bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Current Plan</p>
                  <CardTitle className="text-2xl capitalize">{org.plan_type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#5a7a9a] mb-6">Your agency is currently on the {org.plan_type} tier{org.billing_type === 'one_time' ? ' (one-time license)' : ''}.</p>
                  {org.billing_type === 'one_time' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">One-Time License Active</span>
                      </div>
                      <p className="text-xs text-[#5a7a9a]">Your license is managed manually. Contact support to upgrade.</p>
                    </div>
                  ) : org.subscription_status === 'active' || org.subscription_status === 'trialing' ? (
                    <Button
                      variant="outline"
                      onClick={handleManageBilling}
                      disabled={!!billingLoading}
                      className="w-full border-[#0a192f] text-[#0a192f]"
                    >
                      {billingLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage Subscription"}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" disabled className="w-full border-[#e5e0d5] text-[#5a7a9a]">
                        No Active Subscription
                      </Button>
                      <p className="text-xs text-[#5a7a9a] text-center">Choose a plan below to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <p className="text-sm font-bold text-[#5a7a9a] uppercase tracking-widest">License Usage</p>
                  <CardTitle className="text-2xl">
                    {org.current_students_count} / {org.max_students === -1 ? <Infinity className="inline w-5 h-5" /> : org.max_students}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-[#faf8f3] rounded-full h-2 mb-2">
                    <div 
                      className="bg-[#c9a227] h-2 rounded-full transition-all" 
                      style={{ width: org.max_students === -1 ? '100%' : `${Math.min((org.current_students_count / org.max_students) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#5a7a9a]">Student licenses used</p>
                </CardContent>
              </Card>

              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <p className="text-sm font-bold text-[#5a7a9a] uppercase tracking-widest">Student Pricing</p>
                  <CardTitle className="text-2xl">Assessment Price</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0a192f]">Charge students for assessments</p>
                      <p className="text-xs text-[#5a7a9a]">When off, students access assessments for free</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!org.free_assessments}
                      onClick={async () => {
                        const updated = { ...org, free_assessments: !org.free_assessments }
                        setOrg(updated)
                        try {
                          const res = await fetch('/api/agency/settings', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ free_assessments: updated.free_assessments }),
                          })
                          if (res.ok) {
                            toast.success(updated.free_assessments ? 'Assessments set to free' : 'Student charging enabled')
                          } else {
                            setOrg(org) // revert on failure
                            toast.error('Failed to update pricing setting')
                          }
                        } catch {
                          setOrg(org) // revert on failure
                          toast.error('Failed to update pricing setting')
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!org.free_assessments ? 'bg-[#0a192f]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!org.free_assessments ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {!org.free_assessments ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-[#5a7a9a]">$</span>
                        <Input
                          type="number"
                          min="0.50"
                          step="1"
                          value={org.assessment_price}
                          onChange={(e) => setOrg({ ...org, assessment_price: parseFloat(e.target.value) || 0 })}
                          className="text-2xl font-bold text-[#0a192f] h-12 w-32 border-[#e5e0d5]"
                        />
                        <span className="text-sm text-[#5a7a9a]">/ per student</span>
                      </div>
                      <p className="text-xs text-[#5a7a9a]">Set the price you charge per assessment. Click &quot;Save Changes&quot; to update.</p>
                    </>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">Students will go directly to the assessment without payment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stripe Connect Section */}
            <Card className="border-[#e5e0d5]">
              <CardHeader>
                <p className="text-sm font-bold text-[#5a7a9a] uppercase tracking-widest">Payment Collection</p>
                <CardTitle className="text-2xl">Stripe Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {org.free_assessments ? (
                  <p className="text-sm text-[#5a7a9a]">Payment collection is disabled because assessments are set to free. Toggle charging above to configure Stripe.</p>
                ) : connectStatus?.connected && connectStatus.charges_enabled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm font-medium text-green-700">Stripe account connected and active</p>
                    </div>
                    <p className="text-xs text-[#5a7a9a]">Payments from students go directly to your Stripe account.</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleConnectStripe} disabled={connectLoading}>
                        {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage Account"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={handleDisconnectStripe}>
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : connectStatus?.connected && !connectStatus.details_submitted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <p className="text-sm font-medium text-yellow-700">Stripe setup incomplete</p>
                    </div>
                    <p className="text-xs text-[#5a7a9a]">You started connecting your Stripe account but haven&apos;t finished. Complete the setup to start collecting payments.</p>
                    <Button onClick={handleConnectStripe} disabled={connectLoading} className="bg-[#0a192f] hover:bg-[#0a192f]/90">
                      {connectLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Complete Stripe Setup
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[#5a7a9a]">Connect your Stripe account to collect payments directly from students. Payments go straight to your bank account.</p>
                    <Button onClick={handleConnectStripe} disabled={connectLoading} className="bg-[#635bff] hover:bg-[#635bff]/90 text-white">
                      {connectLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Connect with Stripe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {org.billing_type !== 'one_time' && (
            <div>
              <h3 className="text-xl font-bold text-[#0a192f] mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#c9a227]" />
                Available Plans
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`border-[#e5e0d5] relative overflow-hidden ${plan.popular ? 'ring-2 ring-[#c9a227]' : ''}`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-[#c9a227] text-[#0a192f] text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="text-sm text-[#5a7a9a] flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleUpgradePlan(plan.id)}
                        disabled={org.plan_type === plan.id || !!billingLoading}
                        className={`w-full font-bold ${org.plan_type === plan.id ? 'bg-gray-100 text-gray-400' : 'bg-[#0a192f] text-white hover:bg-[#152a45]'}`}
                      >
                        {billingLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                         org.plan_type === plan.id ? "Current Plan" : `Switch to ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            )}
          </TabsContent>

          <TabsContent value="emails" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Customize the sender details for student emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sender Name</Label>
                      <Input
                        placeholder={org.name}
                        value={org.custom_email_from || ""}
                        onChange={(e) => setOrg({ ...org, custom_email_from: e.target.value })}
                      />
                      <p className="text-xs text-[#5a7a9a]">Appears in the &quot;From&quot; field of emails</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Reply-To Email</Label>
                      <Input
                        placeholder="support@agency.com"
                        value={org.custom_email_reply_to || ""}
                        onChange={(e) => setOrg({ ...org, custom_email_reply_to: e.target.value })}
                      />
                      <p className="text-xs text-[#5a7a9a]">Where student replies will be sent</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e5e0d5]">
                    <h4 className="font-bold text-[#0a192f] mb-3">Email Types Sent</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#faf8f3] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0a192f] text-sm">Student Invite</p>
                            <p className="text-xs text-[#5a7a9a]">Sent when inviting students</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#faf8f3] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0a192f] text-sm">Results Ready</p>
                            <p className="text-xs text-[#5a7a9a]">Sent when assessment completes</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#faf8f3] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0a192f] text-sm">Resume Code</p>
                            <p className="text-xs text-[#5a7a9a]">Sent when student saves progress</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                  <CardDescription>See how your branded emails will appear to students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-[#e5e0d5] rounded-xl overflow-hidden">
                    {/* Email Header Preview */}
                    <div
                      className="p-6 text-center"
                      style={{ backgroundColor: org.primary_color }}
                    >
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="max-w-[120px] max-h-[40px] mx-auto mb-3"
                        />
                      ) : (
                        <div
                          className="font-bold text-xl mb-2"
                          style={{ color: org.secondary_color }}
                        >
                          {org.name}
                        </div>
                      )}
                      <h3 className="text-white font-bold text-lg">You&apos;re Invited!</h3>
                    </div>

                    {/* Email Content Preview */}
                    <div className="p-6 bg-white">
                      <h4 className="font-bold mb-2" style={{ color: org.primary_color }}>
                        Discover Your Personalized Roadmap
                      </h4>
                      <p className="text-[#5a7a9a] text-sm mb-4">
                        {org.name} has invited you to take a comprehensive student assessment...
                      </p>

                      <div
                        className="rounded-lg p-4 text-center mb-4"
                        style={{ backgroundColor: `${org.secondary_color}15` }}
                      >
                        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: org.primary_color }}>
                          Your Access Code
                        </p>
                        <p className="text-2xl font-bold tracking-widest" style={{ color: org.primary_color }}>
                          DEMO123
                        </p>
                      </div>

                      <button
                        className="w-full py-3 rounded-lg text-white font-bold text-sm"
                        style={{ backgroundColor: org.primary_color }}
                      >
                        Start My Assessment →
                      </button>
                    </div>

                    {/* Email Footer Preview */}
                    <div className="px-6 py-4 bg-[#faf8f3] border-t border-[#e5e0d5] text-center">
                      <p className="text-xs text-[#5a7a9a]">
                        &copy; {new Date().getFullYear()} {org.name}. All rights reserved.
                      </p>
                      {!org.remove_branding && (
                        <p className="text-[10px] text-[#5a7a9a] mt-1">
                          Powered by The Student Blueprint Platform
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#5a7a9a] mt-4 text-center">
                    Email styling automatically uses your branding colors and logo
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="border-[#e5e0d5]">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Integrate assessments directly into your own tools and CRM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-[#0a192f] rounded-2xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#c9a227]" />
                      <span className="font-bold">Your Secret API Key</span>
                    </div>
                    {org.api_key && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:bg-white/10"
                        onClick={() => copyToClipboard(org.api_key!)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/10 font-mono text-sm break-all">
                    {org.api_key || "No API key generated yet"}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={generateApiKey} 
                      disabled={saving}
                      className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f] font-bold"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      {org.api_key ? "Regenerate Key" : "Generate API Key"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[#0a192f]">Quick Reference</h3>
                  <div className="p-4 bg-[#faf8f3] rounded-xl border border-[#e5e0d5] space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-mono flex items-center gap-2 text-[#5a7a9a]">
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0">POST</Badge>
                        /api/v1/assessments/invite
                      </p>
                      <p className="text-sm text-[#5a7a9a]">Used to programmatically invite a student to an assessment.</p>
                    </div>
                    <div className="p-3 bg-white rounded border border-[#e5e0d5] font-mono text-xs">
                      {`{ "email": "student@example.com", "first_name": "John" }`}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#e5e0d5]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#0a192f] flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-purple-600" />
                        Webhooks
                      </h3>
                      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                        Alpha
                      </Badge>
                    </div>
                    <p className="text-sm text-[#5a7a9a]">Receive real-time notifications when a student completes an assessment.</p>

                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://your-crm.com/webhooks/student-blueprint"
                          value={org.webhook_url || ""}
                          onChange={(e) => setOrg({ ...org, webhook_url: e.target.value })}
                        />
                      </div>
                      <p className="text-[10px] text-[#5a7a9a]">Payload includes student details, scores, and report URL.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-6">
            <CustomDomainSettingsCard
              org={org}
              onDomainUpdate={(domain) => setOrg({ ...org, domain: domain })}
            />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <AssessmentCustomizationCard
              org={org}
              onSectionsUpdate={(sections) => setOrg({ ...org, enabled_sections: sections })}
            />
          </TabsContent>
        </Tabs>
  )

  if (embedded) {
    return (
      <div>
        {settingsContent}
        <Dialog open={showAdminInviteDialog} onOpenChange={setShowAdminInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Add a new admin to your agency dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={adminInvite.email}
                onChange={(e) => setAdminInvite({ ...adminInvite, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name (optional)</Label>
              <Input
                value={adminInvite.fullName}
                onChange={(e) => setAdminInvite({ ...adminInvite, fullName: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={adminInvite.role} onValueChange={(v) => setAdminInvite({ ...adminInvite, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInviteAdmin}
              disabled={isInvitingAdmin || !adminInvite.email}
              className="w-full bg-[#0a192f]"
            >
              {isInvitingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
            <p className="text-center text-xs text-[#5a7a9a]">
              They will receive an email with temporary login credentials.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <nav className="bg-[#0a192f] text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/agency" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Agency Settings
              </h1>
              <Badge className="bg-[#c9a227] text-[#0a192f] border-0 uppercase tracking-widest text-[10px] font-black">
                {org.plan_type}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => handleUpdateOrg()}
            disabled={saving}
            className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f] font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {settingsContent}
      </main>

      <Dialog open={showAdminInviteDialog} onOpenChange={setShowAdminInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Add a new admin to your agency dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={adminInvite.email}
                onChange={(e) => setAdminInvite({ ...adminInvite, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name (optional)</Label>
              <Input
                value={adminInvite.fullName}
                onChange={(e) => setAdminInvite({ ...adminInvite, fullName: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={adminInvite.role} onValueChange={(v) => setAdminInvite({ ...adminInvite, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInviteAdmin} disabled={isInvitingAdmin || !adminInvite.email} className="w-full bg-[#0a192f]">
              {isInvitingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
            <p className="text-center text-xs text-[#5a7a9a]">
              They will receive an email with temporary login credentials.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

