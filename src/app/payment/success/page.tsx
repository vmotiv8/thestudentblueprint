"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, ArrowRight, Copy, Check, GraduationCap, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"
import { toast } from "sonner"

type PageState = "verifying" | "form" | "resumeCode" | "error"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Page state
  const [pageState, setPageState] = useState<PageState>("verifying")

  // Form fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emailReadOnly, setEmailReadOnly] = useState(false)

  // Result state
  const [uniqueCode, setUniqueCode] = useState("")
  const [assessmentId, setAssessmentId] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Flow detection
  const sessionId = searchParams.get("session_id")
  const couponCode = searchParams.get("coupon")
  const isFreeOrg = searchParams.get("free") === "true"
  const orgSlug = searchParams.get("org")

  // Determine which flow we're in for header text
  const isPaidFlow = !!sessionId
  const headerTitle = isPaidFlow ? "Payment Successful!" : "Welcome!"
  const headerSubtitle = isPaidFlow ? "Thank you for your purchase" : "Your access has been confirmed"
  const headerGradient = isPaidFlow
    ? "from-emerald-500 to-emerald-600"
    : "from-[#1e3a5f] to-[#2a4a6f]"
  const headerIcon = isPaidFlow
    ? <CheckCircle2 className="w-12 h-12 text-emerald-500" />
    : <GraduationCap className="w-12 h-12 text-[#1e3a5f]" />

  useEffect(() => {
    const init = async () => {
      if (sessionId) {
        // Paid flow: verify Stripe payment, get email
        try {
          localStorage.setItem("studentblueprint_payment_session", sessionId)
          const response = await fetch(`/api/payment/verify?session_id=${sessionId}`)
          const data = await response.json()

          if (data.paid && data.email) {
            setEmail(data.email)
            setEmailReadOnly(true)
            localStorage.setItem("studentblueprint_paid_email", data.email)
            setPageState("form")

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#1e3a5f", "#c9a227", "#10b981"],
            })
          } else {
            setPageState("error")
          }
        } catch {
          setPageState("error")
        }
      } else if (couponCode) {
        // Coupon flow: email from query param, editable
        const emailParam = searchParams.get("email") || ""
        setEmail(decodeURIComponent(emailParam))
        setEmailReadOnly(false)
        localStorage.setItem("studentblueprint_coupon", couponCode)
        setPageState("form")
      } else if (isFreeOrg) {
        // Free org flow: no email pre-filled
        setEmailReadOnly(false)
        setPageState("form")
      } else {
        // No valid flow params
        setPageState("error")
      }
    }

    init()
  }, [sessionId, couponCode, isFreeOrg, searchParams])

  const handleSubmit = async () => {
    // Validate
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter your full name")
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          sessionId: sessionId || undefined,
          couponCode: couponCode || undefined,
          organizationSlug: orgSlug || undefined,
          referralCode: localStorage.getItem('tsb_ref') || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Registration failed. Please try again.")
        return
      }

      // Store in localStorage for assessment auto-fill
      localStorage.setItem("studentblueprint_paid_email", email.trim())
      localStorage.setItem("studentblueprint_student_name", fullName.trim())
      if (phone.trim()) localStorage.setItem("studentblueprint_student_phone", phone.trim())
      localStorage.setItem("studentblueprint_resume_code", data.uniqueCode)

      // Clear referral code after successful registration
      localStorage.removeItem('tsb_ref')

      setUniqueCode(data.uniqueCode)
      setAssessmentId(data.assessmentId)
      setPageState("resumeCode")

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#1e3a5f", "#c9a227"],
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartAssessment = () => {
    const params = new URLSearchParams()
    if (sessionId) params.set("session_id", sessionId)
    if (orgSlug) params.set("org", orgSlug)
    const query = params.toString()
    router.push(`/assessment${query ? `?${query}` : ""}`)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(uniqueCode)
    setCodeCopied(true)
    toast.success("Resume code copied!")
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Loading state
  if (pageState === "verifying") {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-[#5a7a9a]">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ece3]">
      <nav className="bg-[#faf8f3]/90 backdrop-blur-md border-b border-[#e5e0d5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-md" />
            <span className="text-xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="font-bold text-[#1E2849]">TheStudent</span>
              <span className="font-semibold text-[#af8f5b]">Blueprint</span>
            </span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-[#e5e0d5] shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className={`bg-gradient-to-br ${headerGradient} p-8 text-center`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                {pageState === "resumeCode" ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                ) : (
                  headerIcon
                )}
              </motion.div>
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
              >
                {pageState === "resumeCode" ? "You're All Set!" : headerTitle}
              </h1>
              <p className="text-white/90">
                {pageState === "resumeCode" ? "Your account has been created" : headerSubtitle}
              </p>
            </div>

            <CardContent className="p-8">
              {/* State 1: Info Form */}
              {pageState === "form" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[#5a7a9a] text-center mb-6">
                    Please provide your details to get started with your assessment.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#1e3a5f] font-semibold">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border-[#e5e0d5] h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1e3a5f] font-semibold">
                        Email Address {!emailReadOnly && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={emailReadOnly}
                        className={`border-[#e5e0d5] h-12 ${emailReadOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                      />
                      {emailReadOnly && (
                        <p className="text-xs text-[#5a7a9a]">Pre-filled from payment</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1e3a5f] font-semibold">
                        Phone Number <span className="text-[#5a7a9a] font-normal">(optional)</span>
                      </Label>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border-[#e5e0d5] h-12"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white h-12 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* State 2: Resume Code Display */}
              {pageState === "resumeCode" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <p className="text-[#5a7a9a] mb-6">
                    Here&apos;s your unique resume code. Use it to continue your assessment anytime.
                  </p>

                  <div className="bg-[#fef3c7] border-2 border-dashed border-[#c9a227] rounded-xl p-6 mb-4">
                    <p className="text-xs uppercase font-semibold text-[#92710a] mb-2">
                      Your Resume Code
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-4xl font-bold font-mono tracking-[6px] text-[#1e3a5f]">
                        {uniqueCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-2 rounded-lg hover:bg-[#f5e6a3] transition-colors"
                        title="Copy code"
                      >
                        {codeCopied ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-[#92710a]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-3 mb-6 flex items-center justify-center gap-2 text-sm text-emerald-700">
                    <Mail className="w-4 h-4" />
                    <span>
                      We&apos;ve also emailed this code to <strong>{email}</strong>
                    </span>
                  </div>

                  <Button
                    onClick={handleStartAssessment}
                    className="bg-[#1e3a5f] hover:bg-[#152a45] text-white h-12 px-8"
                  >
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* State 3: Error */}
              {pageState === "error" && (
                <>
                  <p className="text-[#5a7a9a] mb-8 text-center">
                    We couldn&apos;t verify your payment session. If you believe this is an error,
                    please contact support.
                  </p>
                  <div className="text-center">
                    <Link href="/checkout">
                      <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                        Try Again
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1e3a5f]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
