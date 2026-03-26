"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Results page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1
          className="text-2xl font-bold text-[#0a192f] mb-3"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
        >
          Something went wrong
        </h1>

        <p className="text-[#5a7a9a] mb-8 leading-relaxed">
          We encountered an error loading your assessment results. This may be a
          temporary issue. Please try again or contact support if the problem
          persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-[#5a7a9a]/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
