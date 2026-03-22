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
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ─── Pricing Logic ──────────────────────────────────────────────────────────

const PRICING_TIERS = [
  { min: 1, max: 9, price: 350, label: "1–9" },
  { min: 10, max: 24, price: 300, label: "10–24" },
  { min: 25, max: 49, price: 250, label: "25–49" },
  { min: 50, max: 99, price: 200, label: "50–99", popular: true },
  { min: 100, max: 999, price: 150, label: "100–999" },
  { min: 1000, max: Infinity, price: 100, label: "1000+" },
]

function getPricePerStudent(qty: number): number {
  if (qty >= 1000) return 100
  if (qty >= 100) return 150
  if (qty >= 50) return 200
  if (qty >= 25) return 250
  if (qty >= 10) return 300
  return 350
}

function getSavingsPercent(qty: number): number {
  const price = getPricePerStudent(qty)
  return Math.round((1 - price / 350) * 100)
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
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
}

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: any) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (i || 0) * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
  const savings = quantity * 350 - total
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
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Something went wrong. Please try again.")
        setIsProcessing(false)
      }
    } catch {
      alert("Something went wrong. Please try again.")
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

  // ─── Quantity Slider ────────────────────────────────────────────────────

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseInt(e.target.value)
    // Non-linear mapping for better UX: slider 0-100 maps to quantity 1-1500
    const qty = Math.round(1 + (raw / 100) ** 2 * 1499)
    setQuantity(Math.max(1, Math.min(1500, qty)))
  }

  function sliderValue(): number {
    // Inverse of the mapping above
    return Math.round(Math.sqrt((quantity - 1) / 1499) * 100)
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
            <span
              className="font-bold text-lg text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Student Blueprint
            </span>
          </Link>
          <Link
            href="/admin/login"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Already have an account? <span className="text-[#c9a227]">Login</span>
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (s < step) {
                      setDirection(-1)
                      setStep(s)
                    }
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${
                      s === step
                        ? "bg-[#c9a227] text-[#0a0a0a] shadow-lg shadow-[#c9a227]/25"
                        : s < step
                          ? "bg-[#c9a227]/20 text-[#c9a227] cursor-pointer hover:bg-[#c9a227]/30"
                          : "bg-white/[0.06] text-white/30"
                    }
                  `}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </button>
                {s < 3 && (
                  <div className="w-16 sm:w-24 h-px bg-white/[0.08] relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[#c9a227]"
                      initial={{ width: "0%" }}
                      animate={{ width: s < step ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-white/40 mb-10">
            Step {step} of 3
          </p>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
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
              <motion.div
                key="step2"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
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
              <motion.div
                key="step3"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
              >
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

// ─── Step 1: Choose Your Plan ───────────────────────────────────────────────

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
    <div className="space-y-10">
      {/* Header */}
      <motion.div className="text-center" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Choose Your Plan
        </h1>
        <p className="text-lg text-white/50 max-w-xl mx-auto">
          Purchase student assessment licenses. The more you buy, the more you save.
        </p>
      </motion.div>

      {/* Quantity Selector */}
      <motion.div
        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/60 uppercase tracking-wider">
            Number of Licenses
          </label>
          {savingsPercent > 0 && (
            <motion.span
              key={savingsPercent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              Save {savingsPercent}%
            </motion.span>
          )}
        </div>

        {/* Quantity Input with +/- */}
        <div className="flex items-center justify-center gap-4 my-8">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15] transition-all active:scale-95"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={2000}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v >= 1) setQuantity(Math.min(2000, v))
              }}
              className="w-32 sm:w-40 text-center text-5xl sm:text-6xl font-bold bg-transparent border-none outline-none text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <div className="text-center text-sm text-white/40 mt-1">licenses</div>
          </div>
          <button
            onClick={() => setQuantity(Math.min(2000, quantity + 1))}
            className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15] transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue()}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
              bg-white/[0.08]
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#c9a227]
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-[#c9a227]/30
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#c9a227]
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:cursor-pointer
            "
            style={{
              background: `linear-gradient(to right, #c9a227 0%, #c9a227 ${sliderValue()}%, rgba(255,255,255,0.08) ${sliderValue()}%, rgba(255,255,255,0.08) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white/30 mt-2">
            <span>1</span>
            <span>250</span>
            <span>500</span>
            <span>1000+</span>
          </div>
        </div>

        {/* Live Pricing Summary */}
        <motion.div
          className="mt-8 pt-8 border-t border-white/[0.06]"
          layout
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-white/40 mb-1">Per Student</div>
              <motion.div
                key={pricePerStudent}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-[#c9a227]"
              >
                {formatCurrency(pricePerStudent)}
              </motion.div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-1">Quantity</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{quantity}</div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-1">Total</div>
              <motion.div
                key={total}
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-white"
              >
                {formatCurrency(total)}
              </motion.div>
            </div>
          </div>
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4"
            >
              <span className="text-emerald-400 font-medium">
                You save {formatCurrency(savings)} ({savingsPercent}%)
              </span>
              <span className="text-white/30 ml-2">vs. individual pricing</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Pricing Tiers */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider text-center mb-5">
          Volume Pricing Tiers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRICING_TIERS.map((tier, i) => {
            const isActive = i === activeTier
            return (
              <motion.button
                key={tier.label}
                onClick={() => setQuantity(tier.min)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer
                  ${
                    isActive
                      ? "bg-[#c9a227]/10 border-[#c9a227]/60 shadow-lg shadow-[#c9a227]/10"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#c9a227] text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`text-xs mb-1 ${isActive ? "text-[#c9a227]" : "text-white/40"}`}>
                  {tier.label} licenses
                </div>
                <div className={`text-xl font-bold ${isActive ? "text-[#c9a227]" : "text-white"}`}>
                  ${tier.price}
                </div>
                <div className="text-xs text-white/30">/student</div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div className="flex justify-center" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
        <button
          onClick={onNext}
          className="group flex items-center gap-3 px-10 py-4 bg-[#c9a227] hover:bg-[#d4ad2e] text-[#0a0a0a] font-semibold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-[#c9a227]/20 active:scale-[0.98]"
        >
          Continue
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  )
}

// ─── Step 2: Create Your Account ────────────────────────────────────────────

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
  function InputField({
    label,
    field,
    type = "text",
    placeholder,
    prefix,
    suffix,
    note,
  }: {
    label: string
    field: string
    type?: string
    placeholder?: string
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    note?: string
  }) {
    const val = formData[field as keyof typeof formData]
    const err = errors[field]
    return (
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{prefix}</span>
          )}
          <input
            type={type}
            value={val}
            onChange={(e) => onFieldChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border text-white placeholder-white/20 outline-none transition-all
              ${prefix ? "pl-[140px]" : ""}
              ${
                err
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/[0.08] focus:border-[#c9a227]/50 focus:bg-white/[0.06]"
              }
            `}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
          )}
        </div>
        {note && !err && <p className="text-xs text-white/30 mt-1.5">{note}</p>}
        {err && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-1.5"
          >
            {err}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div className="text-center" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Create Your Account
        </h1>
        <p className="text-lg text-white/50">
          Set up your agency profile to get started.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10 space-y-6 max-w-lg mx-auto"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <InputField label="Agency Name" field="agencyName" placeholder="e.g. Apex Admissions Group" />
        <InputField
          label="URL Slug"
          field="slug"
          placeholder="apex-admissions-group"
          prefix="thestudentblueprint.com/"
          note="This will be your agency's unique URL."
        />

        <div className="pt-2 border-t border-white/[0.06]" />

        <InputField label="Your Name" field="name" placeholder="e.g. Sarah Mitchell" />
        <InputField label="Email Address" field="email" type="email" placeholder="you@agency.com" />

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => onFieldChange("password", e.target.value)}
              onBlur={() => onBlur("password")}
              placeholder="Minimum 8 characters"
              className={`
                w-full px-4 py-3.5 pr-12 rounded-xl bg-white/[0.04] border text-white placeholder-white/20 outline-none transition-all
                ${
                  errors.password
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-[#c9a227]/50 focus:bg-white/[0.06]"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">{passwordStrength.label}</p>
            </div>
          )}
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 mt-1.5"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
              onBlur={() => onBlur("confirmPassword")}
              placeholder="Re-enter your password"
              className={`
                w-full px-4 py-3.5 pr-12 rounded-xl bg-white/[0.04] border text-white placeholder-white/20 outline-none transition-all
                ${
                  errors.confirmPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-[#c9a227]/50 focus:bg-white/[0.06]"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 mt-1.5"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div className="flex items-center justify-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-3 px-10 py-3.5 bg-[#c9a227] hover:bg-[#d4ad2e] text-[#0a0a0a] font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#c9a227]/20 active:scale-[0.98]"
        >
          Continue
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  )
}

// ─── Step 3: Payment ────────────────────────────────────────────────────────

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
      {/* Header */}
      <motion.div className="text-center" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Complete Your Purchase
        </h1>
        <p className="text-lg text-white/50">
          Review your order and proceed to secure checkout.
        </p>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10 max-w-lg mx-auto"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#c9a227]" />
          Order Summary
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
            <span className="text-white/50">Agency</span>
            <span className="font-medium">{agencyName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
            <span className="text-white/50">Student Licenses</span>
            <span className="font-medium">{quantity}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
            <span className="text-white/50">Price per Student</span>
            <span className="font-medium text-[#c9a227]">{formatCurrency(pricePerStudent)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
              <span className="text-white/50">Volume Discount</span>
              <span className="font-medium text-emerald-400">
                -{formatCurrency(savings)} ({savingsPercent}%)
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-semibold">Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-white"
            >
              {formatCurrency(total)}
            </motion.span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full mt-8 flex items-center justify-center gap-3 px-8 py-4 bg-[#c9a227] hover:bg-[#d4ad2e] disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-[#c9a227]/20 active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Complete Purchase — {formatCurrency(total)}
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Powered by Stripe
          </span>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          30-day money-back guarantee. Cancel anytime within the first 30 days for a full refund.
        </p>
      </motion.div>

      {/* Back Button */}
      <motion.div className="flex justify-center" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </motion.div>
    </div>
  )
}
