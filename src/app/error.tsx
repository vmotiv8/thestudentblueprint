/* eslint-disable @next/next/no-html-link-for-pages */
"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError] Client-side exception caught:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    })
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          An unexpected error occurred. This has been logged automatically.
          Please try again or contact support if the issue persists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-white text-[#0a0a0a] font-medium text-sm rounded-full hover:bg-white/90 transition-all"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-2.5 text-white/60 text-sm rounded-full hover:text-white transition-all"
          >
            Go home
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-400/70 bg-white/[0.03] rounded-lg p-4 overflow-auto max-h-60">
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
