"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  ShieldCheck,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Users,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

// ─── Pricing Logic ──────────────────────────────────────────────────────────

// Minimum agency purchase is 10 licenses; tiers scale down by $50 from $400.
const MIN_LICENSES = 10
const MAX_LICENSES = 2000
const BASE_PRICE_PER_STUDENT = 400

const PRICING_TIERS = [
  { min: 10, max: 24, price: 400, label: "10–24" },
  { min: 25, max: 49, price: 350, label: "25–49" },
  { min: 50, max: 99, price: 300, label: "50–99", popular: true },
  { min: 100, max: 999, price: 250, label: "100–999" },
  { min: 1000, max: Infinity, price: 200, label: "1000+" },
]

function getPricePerStudent(qty: number): number {
  if (qty >= 1000) return 200
  if (qty >= 100) return 250
  if (qty >= 50) return 300
  if (qty >= 25) return 350
  return 400
}

function getSavingsPercent(qty: number): number {
  const price = getPricePerStudent(qty)
  return Math.round((1 - price / BASE_PRICE_PER_STUDENT) * 100)
}

function getTierIndex(qty: number): number {
  return PRICING_TIERS.findIndex((t) => qty >= t.min && qty <= t.max)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Animations ─────────────────────────────────────────────────────────────

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
}

const pageTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (i || 0) * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
} as const

// ─── Component ──────────────────────────────────────────────────────────────

export default function GetStartedPage() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [quantity, setQuantity] = useState(10)
  const [formData, setFormData] = useState({
    agencyName: "",
    slug: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const pricePerStudent = getPricePerStudent(quantity)
  const total = quantity * pricePerStudent
  const savings = quantity * BASE_PRICE_PER_STUDENT - total
  const savingsPercent = getSavingsPercent(quantity)
  const activeTier = getTierIndex(quantity)

  // Auto-generate slug from agency name
  useEffect(() => {
    if (formData.agencyName) {
      const slug = formData.agencyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.agencyName])

  const validateStep2 = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!formData.agencyName.trim()) newErrors.agencyName = "Agency name is required"
    if (!formData.slug.trim()) newErrors.slug = "URL slug is required"
    else if (!/^[a-z0-9-]+$/.test(formData.slug))
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    if (!formData.name.trim()) newErrors.name = "Your name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"
    return newErrors
  }, [formData])

  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (!pw) return { label: "", color: "", width: "0%" }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "20%" }
    if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "40%" }
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "60%" }
    if (score <= 4) return { label: "Strong", color: "bg-emerald-500", width: "80%" }
    return { label: "Very Strong", color: "bg-emerald-400", width: "100%" }
  }

  function handleNext() {
    if (step === 2) {
      const newErrors = validateStep2()
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setTouched({
          agencyName: true,
          slug: true,
          name: true,
          email: true,
          password: true,
          confirmPassword: true,
        })
        return
      }
    }
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }

  function handleBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleCheckout() {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/agency/get-started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          agency_name: formData.agencyName,
          slug: formData.slug,
          quantity,
          price_per_student: pricePerStudent,
          total,
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || "Something went wrong. Please try again.")
        setIsProcessing(false)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
      setIsProcessing(false)
    }
  }

  function handleFieldChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const newErrors = validateStep2()
    if (newErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }))
    } else {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseInt(e.target.value)
    const span = 1500 - MIN_LICENSES
    const qty = Math.round(MIN_LICENSES + (raw / 100) ** 2 * span)
    setQuantity(Math.max(MIN_LICENSES, Math.min(1500, qty)))
  }

  function sliderValue(): number {
    const span = 1500 - MIN_LICENSES
    const ratio = Math.max(0, (quantity - MIN_LICENSES) / span)
    return Math.round(Math.sqrt(ratio) * 100)
  }

  const stepLabels = ["Plan", "Account", "Payment"]

  return (
    <div className="min-h-screen bg-[#FFFAF0] text-[#1E2849] antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFAF0]/80 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
            <span className="font-bold text-[15px] tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="text-[#1E2849]">TheStudent</span><span className="text-[#af8f5b]">Blueprint</span>
            </span>
          </Link>
          <Link
            href="/admin/login"
            className="text-[13px] text-[#af8f5b] font-bold uppercase tracking-[0.15em] hover:text-[#1E2849] transition-colors"
          >
            Sign in
          </Link>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
      </nav>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-0 mb-16">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => {
                    if (s < step) {
                      setDirection(-1)
                      setStep(s)
                    }
                  }}
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500
                    ${s === step
                      ? "bg-[#1b2034] text-white"
                      : s < step
                        ? "bg-[#af8f5b] text-white cursor-pointer"
                        : "bg-[#1E2849]/10 text-[#1E2849]/40"
                    }
                  `}
                >
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </button>
                <span className={`ml-2 text-xs font-bold tracking-[0.15em] uppercase ${s === step ? "text-[#1E2849]" : s < step ? "text-[#af8f5b]" : "text-[#1E2849]/40"} ${s < 3 ? "mr-8" : ""}`}>
                  {stepLabels[s - 1]}
                </span>
                {s < 3 && (
                  <div className="w-12 h-px bg-[#1E2849]/10 mr-4">
                    <motion.div
                      className="h-full bg-[#af8f5b]"
                      initial={{ width: "0%" }}
                      animate={{ width: s < step ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition}>
                <Step1
                  quantity={quantity}
                  setQuantity={setQuantity}
                  pricePerStudent={pricePerStudent}
                  total={total}
                  savings={savings}
                  savingsPercent={savingsPercent}
                  activeTier={activeTier}
                  handleSliderChange={handleSliderChange}
                  sliderValue={sliderValue}
                  onNext={handleNext}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition}>
                <Step2
                  formData={formData}
                  errors={errors}
                  showPassword={showPassword}
                  showConfirm={showConfirm}
                  passwordStrength={passwordStrength}
                  onFieldChange={handleFieldChange}
                  onBlur={handleBlur}
                  setShowPassword={setShowPassword}
                  setShowConfirm={setShowConfirm}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition}>
                <Step3
                  quantity={quantity}
                  pricePerStudent={pricePerStudent}
                  total={total}
                  savings={savings}
                  savingsPercent={savingsPercent}
                  agencyName={formData.agencyName}
                  isProcessing={isProcessing}
                  onBack={handleBack}
                  onCheckout={handleCheckout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1 ─────────────────────────────────────────────────────────────────

function Step1({
  quantity,
  setQuantity,
  pricePerStudent,
  total,
  savings,
  savingsPercent,
  activeTier,
  handleSliderChange,
  sliderValue,
  onNext,
}: {
  quantity: number
  setQuantity: (q: number) => void
  pricePerStudent: number
  total: number
  savings: number
  savingsPercent: number
  activeTier: number
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  sliderValue: () => number
  onNext: () => void
}) {
  return (
    <div className="space-y-12">
      <motion.div className="text-center" variants={fadeIn} initial="hidden" animate="visible" custom={0}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-4">Step 1</p>
        <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Choose your <span className="text-[#af8f5b]">plan</span>
        </h1>
        <p className="text-sm text-[#1E2849]/60 font-bold uppercase tracking-[0.1em] leading-relaxed">
          Select the number of student licenses for your agency.<br />
          Resell to your clients at any price you set, and you keep the margin.
        </p>
      </motion.div>

      {/* Quantity */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => setQuantity(Math.max(MIN_LICENSES, quantity - 1))}
            disabled={quantity <= MIN_LICENSES}
            className="w-11 h-11 rounded-full bg-[#1b2034] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#af8f5b] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1b2034] disabled:hover:text-white/60"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <input
              type="number"
              min={MIN_LICENSES}
              max={MAX_LICENSES}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v)) setQuantity(Math.max(MIN_LICENSES, Math.min(MAX_LICENSES, v)))
              }}
              onBlur={(e) => {
                // Snap up to the minimum if the user typed a low value and tabbed away.
                const v = parseInt(e.target.value)
                if (isNaN(v) || v < MIN_LICENSES) setQuantity(MIN_LICENSES)
              }}
              className="w-24 text-center text-5xl font-bold bg-transparent border-none outline-none text-[#1E2849] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] tracking-tight"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
            />
            <div className="text-xs text-[#af8f5b] font-bold uppercase tracking-[0.15em] mt-0.5">licenses</div>
          </div>
          <button
            onClick={() => setQuantity(Math.min(MAX_LICENSES, quantity + 1))}
            className="w-11 h-11 rounded-full bg-[#1b2034] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#af8f5b] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Slider */}
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue()}
            onChange={handleSliderChange}
            className="w-full h-1 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#1b2034]
              [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(175,143,91,0.3)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_0_6px_rgba(175,143,91,0.4)]
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#1b2034]
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:cursor-pointer
            "
            style={{
              background: `linear-gradient(to right, #af8f5b 0%, #af8f5b ${sliderValue()}%, rgba(30,42,73,0.1) ${sliderValue()}%, rgba(30,42,73,0.1) 100%)`,
            }}
          />
        </div>
      </motion.div>

      {/* Pricing Summary */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={2}>
        <div className="grid grid-cols-3 text-center rounded-xl p-6 border border-[#af8f5b]/20" style={{ backgroundColor: "#1b2034" }}>
          <div>
            <div className="text-xs text-white/50 mb-1 font-bold uppercase tracking-[0.1em]">Per student</div>
            <motion.div
              key={pricePerStudent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold tracking-tight text-[#af8f5b]"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(pricePerStudent)}
            </motion.div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1 font-bold uppercase tracking-[0.1em]">Quantity</div>
            <div className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{quantity}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1 font-bold uppercase tracking-[0.1em]">Total</div>
            <motion.div
              key={total}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(total)}
            </motion.div>
          </div>
        </div>
        {savings > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-[#af8f5b] font-bold uppercase tracking-[0.1em] mt-4"
          >
            You save {formatCurrency(savings)} ({savingsPercent}%)
          </motion.p>
        )}
      </motion.div>

      {/* Tiers */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={3}>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PRICING_TIERS.map((tier, i) => {
            const isActive = i === activeTier
            return (
              <button
                key={tier.label}
                onClick={() => setQuantity(tier.min)}
                className={`
                  relative py-3 px-2 rounded-lg text-center transition-all duration-300
                  ${isActive
                    ? "bg-[#1b2034] ring-1 ring-[#af8f5b]/40"
                    : "bg-[#1E2849]/5 hover:bg-[#1E2849]/10"
                  }
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-px text-[9px] font-bold uppercase tracking-[0.15em] bg-[#af8f5b] text-white rounded-full whitespace-nowrap">
                    Popular
                  </div>
                )}
                <div className={`text-[11px] mb-0.5 font-bold uppercase tracking-wide ${isActive ? "text-white/60" : "text-[#1E2849]/40"}`}>
                  {tier.label}
                </div>
                <div className={`text-base font-bold ${isActive ? "text-[#af8f5b]" : "text-[#1E2849]/60"}`} style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                  ${tier.price}
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Continue */}
      <motion.div className="flex justify-center pt-2" variants={fadeIn} initial="hidden" animate="visible" custom={4}>
        <button
          onClick={onNext}
          className="group flex items-center gap-2.5 px-10 py-4 bg-[#1b2034] text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full transition-all hover:bg-[#af8f5b] active:scale-[0.97]"
        >
          Continue
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  )
}

// ─── Reusable Input ─────────────────────────────────────────────────────────

function InputField({
  label,
  field,
  type = "text",
  placeholder,
  prefix,
  suffix,
  note,
  value,
  error,
  onChange,
  onBlur,
}: {
  label: string
  field: string
  type?: string
  placeholder?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  note?: string
  value: string
  error?: string
  onChange: (field: string, value: string) => void
  onBlur: (field: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E2849]/60 mb-2 uppercase tracking-[0.1em]">{label}</label>
      {prefix ? (
        <div className={`flex items-center rounded-lg bg-white transition-all ${error ? "ring-1 ring-red-500/40 focus-within:ring-red-500/60" : "ring-1 ring-[#af8f5b]/20 focus-within:ring-[#af8f5b]/40"}`}>
          <span className="shrink-0 pl-3.5 pr-1 text-[#1E2849]/40 text-[13px] select-none">{prefix}</span>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            placeholder={placeholder}
            className="flex-1 px-1 py-3 bg-transparent text-[15px] text-[#1E2849] placeholder-[#1E2849]/20 outline-none"
          />
        </div>
      ) : (
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            placeholder={placeholder}
            className={`
              w-full px-3.5 py-3 rounded-lg bg-white text-[15px] text-[#1E2849] placeholder-[#1E2849]/20 outline-none transition-all
              ${error
                ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                : "ring-1 ring-[#af8f5b]/20 focus:ring-[#af8f5b]/40"
              }
            `}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
          )}
        </div>
      )}
      {note && !error && <p className="text-[12px] text-[#1E2849]/50 mt-1.5">{note}</p>}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[12px] text-red-400/80 mt-1.5"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ─── Step 2 ─────────────────────────────────────────────────────────────────

function Step2({
  formData,
  errors,
  showPassword,
  showConfirm,
  passwordStrength,
  onFieldChange,
  onBlur,
  setShowPassword,
  setShowConfirm,
  onBack,
  onNext,
}: {
  formData: { agencyName: string; slug: string; name: string; email: string; password: string; confirmPassword: string }
  errors: Record<string, string>
  showPassword: boolean
  showConfirm: boolean
  passwordStrength: { label: string; color: string; width: string }
  onFieldChange: (field: string, value: string) => void
  onBlur: (field: string) => void
  setShowPassword: (v: boolean) => void
  setShowConfirm: (v: boolean) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-10">
      <motion.div className="text-center" variants={fadeIn} initial="hidden" animate="visible" custom={0}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-4">Step 2</p>
        <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Create your <span className="text-[#af8f5b]">account</span>
        </h1>
        <p className="text-sm text-[#1E2849]/60 font-bold uppercase tracking-[0.1em]">
          Set up your agency to get started.
        </p>
      </motion.div>

      <motion.div className="space-y-5" variants={fadeIn} initial="hidden" animate="visible" custom={1}>
        <InputField label="Agency name" field="agencyName" placeholder="Apex Admissions Group" value={formData.agencyName} error={errors.agencyName} onChange={onFieldChange} onBlur={onBlur} />
        <InputField
          label="URL"
          field="slug"
          placeholder="apex-admissions"
          prefix="thestudentblueprint.com/"
          note="You can later connect your own custom domain and fully brand the site with your logo and colors."
          value={formData.slug}
          error={errors.slug}
          onChange={onFieldChange}
          onBlur={onBlur}
        />

        <div className="h-px bg-[#af8f5b]/20 my-2" />

        <InputField label="Full name" field="name" placeholder="Sarah Mitchell" value={formData.name} error={errors.name} onChange={onFieldChange} onBlur={onBlur} />
        <InputField label="Email" field="email" type="email" placeholder="you@agency.com" value={formData.email} error={errors.email} onChange={onFieldChange} onBlur={onBlur} />

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#1E2849]/60 mb-2 uppercase tracking-[0.1em]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => onFieldChange("password", e.target.value)}
              onBlur={() => onBlur("password")}
              placeholder="8+ characters"
              className={`
                w-full px-3.5 py-3 pr-11 rounded-lg bg-white text-[15px] text-[#1E2849] placeholder-[#1E2849]/20 outline-none transition-all
                ${errors.password
                  ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                  : "ring-1 ring-[#af8f5b]/20 focus:ring-[#af8f5b]/40"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2849]/40 hover:text-[#1E2849]/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-0.5 bg-[#1E2849]/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[11px] text-[#1E2849]/50 font-bold">{passwordStrength.label}</span>
            </div>
          )}
          {errors.password && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-red-400/80 mt-1.5">
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-xs font-bold text-[#1E2849]/60 mb-2 uppercase tracking-[0.1em]">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
              onBlur={() => onBlur("confirmPassword")}
              placeholder="Re-enter password"
              className={`
                w-full px-3.5 py-3 pr-11 rounded-lg bg-white text-[15px] text-[#1E2849] placeholder-[#1E2849]/20 outline-none transition-all
                ${errors.confirmPassword
                  ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                  : "ring-1 ring-[#af8f5b]/20 focus:ring-[#af8f5b]/40"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2849]/40 hover:text-[#1E2849]/60 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-red-400/80 mt-1.5">
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Nav */}
      <motion.div className="flex items-center justify-center gap-3" variants={fadeIn} initial="hidden" animate="visible" custom={2}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm text-[#1E2849]/50 hover:text-[#1E2849] font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-2.5 px-10 py-4 bg-[#1b2034] text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full transition-all hover:bg-[#af8f5b] active:scale-[0.97]"
        >
          Continue
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  )
}

// ─── Step 3 ─────────────────────────────────────────────────────────────────

function Step3({
  quantity,
  pricePerStudent,
  total,
  savings,
  savingsPercent,
  agencyName,
  isProcessing,
  onBack,
  onCheckout,
}: {
  quantity: number
  pricePerStudent: number
  total: number
  savings: number
  savingsPercent: number
  agencyName: string
  isProcessing: boolean
  onBack: () => void
  onCheckout: () => void
}) {
  return (
    <div className="space-y-10">
      <motion.div className="text-center" variants={fadeIn} initial="hidden" animate="visible" custom={0}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-4">Step 3</p>
        <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Review & <span className="text-[#af8f5b]">pay</span>
        </h1>
        <p className="text-sm text-[#1E2849]/60 font-bold uppercase tracking-[0.1em]">
          Confirm your order details.
        </p>
      </motion.div>

      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
        <div className="space-y-0 rounded-xl p-6 border border-[#af8f5b]/20" style={{ backgroundColor: "#1b2034" }}>
          <div className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-sm text-white/50 font-bold uppercase tracking-[0.1em]">Agency</span>
            <span className="text-sm font-bold text-white">{agencyName}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-sm text-white/50 font-bold uppercase tracking-[0.1em]">Licenses</span>
            <span className="text-sm font-bold text-white">{quantity}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-sm text-white/50 font-bold uppercase tracking-[0.1em]">Per student</span>
            <span className="text-sm font-bold text-[#af8f5b]">{formatCurrency(pricePerStudent)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center py-4 border-b border-white/10">
              <span className="text-sm text-white/50 font-bold uppercase tracking-[0.1em]">Discount</span>
              <span className="text-sm font-bold text-[#af8f5b]">
                -{formatCurrency(savings)} ({savingsPercent}%)
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-5">
            <span className="text-base font-bold text-white uppercase tracking-[0.1em]">Total</span>
            <motion.span
              key={total}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold tracking-tight text-[#af8f5b]"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
            >
              {formatCurrency(total)}
            </motion.span>
          </div>
        </div>

        {/* Checkout */}
        <button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full mt-6 flex items-center justify-center gap-2.5 py-4 bg-[#1b2034] hover:bg-[#af8f5b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full transition-all active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay {formatCurrency(total)}
            </>
          )}
        </button>

        {/* Trust */}
        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-[#1E2849] font-bold uppercase tracking-[0.1em]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#af8f5b]" />
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#af8f5b]" />
            Secure
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3 h-3 text-[#af8f5b]" />
            Stripe
          </span>
        </div>

        <p className="text-center text-xs text-[#af8f5b] font-bold uppercase tracking-[0.1em] mt-3">
          30-day money-back guarantee
        </p>
      </motion.div>

      {/* Back */}
      <motion.div className="flex justify-center" variants={fadeIn} initial="hidden" animate="visible" custom={2}>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm text-[#1E2849]/50 hover:text-[#1E2849] font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.97] disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </motion.div>
    </div>
  )
}
