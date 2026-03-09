"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AgencySignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/login")
  }, [router])

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
        <p className="text-sm text-[#0a192f]/50 tracking-widest uppercase">
          Redirecting to login...
        </p>
      </div>
    </div>
  )
}
