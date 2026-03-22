"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AgencySettingsContent } from "@/components/agency/AgencySettings"

export default function AgencySettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    }>
      <AgencySettingsContent />
    </Suspense>
  )
}
