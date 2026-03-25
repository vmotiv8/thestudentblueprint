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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a227]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
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
          className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>

        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          You&apos;re All Set!
        </h1>

        <p className="text-lg text-white/70 mb-4">
          Your agency account has been created and your licenses are active.
        </p>

        <p className="text-sm text-white/50 mb-10">
          Let&apos;s set up your branding and invite your first student.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agency/onboarding">
            <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a0a0a] font-bold px-8 py-6 text-base rounded-full">
              Set Up Your Agency
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/agency">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base rounded-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
