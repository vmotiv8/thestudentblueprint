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
    const qty = Math.round(1 + (raw / 100) ** 2 * 1499)
    setQuantity(Math.max(1, Math.min(1500, qty)))
  }

  function sliderValue(): number {
    return Math.round(Math.sqrt((quantity - 1) / 1499) * 100)
  }

  const stepLabels = ["Plan", "Account", "Payment"]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
            <span className="font-semibold text-[15px] text-white/90 tracking-tight">
              The Student Blueprint
            </span>
          </Link>
          <Link
            href="/admin/login"
            className="text-[13px] text-white/60 hover:text-white/70 transition-colors"
          >
            Sign in
          </Link>
        </div>
        <div className="h-px bg-white/[0.06]" />
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
                    relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-500
                    ${s === step
                      ? "bg-white text-[#0a0a0a]"
                      : s < step
                        ? "bg-white/90 text-[#0a0a0a] cursor-pointer"
                        : "bg-white/[0.08] text-white/60"
                    }
                  `}
                >
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </button>
                <span className={`ml-2 text-xs font-medium tracking-wide ${s === step ? "text-white/70" : s < step ? "text-white/60" : "text-white/60"} ${s < 3 ? "mr-8" : ""}`}>
                  {stepLabels[s - 1]}
                </span>
                {s < 3 && (
                  <div className="w-12 h-px bg-white/[0.08] mr-4">
                    <motion.div
                      className="h-full bg-white/40"
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
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Choose your plan
        </h1>
        <p className="text-[15px] text-white/60 leading-relaxed">
          Select the number of student licenses for your agency.<br />
          Resell to your clients at any price you set — you keep the margin.
        </p>
      </motion.div>

      {/* Quantity */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <input
              type="number"
              min={1}
              max={2000}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v >= 1) setQuantity(Math.min(2000, v))
              }}
              className="w-24 text-center text-5xl font-semibold bg-transparent border-none outline-none text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] tracking-tight"
            />
            <div className="text-[13px] text-white/60 mt-0.5">licenses</div>
          </div>
          <button
            onClick={() => setQuantity(Math.min(2000, quantity + 1))}
            className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all active:scale-95"
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
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(255,255,255,0.1)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_0_6px_rgba(255,255,255,0.15)]
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:cursor-pointer
            "
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${sliderValue()}%, rgba(255,255,255,0.06) ${sliderValue()}%, rgba(255,255,255,0.06) 100%)`,
            }}
          />
        </div>
      </motion.div>

      {/* Pricing Summary */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={2}>
        <div className="grid grid-cols-3 text-center">
          <div>
            <div className="text-[13px] text-white/60 mb-1">Per student</div>
            <motion.div
              key={pricePerStudent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold tracking-tight"
            >
              {formatCurrency(pricePerStudent)}
            </motion.div>
          </div>
          <div>
            <div className="text-[13px] text-white/60 mb-1">Quantity</div>
            <div className="text-2xl font-semibold tracking-tight">{quantity}</div>
          </div>
          <div>
            <div className="text-[13px] text-white/60 mb-1">Total</div>
            <motion.div
              key={total}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold tracking-tight"
            >
              {formatCurrency(total)}
            </motion.div>
          </div>
        </div>
        {savings > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[13px] text-emerald-400/80 mt-4"
          >
            You save {formatCurrency(savings)} ({savingsPercent}%)
          </motion.p>
        )}
      </motion.div>

      {/* Tiers */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={3}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRICING_TIERS.map((tier, i) => {
            const isActive = i === activeTier
            return (
              <button
                key={tier.label}
                onClick={() => setQuantity(tier.min)}
                className={`
                  relative py-3 px-2 rounded-lg text-center transition-all duration-300
                  ${isActive
                    ? "bg-white/[0.1] ring-1 ring-white/20"
                    : "bg-white/[0.03] hover:bg-white/[0.06]"
                  }
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-px text-[9px] font-semibold uppercase tracking-wider bg-white text-[#0a0a0a] rounded-full whitespace-nowrap">
                    Popular
                  </div>
                )}
                <div className={`text-[11px] mb-0.5 ${isActive ? "text-white/60" : "text-white/60"}`}>
                  {tier.label}
                </div>
                <div className={`text-base font-semibold ${isActive ? "text-white" : "text-white/60"}`}>
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
          className="group flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#0a0a0a] font-medium text-[15px] rounded-full transition-all hover:bg-white/90 active:scale-[0.97]"
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
      <label className="block text-[13px] font-medium text-white/60 mb-2">{label}</label>
      {prefix ? (
        <div className={`flex items-center rounded-lg bg-white/[0.05] transition-all ${error ? "ring-1 ring-red-500/40 focus-within:ring-red-500/60" : "ring-1 ring-white/[0.06] focus-within:ring-white/20"}`}>
          <span className="shrink-0 pl-3.5 pr-1 text-white/60 text-[13px] select-none">{prefix}</span>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            placeholder={placeholder}
            className="flex-1 px-1 py-3 bg-transparent text-[15px] text-white placeholder-white/20 outline-none"
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
              w-full px-3.5 py-3 rounded-lg bg-white/[0.05] text-[15px] text-white placeholder-white/20 outline-none transition-all
              ${error
                ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                : "ring-1 ring-white/[0.06] focus:ring-white/20"
              }
            `}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
          )}
        </div>
      )}
      {note && !error && <p className="text-[12px] text-white/60 mt-1.5">{note}</p>}
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
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Create your account
        </h1>
        <p className="text-[15px] text-white/60">
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

        <div className="h-px bg-white/[0.04] my-2" />

        <InputField label="Full name" field="name" placeholder="Sarah Mitchell" value={formData.name} error={errors.name} onChange={onFieldChange} onBlur={onBlur} />
        <InputField label="Email" field="email" type="email" placeholder="you@agency.com" value={formData.email} error={errors.email} onChange={onFieldChange} onBlur={onBlur} />

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-white/60 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => onFieldChange("password", e.target.value)}
              onBlur={() => onBlur("password")}
              placeholder="8+ characters"
              className={`
                w-full px-3.5 py-3 pr-11 rounded-lg bg-white/[0.05] text-[15px] text-white placeholder-white/20 outline-none transition-all
                ${errors.password
                  ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                  : "ring-1 ring-white/[0.06] focus:ring-white/20"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[11px] text-white/60">{passwordStrength.label}</span>
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
          <label className="block text-[13px] font-medium text-white/60 mb-2">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
              onBlur={() => onBlur("confirmPassword")}
              placeholder="Re-enter password"
              className={`
                w-full px-3.5 py-3 pr-11 rounded-lg bg-white/[0.05] text-[15px] text-white placeholder-white/20 outline-none transition-all
                ${errors.confirmPassword
                  ? "ring-1 ring-red-500/40 focus:ring-red-500/60"
                  : "ring-1 ring-white/[0.06] focus:ring-white/20"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/60 transition-colors"
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
          className="flex items-center gap-2 px-6 py-3 rounded-full text-[15px] text-white/60 hover:text-white transition-all active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-2.5 px-8 py-3 bg-white text-[#0a0a0a] font-medium text-[15px] rounded-full transition-all hover:bg-white/90 active:scale-[0.97]"
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
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Review & pay
        </h1>
        <p className="text-[15px] text-white/60">
          Confirm your order details.
        </p>
      </motion.div>

      <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
        <div className="space-y-0">
          <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
            <span className="text-[15px] text-white/60">Agency</span>
            <span className="text-[15px] font-medium">{agencyName}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
            <span className="text-[15px] text-white/60">Licenses</span>
            <span className="text-[15px] font-medium">{quantity}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
            <span className="text-[15px] text-white/60">Per student</span>
            <span className="text-[15px] font-medium">{formatCurrency(pricePerStudent)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
              <span className="text-[15px] text-white/60">Discount</span>
              <span className="text-[15px] font-medium text-emerald-400">
                -{formatCurrency(savings)} ({savingsPercent}%)
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-5">
            <span className="text-[17px] font-medium">Total</span>
            <motion.span
              key={total}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold tracking-tight"
            >
              {formatCurrency(total)}
            </motion.span>
          </div>
        </div>

        {/* Checkout */}
        <button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full mt-6 flex items-center justify-center gap-2.5 py-3.5 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-medium text-[15px] rounded-full transition-all active:scale-[0.98]"
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
        <div className="mt-5 flex items-center justify-center gap-5 text-[12px] text-white/60">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Secure
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3 h-3" />
            Stripe
          </span>
        </div>

        <p className="text-center text-[12px] text-white/60 mt-3">
          30-day money-back guarantee
        </p>
      </motion.div>

      {/* Back */}
      <motion.div className="flex justify-center" variants={fadeIn} initial="hidden" animate="visible" custom={2}>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-[15px] text-white/60 hover:text-white transition-all active:scale-[0.97] disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </motion.div>
    </div>
  )
}
