# Student Info Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect student name, email, and phone on the payment success page (after payment, before assessment), generate a resume code, display it, and email it.

**Architecture:** Modify the existing payment success page to add a 2-step flow (info form → resume code display). Create a new `/api/student/register` endpoint that creates the student + assessment records and sends the resume code email. Update checkout page to route coupon and free flows through the same payment success page.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase, Resend (email), Framer Motion, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-28-student-info-collection-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/api/student/register/route.ts` | Create | Student + assessment creation, resume code generation, email sending |
| `src/app/payment/success/page.tsx` | Modify | Add info collection form (State 1) and resume code display (State 2) |
| `src/app/checkout/page.tsx` | Modify | Redirect coupon/free flows to `/payment/success` instead of `/assessment` |

---

### Task 1: Create `/api/student/register` API Route

**Files:**
- Create: `src/app/api/student/register/route.ts`

- [ ] **Step 1: Create the route file with the full implementation**

```typescript
// src/app/api/student/register/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getOrganizationBySlug, getDefaultOrganization } from '@/lib/tenant'
import { sendResumeCodeEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, sessionId, couponCode, organizationSlug } = body as {
      fullName: string
      email: string
      phone?: string
      sessionId?: string
      couponCode?: string
      organizationSlug?: string
    }

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required (min 2 characters)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Resolve organization
    const organization = organizationSlug
      ? await getOrganizationBySlug(organizationSlug)
      : await getDefaultOrganization()

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Determine payment status
    let paymentStatus: 'paid' | 'free' | 'unpaid' = 'unpaid'

    if (organization.free_assessments) {
      paymentStatus = 'free'
    } else if (sessionId) {
      // Verify Stripe payment
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('stripe_session_id', sessionId)
        .eq('organization_id', organization.id)
        .single()

      if (payment?.status === 'completed') {
        paymentStatus = 'paid'
      }
    }

    // Validate coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, discount_type, max_uses, current_uses, valid_until, is_active')
        .eq('code', couponCode.toUpperCase())
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .single()

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json({ error: 'Coupon has reached its usage limit' }, { status: 400 })
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
      }

      paymentStatus = coupon.discount_type === 'free' ? 'free' : 'paid'
    }

    // Check org student limits
    if (organization.max_students !== -1) {
      const { count: actualCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      if (actualCount !== null && actualCount >= organization.max_students) {
        return NextResponse.json(
          { error: `Student license limit reached (${organization.max_students} max). Please upgrade your plan.` },
          { status: 403 }
        )
      }
    }

    // Generate unique 6-character resume code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
      return code
    }

    // Parse name
    const trimmedName = fullName.trim()
    const nameParts = trimmedName.split(/\s+/)
    const firstName = nameParts[0] || null
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    // Look up existing student by email + org, or create new
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id, unique_code')
      .eq('organization_id', organization.id)
      .eq('email', email.trim())
      .maybeSingle()

    let studentId: string
    let uniqueCode: string
    let isNewStudent = false

    if (existingStudent) {
      studentId = existingStudent.id
      uniqueCode = existingStudent.unique_code || generateCode()

      await supabase
        .from('students')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName,
          unique_code: uniqueCode,
          phone: phone?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStudent.id)
    } else {
      uniqueCode = generateCode()
      isNewStudent = true

      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          organization_id: organization.id,
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName,
          unique_code: uniqueCode,
          phone: phone?.trim() || null,
        })
        .select('id')
        .single()

      if (studentError) throw studentError
      studentId = newStudent.id
    }

    // Increment student count for new students
    if (isNewStudent) {
      await supabase.rpc('increment_students_count', { org_id: organization.id, amount: 1 })
        .then(({ error: rpcErr }) => {
          if (rpcErr) console.error('[StudentRegister] increment_students_count failed:', rpcErr.message)
        })
    }

    // Check for existing in-progress assessment
    let assessmentId: string

    if (existingStudent) {
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .eq('organization_id', organization.id)
        .in('status', ['in_progress', 'partial'])
        .maybeSingle()

      if (existingAssessment) {
        assessmentId = existingAssessment.id
        // Update payment status if needed
        await supabase
          .from('assessments')
          .update({
            payment_status: paymentStatus,
            ...(couponCode ? { coupon_code: couponCode.toUpperCase() } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAssessment.id)
      } else {
        // Create new assessment for existing student
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            organization_id: organization.id,
            student_id: studentId,
            status: 'in_progress',
            current_section: 1,
            payment_status: paymentStatus,
            coupon_code: couponCode ? couponCode.toUpperCase() : null,
            responses: {
              basicInfo: {
                fullName: trimmedName,
                email: email.trim(),
                phone: phone?.trim() || '',
              },
            },
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (assessmentError) throw assessmentError
        assessmentId = assessment.id
      }
    } else {
      // Create new assessment for new student
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          organization_id: organization.id,
          student_id: studentId,
          status: 'in_progress',
          current_section: 1,
          payment_status: paymentStatus,
          coupon_code: couponCode ? couponCode.toUpperCase() : null,
          responses: {
            basicInfo: {
              fullName: trimmedName,
              email: email.trim(),
              phone: phone?.trim() || '',
            },
          },
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (assessmentError) throw assessmentError
      assessmentId = assessment.id
    }

    // Send resume code email (fire and forget — don't block response)
    sendResumeCodeEmail(email.trim(), trimmedName, uniqueCode).catch((err) => {
      console.error('[StudentRegister] Failed to send resume code email:', err)
    })

    return NextResponse.json({
      success: true,
      studentId,
      assessmentId,
      uniqueCode,
    })
  } catch (error) {
    console.error('[StudentRegister] Error:', error)
    return NextResponse.json(
      { error: 'Failed to register student. Please try again.' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `npx next build --no-lint 2>&1 | head -30` or check for TypeScript errors:
Run: `npx tsc --noEmit src/app/api/student/register/route.ts 2>&1`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/student/register/route.ts
git commit -m "feat: add /api/student/register endpoint for student creation + resume code"
```

---

### Task 2: Modify Payment Success Page

**Files:**
- Modify: `src/app/payment/success/page.tsx`

This is a full rewrite of the `SuccessContent` component. The page needs 3 states: verifying → info form → resume code display.

- [ ] **Step 1: Rewrite the payment success page**

Replace the entire contents of `src/app/payment/success/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Verify the page compiles**

Run: `npx tsc --noEmit src/app/payment/success/page.tsx 2>&1`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/payment/success/page.tsx
git commit -m "feat: add student info collection form and resume code display to payment success page"
```

---

### Task 3: Update Checkout Page — Coupon Flow Redirect

**Files:**
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Change the coupon redirect in `handleCouponSubmit()`**

In `src/app/checkout/page.tsx`, find the `handleCouponSubmit` function. Inside the `if (data.valid)` block (around line 241-250), replace the redirect logic:

Find this code:
```typescript
        toast.success("Coupon applied! Redirecting to assessment...")
localStorage.setItem("studentblueprint_coupon", data.code)
          if (email) {
            localStorage.setItem("studentblueprint_paid_email", email)
        }
        setTimeout(() => {
          const orgParam = tenant?.slug ? `?org=${encodeURIComponent(tenant.slug)}` : ''
          router.push(`/assessment${orgParam}`)
        }, 1000)
```

Replace with:
```typescript
        toast.success("Coupon applied! Redirecting...")
        localStorage.setItem("studentblueprint_coupon", data.code)
        setTimeout(() => {
          const params = new URLSearchParams()
          params.set("coupon", data.code)
          if (email) params.set("email", email)
          if (tenant?.slug) params.set("org", tenant.slug)
          router.push(`/payment/success?${params.toString()}`)
        }, 1000)
```

- [ ] **Step 2: Change the free org redirect in `handleFreeStart()`**

In `src/app/checkout/page.tsx`, find `handleFreeStart()` (around line 204-223). Replace the redirect at the end:

Find this code:
```typescript
    // Store student info for the assessment page to pick up
    localStorage.setItem("studentblueprint_paid_email", email)
    localStorage.setItem("studentblueprint_student_name", fullName)
    if (phone.trim()) localStorage.setItem("studentblueprint_student_phone", phone)
    const orgParam = tenant?.slug ? `?org=${encodeURIComponent(tenant.slug)}` : ''
    router.push(`/assessment${orgParam}`)
```

Replace with:
```typescript
    const params = new URLSearchParams()
    params.set("free", "true")
    if (tenant?.slug) params.set("org", tenant.slug)
    router.push(`/payment/success?${params.toString()}`)
```

Note: We remove the localStorage writes for name/email/phone here because the payment success page now handles that after its own form submission.

- [ ] **Step 3: Remove the free org form UI**

The free org flow currently renders a full "Get Started" form on the checkout page (around line 288-380). Since we're redirecting to the payment success page instead, simplify this section.

Find the block starting with `if (tenant?.free_assessments) {` (line ~288) and replace the entire return block up to its closing brace with a simpler redirect-on-load approach:

Find this code block:
```typescript
  // ─── Free Assessment Flow ──────────────────────────────────────────────
  if (tenant?.free_assessments) {
    return (
```

Replace the entire `if (tenant?.free_assessments) { return (...) }` block with:

```typescript
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
```

- [ ] **Step 4: Verify the checkout page compiles**

Run: `npx tsc --noEmit src/app/checkout/page.tsx 2>&1`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat: redirect coupon and free flows through payment success page for info collection"
```

---

### Task 4: Manual End-to-End Testing

No automated tests — this is a UI flow with Stripe integration. Test manually.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Test the paid flow**

1. Go to `/checkout`
2. Enter an email and click "Pay $497" (use Stripe test card `4242 4242 4242 4242`)
3. After payment, you should land on `/payment/success?session_id=...`
4. Verify: green "Payment Successful!" banner, form with name (empty), email (pre-filled, read-only), phone (empty)
5. Enter name, optionally phone, click "Continue"
6. Verify: resume code displayed in gold dashed box, email confirmation message shown
7. Click "Start Assessment"
8. Verify: assessment loads, Section 1 has name/email/phone pre-filled
9. Verify: resume code badge visible in top-right nav
10. Click "Save" → verify resume code appears in save modal

- [ ] **Step 3: Test the coupon flow**

1. Go to `/checkout`
2. Enter an email, enter a valid 100%-off coupon code, click "Apply"
3. Verify: redirects to `/payment/success?coupon=...&email=...`
4. Verify: blue "Welcome!" banner (not green), email pre-filled but editable
5. Complete the form, verify resume code display, proceed to assessment

- [ ] **Step 4: Test the free org flow**

1. Go to `/checkout?org=<free-org-slug>` (an org with `free_assessments=true`)
2. Verify: immediately redirects to `/payment/success?free=true&org=...`
3. Verify: blue "Welcome!" banner, all fields empty and editable
4. Complete the form, verify resume code display, proceed to assessment

- [ ] **Step 5: Test resume code**

1. Copy the resume code from any of the above flows
2. Go to `/checkout` and enter the code in the "Resume Assessment" field
3. Verify: assessment loads with previously saved data

- [ ] **Step 6: Commit any fixes and final commit**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
