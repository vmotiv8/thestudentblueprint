"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Key } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ResumePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")

  const handleSendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("OTP sent to your email! Please check your inbox.")
        setOtpSent(true)
        setCurrentEmail(email)
      } else {
        toast.error(data.error || "Failed to send OTP")
      }
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, otp })
      })

      const data = await response.json()

      if (data.success) {
        if (data.assessment.is_completed) {
          toast.success("Verified! Redirecting to your results...")
          router.push(`/results/${data.assessment.id}`)
        } else {
          sessionStorage.setItem("resumeAssessment", JSON.stringify(data))
          
          if (data.hasPaid) {
            localStorage.setItem("studentblueprint_paid_email", data.student.email)
            toast.success("Verified! Continuing where you left off...")
            router.push(`/assessment?resume=${data.assessment.id}`)
          } else {
            toast.info("Please complete payment to continue your assessment")
            localStorage.setItem("studentblueprint_resume_email", data.student.email)
            router.push("/checkout")
          }
        }
      } else {
        toast.error(data.error || "Invalid OTP")
      }
    } catch (error) {
      toast.error("Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResume = async (type: "code") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/assessment/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (data.success) {
        if (data.assessment.is_completed) {
          toast.success("Assessment found! Redirecting to your results...")
          router.push(`/results/${data.assessment.id}`)
        } else {
          sessionStorage.setItem("resumeAssessment", JSON.stringify(data))
          
          if (data.hasPaid) {
            localStorage.setItem("studentblueprint_paid_email", data.student.email)
            toast.success("Assessment found! Continuing where you left off...")
            router.push(`/assessment?resume=${data.assessment.id}`)
          } else {
            toast.info("Please complete payment to continue your assessment")
            localStorage.setItem("studentblueprint_resume_email", data.student.email)
            router.push("/checkout")
          }
        }
      } else {
        toast.error(data.error || "No assessment found")
      }
    } catch (error) {
      toast.error("Failed to find assessment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <nav className="bg-[#faf8f3]/90 backdrop-blur-md border-b border-[#e5e0d5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image src="/logo.png" alt="TheStudentBlueprint Logo" fill className="object-contain group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>TheStudentBlueprint</span>
          </Link>
          <Link href="/checkout">
            <Button className="bg-[#c9a227] hover:bg-white hover:text-[#1e3a5f] text-[#1e3a5f] font-bold text-[10px] sm:text-sm px-4 sm:px-6 h-9 sm:h-10 border border-[#c9a227] transition-all duration-300">
              Start New <span className="hidden xs:inline ml-1">Assessment</span>
            </Button>
          </Link>
        </div>
      </nav>

      <main className="py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Resume Your Assessment
            </h1>
            <p className="text-[#5a7a9a]">
              Enter your email or assessment code to continue where you left off.
            </p>
          </div>

          <Card className="border-[#e5e0d5]">
            <CardContent className="pt-6">
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email">By Email</TabsTrigger>
                  <TabsTrigger value="code">By Code</TabsTrigger>
                </TabsList>
                
                  <TabsContent value="email" className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-[#5a7a9a]">
                            We'll send a one-time code to verify your identity
                          </p>
                        </div>
                        <Button
                          onClick={handleSendOTP}
                          disabled={!email || isLoading}
                          className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Login Code"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="otp">Enter 6-Digit Code</Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                            <Input
                              id="otp"
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="pl-10 font-mono tracking-widest text-lg text-center"
                              maxLength={6}
                            />
                          </div>
                          <p className="text-xs text-[#5a7a9a]">
                            Sent to {currentEmail}
                          </p>
                        </div>
                        <Button
                          onClick={handleVerifyOTP}
                          disabled={otp.length !== 6 || isLoading}
                          className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Continue"
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setOtpSent(false)
                            setOtp("")
                          }}
                          variant="ghost"
                          className="w-full text-[#5a7a9a]"
                        >
                          Use a different email
                        </Button>
                      </>
                    )}
                  </TabsContent>
                
                <TabsContent value="code" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Assessment Code</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="XXXXXXXX"
                        className="pl-10 font-mono tracking-wider"
                        maxLength={8}
                      />
                    </div>
                    <p className="text-xs text-[#5a7a9a]">
                      You can find your 8-character code in the email we sent you.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleResume("code")}
                    disabled={code.length < 8 || isLoading}
                    className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding...
                      </>
                    ) : (
                      "Find My Assessment"
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-[#5a7a9a] text-sm">
              Don't have an assessment yet?{" "}
              <Link href="/checkout" className="text-[#c9a227] hover:underline font-medium">
                Start one now
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}