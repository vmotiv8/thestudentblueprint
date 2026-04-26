"use client"

import { useEffect } from "react"

export default function AgencyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[AgencyError] Client-side exception in /agency:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    })
  }, [error])

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-[#0a192f] mb-3">
          Dashboard error
        </h2>
        <p className="text-[#0a192f]/50 text-sm mb-6 leading-relaxed">
          Something went wrong loading your agency dashboard. This has been logged.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#0a192f] text-white font-medium text-sm rounded-full hover:bg-[#0a192f]/90 transition-all"
          >
            Try again
          </button>
          <a
            href="/admin/login"
            className="px-6 py-2.5 text-[#0a192f]/60 text-sm rounded-full hover:text-[#0a192f] transition-all"
          >
            Back to login
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-[#0a192f]/30 cursor-pointer hover:text-[#0a192f]/50">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-600/70 bg-red-50 rounded-lg p-4 overflow-auto max-h-60">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
