'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Palette, Mail, Users, ArrowRight, ArrowLeft, Globe, Upload, Copy, Send, X, ImageIcon, Loader2 } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const STEPS: OnboardingStep[] = [
  {
    id: 'branding',
    title: 'Brand Your Portal',
    description: 'Customize colors and logo',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    id: 'domain',
    title: 'Your Custom URL',
    description: 'Your unique portal URL',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: 'email',
    title: 'Email Settings',
    description: 'Configure email appearance',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'invite',
    title: 'Invite a Student',
    description: 'Send your first invitation',
    icon: <Users className="w-5 h-5" />,
  },
]

const COLOR_PRESETS = [
  { label: 'Navy', primary: '#1e3a5f', accent: '#c9a227' },
  { label: 'Forest', primary: '#1a4a3a', accent: '#d4a843' },
  { label: 'Charcoal', primary: '#2d3436', accent: '#e17055' },
  { label: 'Plum', primary: '#4a2545', accent: '#f0c27f' },
  { label: 'Ocean', primary: '#0c3547', accent: '#38ada9' },
  { label: 'Slate', primary: '#34495e', accent: '#1abc9c' },
]

interface OrgSettings {
  name: string
  slug: string
  logo_url: string
  primary_color: string
  secondary_color: string
  custom_email_from: string
  custom_email_reply_to: string
  assessment_price: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<OrgSettings>({
    name: '',
    slug: '',
    logo_url: '',
    primary_color: '#1e3a5f',
    secondary_color: '#c9a227',
    custom_email_from: '',
    custom_email_reply_to: '',
    assessment_price: 47,
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/agency/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          name: data.name || '',
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#1e3a5f',
          secondary_color: data.secondary_color || '#c9a227',
          custom_email_from: data.custom_email_from || '',
          custom_email_reply_to: data.custom_email_reply_to || '',
          assessment_price: data.assessment_price || 47,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (updates: Partial<OrgSettings>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...updates }))
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/agency/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const { url } = await res.json()
        setSettings((prev) => ({ ...prev, logo_url: url }))
      }
    } catch (error) {
      console.error('Failed to upload:', error)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const sendInvite = async () => {
    if (!inviteEmail) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/invite-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [inviteEmail] }),
      })
      if (res.ok) {
        setInviteSent(true)
      }
    } catch (error) {
      console.error('Failed to send invite:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setSaving(true)
      try {
        await fetch('/api/agency/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboarding_completed: true }),
        })
      } catch (error) {
        console.error('Failed to mark onboarding complete:', error)
      } finally {
        setSaving(false)
      }
      router.push('/agency')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSkip = () => router.push('/agency')

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${settings.slug}`

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e0d5]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-[#0a192f] font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome to {settings.name || 'Your Portal'}
            </h1>
            <p className="text-[#5a7a9a] text-sm">Let&apos;s get you set up</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#5a7a9a] hover:text-[#0a192f] text-sm font-medium transition-colors"
          >
            Skip Setup
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    index < currentStep
                      ? 'bg-[#0a192f] text-white'
                      : index === currentStep
                      ? 'bg-[#c9a227] text-white'
                      : 'bg-white text-[#5a7a9a] border border-[#e5e0d5]'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[100px] ${
                    index <= currentStep ? 'text-[#0a192f]' : 'text-[#5a7a9a]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-20 h-px mx-3 ${index < currentStep ? 'bg-[#0a192f]' : 'bg-[#e5e0d5]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="bg-white rounded-2xl border border-[#e5e0d5] shadow-sm">
          <div className="p-8">
            {/* Step 1: Branding */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0a192f] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Customize Your Brand
                  </h2>
                  <p className="text-[#5a7a9a] text-sm">
                    Upload your logo and pick your brand colors. Students will see these throughout their experience.
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-[#0a192f] mb-3">Your Logo</label>
                  {settings.logo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl border border-[#e5e0d5] bg-[#faf8f3] flex items-center justify-center overflow-hidden">
                          <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                        </div>
                        <button
                          onClick={() => {
                            setSettings((prev) => ({ ...prev, logo_url: '' }))
                            saveSettings({ logo_url: '' })
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm text-[#5a7a9a]">
                        <p className="font-medium text-[#0a192f]">Logo uploaded</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#c9a227] hover:underline mt-0.5"
                        >
                          Replace with a different file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all py-10 text-center ${
                        dragOver
                          ? 'border-[#c9a227] bg-[#c9a227]/5'
                          : 'border-[#e5e0d5] bg-[#faf8f3] hover:border-[#c9a227]/50 hover:bg-[#c9a227]/[0.02]'
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[#c9a227] mx-auto" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e0d5] flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="w-5 h-5 text-[#5a7a9a]" />
                          </div>
                          <p className="text-sm font-medium text-[#0a192f]">
                            Drop your logo here, or <span className="text-[#c9a227]">browse</span>
                          </p>
                          <p className="text-xs text-[#5a7a9a] mt-1">PNG, JPG, SVG or WebP. Max 2MB.</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                      e.target.value = ''
                    }}
                  />
                </div>

                {/* Color Presets */}
                <div>
                  <label className="block text-sm font-bold text-[#0a192f] mb-3">Brand Colors</label>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {COLOR_PRESETS.map((preset) => {
                      const isActive = settings.primary_color === preset.primary && settings.secondary_color === preset.accent
                      return (
                        <button
                          key={preset.label}
                          onClick={() => {
                            setSettings((prev) => ({ ...prev, primary_color: preset.primary, secondary_color: preset.accent }))
                            saveSettings({ primary_color: preset.primary, secondary_color: preset.accent })
                          }}
                          className={`group relative rounded-xl p-1 transition-all ${
                            isActive ? 'ring-2 ring-[#c9a227] ring-offset-2' : 'hover:ring-2 hover:ring-[#e5e0d5] hover:ring-offset-1'
                          }`}
                        >
                          <div className="flex h-10 rounded-lg overflow-hidden">
                            <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                            <div className="w-3" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="block text-[10px] text-[#5a7a9a] mt-1 font-medium">{preset.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom color pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#5a7a9a] mb-1.5 uppercase tracking-wider">Primary</label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl cursor-pointer hover:border-[#c9a227]/50 transition-colors">
                        <div
                          className="w-7 h-7 rounded-lg border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: settings.primary_color }}
                        />
                        <input
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => setSettings((prev) => ({ ...prev, primary_color: e.target.value }))}
                          onBlur={() => saveSettings({ primary_color: settings.primary_color })}
                          className="sr-only"
                        />
                        <span className="text-sm font-mono text-[#0a192f]">{settings.primary_color}</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5a7a9a] mb-1.5 uppercase tracking-wider">Accent</label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl cursor-pointer hover:border-[#c9a227]/50 transition-colors">
                        <div
                          className="w-7 h-7 rounded-lg border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: settings.secondary_color }}
                        />
                        <input
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings((prev) => ({ ...prev, secondary_color: e.target.value }))}
                          onBlur={() => saveSettings({ secondary_color: settings.secondary_color })}
                          className="sr-only"
                        />
                        <span className="text-sm font-mono text-[#0a192f]">{settings.secondary_color}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <label className="block text-sm font-bold text-[#0a192f] mb-3">Live Preview</label>
                  <div className="rounded-2xl overflow-hidden border border-[#e5e0d5]" style={{ backgroundColor: settings.primary_color }}>
                    <div className="p-8 text-center">
                      {settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="h-10 mx-auto mb-4 object-contain" />
                      ) : (
                        <div className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {settings.name || 'Your Agency'}
                        </div>
                      )}
                      <h3 className="text-white font-semibold mb-1">Student Assessment</h3>
                      <p className="text-white/60 text-sm mb-5">Discover your personalized college roadmap</p>
                      <button
                        className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: settings.secondary_color, color: settings.primary_color }}
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Domain */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0a192f] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Your Assessment Portal URL
                  </h2>
                  <p className="text-[#5a7a9a] text-sm">
                    This is where your students will go to take their assessments. Share this link with
                    them or embed it on your website.
                  </p>
                </div>

                <div className="bg-[#faf8f3] rounded-xl p-5 border border-[#e5e0d5]">
                  <label className="block text-sm font-bold text-[#0a192f] mb-2">Your Portal URL</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 bg-white rounded-xl border border-[#e5e0d5] text-[#0a192f] font-mono text-sm truncate">
                      {portalUrl}
                    </div>
                    <button
                      onClick={() => handleCopyUrl(portalUrl)}
                      className="flex items-center gap-2 px-4 py-3 bg-[#0a192f] hover:bg-[#152a45] text-white rounded-xl font-medium text-sm transition-colors flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-3 text-[#5a7a9a] text-xs">
                    Add this link to your website or email signature so students can easily access it.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-[#0a192f] font-bold text-sm mb-1">Want a custom domain?</h4>
                      <p className="text-[#5a7a9a] text-sm">
                        You can use your own domain (e.g., assessments.youragency.com).
                        Set this up in Settings → Domains after onboarding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Email */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0a192f] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Email Branding
                  </h2>
                  <p className="text-[#5a7a9a] text-sm">
                    Customize how emails appear when sent to your students. This helps build trust and recognition.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0a192f] mb-2">Email Sender Name</label>
                    <input
                      type="text"
                      value={settings.custom_email_from}
                      onChange={(e) => setSettings({ ...settings, custom_email_from: e.target.value })}
                      onBlur={() => saveSettings({ custom_email_from: settings.custom_email_from })}
                      placeholder={settings.name || 'Your Agency Name'}
                      className="w-full px-4 py-3 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl text-[#0a192f] placeholder-[#5a7a9a]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a227]/30 focus:border-[#c9a227] transition-colors"
                    />
                    <p className="mt-1.5 text-[#5a7a9a] text-xs">
                      Students will see this as the &quot;From&quot; name in their inbox
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0a192f] mb-2">Reply-To Email</label>
                    <input
                      type="email"
                      value={settings.custom_email_reply_to}
                      onChange={(e) => setSettings({ ...settings, custom_email_reply_to: e.target.value })}
                      onBlur={() => saveSettings({ custom_email_reply_to: settings.custom_email_reply_to })}
                      placeholder="support@youragency.com"
                      className="w-full px-4 py-3 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl text-[#0a192f] placeholder-[#5a7a9a]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a227]/30 focus:border-[#c9a227] transition-colors"
                    />
                    <p className="mt-1.5 text-[#5a7a9a] text-xs">
                      When students reply, emails will go to this address
                    </p>
                  </div>
                </div>

                {/* Email Preview */}
                <div>
                  <label className="block text-sm font-bold text-[#0a192f] mb-2">Email Preview</label>
                  <div className="bg-white rounded-xl border border-[#e5e0d5] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#e5e0d5]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: settings.primary_color }}
                        >
                          {(settings.custom_email_from || settings.name || 'A').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#0a192f]">
                            {settings.custom_email_from || settings.name || 'Your Agency'}
                          </div>
                          <div className="text-[#5a7a9a] text-xs">to: student@example.com</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="font-semibold text-sm text-[#0a192f] mb-1">
                        You&apos;re Invited to Take Your Assessment!
                      </div>
                      <p className="text-[#5a7a9a] text-sm">
                        {settings.custom_email_from || settings.name || 'Your Agency'} has invited you
                        to complete your student assessment. Click below to get started...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Invite */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0a192f] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Invite Your First Student
                  </h2>
                  <p className="text-[#5a7a9a] text-sm">
                    Let&apos;s send your first assessment invitation! Enter an email address below to get started.
                  </p>
                </div>

                {!inviteSent ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0a192f] mb-2">Student Email Address</label>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="student@example.com"
                          className="flex-1 px-4 py-3 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl text-[#0a192f] placeholder-[#5a7a9a]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a227]/30 focus:border-[#c9a227] transition-colors"
                        />
                        <button
                          onClick={sendInvite}
                          disabled={!inviteEmail || saving}
                          className="flex items-center gap-2 px-5 py-3 bg-[#c9a227] hover:bg-[#b8922a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {saving ? 'Sending...' : 'Send Invite'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#faf8f3] rounded-xl p-5 border border-[#e5e0d5]">
                      <h4 className="text-[#0a192f] font-bold text-sm mb-3">What happens next?</h4>
                      <ul className="space-y-2.5">
                        {[
                          'Student receives a branded email invitation',
                          'They click through to your assessment portal',
                          'Complete the assessment (15-20 minutes)',
                          'You\'ll see their results in your dashboard',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-[#5a7a9a]">
                            <div className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a192f] mb-1">Invitation Sent!</h3>
                    <p className="text-[#5a7a9a] text-sm mb-5">
                      We&apos;ve sent an assessment invitation to {inviteEmail}
                    </p>
                    <button
                      onClick={() => { setInviteSent(false); setInviteEmail('') }}
                      className="text-[#c9a227] hover:text-[#b8922a] font-medium text-sm transition-colors"
                    >
                      Send another invite
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 py-5 border-t border-[#e5e0d5]">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-sm text-[#5a7a9a] hover:text-[#0a192f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              {currentStep < STEPS.length - 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 py-2.5 text-sm text-[#5a7a9a] hover:text-[#0a192f] transition-colors"
                >
                  Skip this step
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0a192f] hover:bg-[#152a45] text-white rounded-xl font-semibold text-sm transition-colors"
              >
                {currentStep === STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
