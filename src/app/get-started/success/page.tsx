"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function GetStartedSuccess() {
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    // Brief delay then mark as verified — the session cookie was already set during signup
    const timer = setTimeout(() => setVerified(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#FFFAF0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#af8f5b]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFAF0] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#af8f5b]/10 border border-[#af8f5b]/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-[#af8f5b]" />
        </motion.div>

        <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-4">Success</p>
        <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-4" />
        <h1
          className="text-4xl sm:text-5xl font-bold text-[#1E2849] uppercase mb-4"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
        >
          You&apos;re All <span className="text-[#af8f5b]">Set!</span>
        </h1>

        <p className="text-sm text-[#1E2849] font-bold uppercase tracking-[0.1em] mb-4">
          Your agency account has been created and your licenses are active.
        </p>

        <p className="text-sm text-[#1E2849]/50 font-medium mb-10">
          Let&apos;s set up your branding and invite your first student.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agency/onboarding">
            <Button className="bg-[#1b2034] hover:bg-[#af8f5b] text-white font-bold px-8 py-6 text-sm uppercase tracking-[0.15em] rounded-full">
              Set Up Your Agency
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/agency">
            <Button variant="outline" className="border-[#1E2849] text-[#1E2849] hover:bg-[#1E2849] hover:text-white font-bold px-8 py-6 text-sm uppercase tracking-[0.15em] rounded-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
