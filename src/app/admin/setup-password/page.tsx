"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, CheckCircle2, XCircle, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

function SetupPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [email, setEmail] = useState("")
  const [orgName, setOrgName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setLoading(false)
      setError("No setup token provided")
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/admin/setup-password?token=${token}`)
      const data = await response.json()

      if (data.valid) {
        setIsValid(true)
        setEmail(data.email)
        setOrgName(data.organizationName || "")
      } else {
        setError(data.error || "Invalid or expired token")
      }
    } catch {
      setError("Failed to validate token")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsComplete(true)
        toast.success("Password set successfully!")
      } else {
        toast.error(data.error || "Failed to set password")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return { score: 0, label: "", color: "" }
    if (password.length < 6) return { score: 1, label: "Weak", color: "bg-red-500" }
    if (password.length < 8) return { score: 2, label: "Fair", color: "bg-yellow-500" }
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { score: 3, label: "Good", color: "bg-blue-500" }
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return { score: 4, label: "Strong", color: "bg-green-500" }
    return { score: 2, label: "Fair", color: "bg-yellow-500" }
  }

  const strength = passwordStrength()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-[#e5e0d5] shadow-2xl">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a192f] mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                You're All Set!
              </h2>
              <p className="text-[#5a7a9a] mb-8">
                Your password has been created successfully. You can now log in to your Agency Dashboard.
              </p>
              <Button
                onClick={() => router.push("/admin/login")}
                className="w-full bg-[#0a192f] hover:bg-[#152a45] h-12"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-[#e5e0d5] shadow-2xl">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a192f] mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Invalid Link
              </h2>
              <p className="text-[#5a7a9a] mb-8">
                {error || "This password setup link is invalid or has expired. Please contact support for a new invitation."}
              </p>
              <Button
                onClick={() => router.push("/admin/login")}
                variant="outline"
                className="w-full border-[#e5e0d5] h-12"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <Image src="/logo.png" alt="The Student Blueprint" width={48} height={48} className="object-contain" />
            <span className="text-2xl font-bold text-[#0a192f]" style={{ fontFamily: "'Oswald', sans-serif" }}>
              The Student Blueprint
            </span>
          </Link>
        </div>

        <Card className="border-[#e5e0d5] shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a192f] to-[#1e3a5f] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-[#c9a227]" />
            </div>
            <CardTitle className="text-2xl text-[#0a192f]" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Set Up Your Password
            </CardTitle>
            <CardDescription className="text-[#5a7a9a]">
              {orgName ? `Welcome to ${orgName}!` : "Create your admin password to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[#0a192f] font-medium">Email</Label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-[#faf8f3] border-[#e5e0d5] text-[#5a7a9a]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#0a192f] font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 border-[#e5e0d5] h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7a9a] hover:text-[#0a192f]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength.score >= 3 ? "text-green-600" : strength.score >= 2 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[#0a192f] font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 border-[#e5e0d5] h-12"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 8 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || password.length < 8 || password !== confirmPassword}
                className="w-full bg-[#0a192f] hover:bg-[#152a45] h-12 text-base font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-[#5a7a9a] mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  )
}
