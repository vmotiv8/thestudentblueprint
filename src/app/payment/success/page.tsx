"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id")
      
      if (sessionId) {
        localStorage.setItem("studentblueprint_payment_session", sessionId)
        
        try {
          const response = await fetch(`/api/payment/verify?session_id=${sessionId}`)
          const data = await response.json()
          
          if (data.paid && data.email) {
            localStorage.setItem("studentblueprint_paid_email", data.email)
            setEmail(data.email)
          }
        } catch (e) {
          console.error("Error verifying payment:", e)
        }
        
        setVerified(true)
        setIsVerifying(false)
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1e3a5f", "#c9a227", "#10b981"],
        })
      } else {
        setIsVerifying(false)
      }
    }
    
    verifyPayment()
  }, [searchParams])

  const handleStartAssessment = () => {
    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      router.push(`/assessment?session_id=${sessionId}`)
    } else {
      router.push("/assessment")
    }
  }

  if (isVerifying) {
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
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#c9a227]" />
            </div>
<span className="font-bold text-xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                VMotiv8 Business
              </span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-[#e5e0d5] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Payment Successful!
              </h1>
              <p className="text-white/90">Thank you for your purchase</p>
            </div>

            <CardContent className="p-8 text-center">
              {verified ? (
                <>
                  <p className="text-[#5a7a9a] mb-8">
                    Your payment has been confirmed. You now have full access to the VMotiv8 Business Student Assessment.
                    Get ready to discover your personalized college success roadmap!
                  </p>

                  <Button
                    onClick={handleStartAssessment}
                    className="bg-[#1e3a5f] hover:bg-[#152a45] text-white h-12 px-8"
                  >
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-[#5a7a9a] mb-8">
                    We couldn&apos;t verify your payment session. If you believe this is an error,
                    please contact support.
                  </p>
                  <Link href="/checkout">
                    <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                      Try Again
                    </Button>
                  </Link>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a5f]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}