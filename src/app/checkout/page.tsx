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
  const [isProcessing, setIsProcessing] = useState(false)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(true)
  const [tenant, setTenant] = useState<any>(null)
  const [tenantLoaded, setTenantLoaded] = useState(false)

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/platform/organizations/me')
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

  useEffect(() => {
    if (!tenantLoaded) return

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
          organization_slug: tenant?.slug 
        }),
      })

      const data = await response.json()

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
        toast.success("Coupon applied! Redirecting to assessment...")
localStorage.setItem("studentblueprint_coupon", data.code)
          if (email) {
            localStorage.setItem("studentblueprint_paid_email", email)
        }
        setTimeout(() => {
          router.push("/assessment")
        }, 1000)
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

  if (isCheckingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ece3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-[#5a7a9a]">Checking payment status...</p>
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
                  alt={`${tenant?.name || "Student Blueprint"} Logo`} 
                  fill 
                  className="object-contain group-hover:scale-110 transition-transform" 
                />
              </div>
              <span className="font-bold text-lg sm:text-xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif", color: tenant?.primary_color || "#1e3a5f" }}>
                {tenant?.name || "Student Blueprint"}
              </span>
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
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-3 sm:mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Complete Your Purchase
          </h1>
          <p className="text-base sm:text-lg text-[#5a7a9a] max-w-2xl mx-auto">
            Unlock your personalized college success roadmap with our comprehensive assessment
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-[#e5e0d5] shadow-lg overflow-hidden rounded-xl">
              <div className="bg-[#1e3a5f] text-white p-6">
                <div className="flex items-center gap-3 mb-1">
                  <Sparkles className="w-5 h-5 text-[#c9a227]" />
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Student Assessment
                  </h3>
                </div>
                <p className="text-white/70 text-sm">One-time payment for full access</p>
              </div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                      98% OFF - Limited Time
                    </div>
                  </div>
                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-2xl line-through text-[#5a7a9a]/60">$27,000</span>
                    <span className="text-5xl font-bold text-[#1e3a5f]" style={{ color: tenant?.primary_color || "#1e3a5f" }}>
                      ${tenant?.assessment_price || "499"}
                    </span>
                    <span className="text-lg text-[#5a7a9a] ml-1">USD</span>
                  </div>

                <div className="space-y-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" />
                      <span className="text-[#1e3a5f] text-[15px]">{feature}</span>
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
                <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1e3a5f]">
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
                  className="w-full bg-[#c9a227] hover:bg-[#b8921f] text-[#1e3a5f] font-semibold h-12"
                >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ${tenant?.assessment_price || "499"}
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
                  <Label className="text-[#1e3a5f] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Have a coupon code?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="border-[#e5e0d5] uppercase"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCouponSubmit}
                      disabled={isValidatingCoupon}
                      className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  <p className="text-xs text-[#5a7a9a]">Enter a valid coupon code to skip payment</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}