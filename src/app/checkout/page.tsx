"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  CreditCard,
  Shield,
  CheckCircle2,
  Loader2,
  Tag,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [resumeCode, setResumeCode] = useState("")
  const [isResuming, setIsResuming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(true)
  const [tenant, setTenant] = useState<any>(null)
  const [tenantLoaded, setTenantLoaded] = useState(false)
  const [isCustomOrg, setIsCustomOrg] = useState(false)
  const [referralData, setReferralData] = useState<{
    partner_name: string
    discount_percent: number
    discounted_price: number | null
    referral_code: string
    partner_id: string
  } | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount_type: "percentage" | "fixed" | "free"
    discount_value: number
    discounted_price: number
    payment_required: boolean
  } | null>(null)

  // Extract org slug from query params or URL path (middleware rewrites keep original browser URL)
  const getOrgSlug = () => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('org')
    if (fromQuery) return fromQuery
    const match = window.location.pathname.match(/^\/([a-z0-9-]+)\/(assessment|checkout)/)
    return match ? match[1] : null
  }

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const slug = getOrgSlug()
        if (slug) setIsCustomOrg(true)
        const apiUrl = slug
          ? `/api/platform/organizations/me?org=${encodeURIComponent(slug)}`
          : '/api/platform/organizations/me'

        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          setTenant(data)
        }
      } catch (error) {
        console.error('Error fetching tenant:', error)
      } finally {
        setTenantLoaded(true)
      }
    }
    fetchTenant()
  }, [])

  // Validate referral code from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refFromUrl = params.get('ref')
    const refCode = refFromUrl?.toUpperCase().trim() || localStorage.getItem('tsb_ref')
    if (!refCode) return

    // Store it so it persists across navigation
    localStorage.setItem('tsb_ref', refCode)

    const validateReferral = async () => {
      try {
        const res = await fetch(`/api/referral/validate?code=${encodeURIComponent(refCode)}`)
        const data = await res.json()
        if (data.valid) {
          setReferralData({
            partner_name: data.partner_name,
            discount_percent: data.discount_percent,
            discounted_price: data.discounted_price,
            referral_code: data.referral_code,
            partner_id: data.partner_id,
          })
        }
      } catch (err) {
        console.error('Error validating referral code:', err)
      }
    }
    validateReferral()
  }, [])

  // Auto-resume if ?code= is in the URL (from email link)
  useEffect(() => {
    if (!tenantLoaded) return
    const params = new URLSearchParams(window.location.search)
    const codeFromUrl = params.get('code')
    const couponFromUrl = params.get('coupon') || params.get('coupon_code')
    const emailFromUrl = params.get('email')

    if (couponFromUrl) {
      setCouponCode(couponFromUrl.toUpperCase().trim())
      if (emailFromUrl) setEmail(emailFromUrl)
      return
    }

    if (codeFromUrl) {
      // Automatically trigger resume with this code
      const autoResume = async () => {
        const normalizedCode = codeFromUrl.trim().toUpperCase()
        setIsResuming(true)
        try {
          const response = await fetch("/api/assessment/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: normalizedCode })
          })
          const data = await response.json()
          if (data.success && data.assessment) {
            sessionStorage.setItem("resumeAssessment", JSON.stringify(data))
            const orgParam = tenant?.slug ? `?org=${encodeURIComponent(tenant.slug)}&code=${normalizedCode}` : `?code=${normalizedCode}`
            router.push(`/assessment${orgParam}`)
            return
          }
        } catch (e) {
          console.error("Auto-resume failed:", e)
        }

        try {
          const couponResponse = await fetch("/api/coupon/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: normalizedCode,
              email: emailFromUrl || undefined,
              organization_slug: tenant?.slug,
            }),
          })
          const couponData = await couponResponse.json()
          if (couponData.valid) {
            setCouponCode(couponData.code)
            if (emailFromUrl) setEmail(emailFromUrl)
            toast.success("Coupon code loaded. Enter your email and apply it to continue.")
            setIsResuming(false)
            return
          }
        } catch (e) {
          console.error("Coupon prefill failed:", e)
        }

        setIsResuming(false)
        // If auto-resume failed, pre-fill the code field so user can try manually
        setResumeCode(normalizedCode)
      }
      autoResume()
    }
  }, [tenantLoaded, tenant, router])

  useEffect(() => {
    if (!tenantLoaded) return

    // If org has free assessments, skip payment check
    if (tenant?.free_assessments) {
      setIsCheckingPayment(false)
      return
    }

    const checkExistingPayment = async () => {
      const resumeEmail = localStorage.getItem("studentblueprint_resume_email")
      const paidEmail = localStorage.getItem("studentblueprint_paid_email")

      if (resumeEmail) {
        setEmail(resumeEmail)
      }

      const emailToCheck = paidEmail || resumeEmail
      if (emailToCheck) {
        try {
          const orgParam = tenant?.slug ? `&organization_slug=${encodeURIComponent(tenant.slug)}` : ''
          const response = await fetch(`/api/payment/verify?email=${encodeURIComponent(emailToCheck)}${orgParam}`)
          if (!response.ok) { setIsCheckingPayment(false); return; }
          const data = await response.json()

          if (data.paid) {
            localStorage.setItem("studentblueprint_paid_email", emailToCheck)
            toast.success("You've already paid! Redirecting to your assessment...")
            router.push("/assessment")
            return
          }
        } catch (e) {
          console.error("Error checking payment:", e)
        }
      }

      setIsCheckingPayment(false)
    }

    checkExistingPayment()
  }, [router, tenantLoaded])

  const handlePayment = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          organization_slug: tenant?.slug,
          referral_code: referralData?.referral_code || undefined,
          coupon_code: appliedCoupon?.payment_required ? appliedCoupon.code : undefined,
        }),
      })

      const data = await response.json()

      if (data.free && data.coupon) {
        const params = new URLSearchParams()
        params.set("coupon", data.coupon)
        params.set("email", email)
        if (tenant?.slug) params.set("org", tenant.slug)
        router.push(`/payment/success?${params.toString()}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleResume = async () => {
    if (!resumeCode.trim()) {
      toast.error("Please enter your resume code")
      return
    }
    setIsResuming(true)
    try {
      const response = await fetch("/api/assessment/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: resumeCode.trim().toUpperCase() })
      })
      const data = await response.json()
      if (data.success && data.assessment) {
        sessionStorage.setItem("resumeAssessment", JSON.stringify(data))
        const code = resumeCode.trim().toUpperCase()
        const orgParam = tenant?.slug ? `?org=${encodeURIComponent(tenant.slug)}&code=${code}` : `?code=${code}`
        router.push(`/assessment${orgParam}`)
      } else {
        toast.error(data.error || "Invalid resume code. Please check and try again.")
      }
    } catch {
      toast.error("Failed to resume. Please try again.")
    } finally {
      setIsResuming(false)
    }
  }

  const handleCouponSubmit = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setIsValidatingCoupon(true)
    try {
      const response = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, email: email || undefined, organization_slug: tenant?.slug }),
      })

      const data = await response.json()

      if (data.valid) {
        if (!data.payment_required) {
          toast.success("Free coupon applied! Redirecting...")
          localStorage.setItem("studentblueprint_coupon", data.code)
          const params = new URLSearchParams()
          params.set("coupon", data.code)
          if (email) params.set("email", email)
          if (tenant?.slug) params.set("org", tenant.slug)
          router.push(`/payment/success?${params.toString()}`)
          return
        }

        setAppliedCoupon({
          code: data.code,
          discount_type: data.discount_type,
          discount_value: Number(data.discount_value || 0),
          discounted_price: Number(data.discounted_price),
          payment_required: true,
        })
        toast.success("Coupon applied. Your price has been updated.")
      } else {
        toast.error(data.error || "Invalid coupon code")
      }
    } catch (error) {
      console.error("Coupon validation error:", error)
      toast.error("Failed to validate coupon. Please try again.")
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const features = [
    "15-section comprehensive assessment",
    "Personalized success roadmap",
    "Student archetype analysis",
    "Gap analysis & recommendations",
    "Passion project suggestions",
    "Downloadable PDF report",
    "Email delivery of results",
  ]

  const primaryColor = tenant?.primary_color || "#1e3a5f"
  const basePrice = Number(tenant?.assessment_price || 497)
  const referralPrice = referralData?.discounted_price != null ? Number(referralData.discounted_price) : null
  const couponPrice = appliedCoupon?.discounted_price != null ? Number(appliedCoupon.discounted_price) : null
  const displayPrice = Math.min(
    basePrice,
    ...(referralPrice !== null ? [referralPrice] : []),
    ...(couponPrice !== null ? [couponPrice] : [])
  )
  const hasDiscount = displayPrice < basePrice
  const formatCurrency = (value: number) => `$${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`

  if (isCheckingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ece3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-[#5a7a9a]">Loading...</p>
        </div>
      </div>
    )
  }

  // ─── Free Assessment Flow ──────────────────────────────────────────────
  if (tenant?.free_assessments) {
    // Redirect to payment success page for unified info collection
    const params = new URLSearchParams()
    params.set("free", "true")
    if (tenant.slug) params.set("org", tenant.slug)
    router.push(`/payment/success?${params.toString()}`)
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-[#5a7a9a]">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ece3]">
      <nav className="bg-[#faf8f3]/95 backdrop-blur-md border-b border-[#e5e0d5] sticky top-0 z-50 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image 
                  src={tenant?.logo_url || "/logo.png"} 
                  alt={`${tenant?.name || "The Student Blueprint"} Logo`}
                  fill 
                  className="object-contain group-hover:scale-110 transition-transform" 
                />
              </div>
              {isCustomOrg && tenant?.name ? (
                <span className="font-bold text-lg sm:text-xl" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: tenant.primary_color || "#1E2849" }}>
                  {tenant.name}
                </span>
              ) : (
                <span className="text-lg sm:text-xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <span className="font-bold text-[#1E2849]">TheStudent</span><span className="font-semibold text-[#af8f5b]">Blueprint</span>
                </span>
              )}
            </Link>

          <Link href="/resume">
            <Button variant="ghost" className="text-[#5a7a9a] hover:text-[#1e3a5f] text-xs font-semibold">
              Resume Assessment
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: tenant?.primary_color || "#1e3a5f" }}
          >
            Complete Your Purchase
          </h1>
          <p className="text-base sm:text-lg text-[#5a7a9a] max-w-2xl mx-auto">
            Unlock your personalized growth roadmap with our comprehensive assessment
          </p>
        </motion.div>

        {referralData && referralData.discount_percent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 text-center"
          >
            <p className="text-emerald-800 font-semibold text-lg">
              Referred by {referralData.partner_name} &mdash; {referralData.discount_percent}% off!
            </p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-[#e5e0d5] shadow-lg overflow-hidden rounded-xl">
              <div className="text-white p-6" style={{ backgroundColor: tenant?.primary_color || "#1e3a5f" }}>
                <div className="flex items-center gap-3 mb-1">
                  <Sparkles className="w-5 h-5" style={{ color: tenant?.secondary_color || "#c9a227" }} />
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                    {isCustomOrg && tenant?.name ? `${tenant.name} Assessment` : "Student Blueprint Assessment"}
                  </h3>
                </div>
                <p className="text-white/70 text-sm">One-time payment for full access</p>
              </div>
                <CardContent className="p-6 pt-8">
                  <div className="mb-8 flex items-baseline gap-2">
	                    {hasDiscount ? (
  	                      <>
  	                        <span className="text-2xl font-bold line-through text-[#5a7a9a]/60">
 	                          {formatCurrency(basePrice)}
  	                        </span>
  	                        <span className="text-5xl font-bold" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
 	                          {formatCurrency(displayPrice)}
  	                        </span>
  	                      </>
  	                    ) : (
  	                      <span className="text-5xl font-bold" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
	                        {formatCurrency(displayPrice)}
  	                      </span>
  	                    )}
                    <span className="text-lg text-[#5a7a9a] ml-1">USD</span>
                  </div>

                <div className="space-y-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tenant?.secondary_color || "#c9a227" }} />
                      <span className="text-[15px]" style={{ color: tenant?.primary_color || "#1e3a5f" }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#5a7a9a] bg-[#faf8f3] rounded-lg p-3 mt-8">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-[#e5e0d5] shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#e5e0d5]"
                  />
                  <p className="text-xs text-[#5a7a9a]">We&apos;ll send your results to this email</p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !email}
                  className="w-full font-semibold h-12 text-white"
                  style={{ backgroundColor: tenant?.primary_color || "#1e3a5f" }}
                >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
	                        Pay {formatCurrency(displayPrice)}
	                        <ArrowRight className="w-4 h-4 ml-2" />
	                      </>
                    )}

                </Button>

                <div className="relative">
                  <Separator className="bg-[#e5e0d5]" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-[#5a7a9a]">
                    or
                  </span>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
                    <Tag className="w-4 h-4" />
                    Have a coupon code?
                  </Label>
	                  <div className="flex gap-2">
	                    <Input
	                      placeholder="Enter code"
	                      value={couponCode}
	                      onChange={(e) => {
	                        setCouponCode(e.target.value.toUpperCase())
	                        setAppliedCoupon(null)
	                      }}
	                      className="border-[#e5e0d5] uppercase"
	                    />
                    <Button
                      variant="outline"
                      onClick={handleCouponSubmit}
                      disabled={isValidatingCoupon}
                      style={{ borderColor: tenant?.primary_color || "#1e3a5f", color: tenant?.primary_color || "#1e3a5f" }}
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
	                  {appliedCoupon ? (
	                    <p className="text-xs font-semibold text-emerald-700">
	                      {appliedCoupon.code} applied. New price: {formatCurrency(displayPrice)}
	                    </p>
	                  ) : (
	                    <p className="text-xs text-[#5a7a9a]">Free coupons skip payment; discount coupons update the price.</p>
	                  )}
	                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
