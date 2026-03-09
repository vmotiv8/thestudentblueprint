"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ece3]">
      <nav className="bg-[#faf8f3]/90 backdrop-blur-md border-b border-[#e5e0d5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#c9a227]" />
            </div>
<span className="font-bold text-xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Student Blueprint
              </span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-[#e5e0d5] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <XCircle className="w-12 h-12 text-amber-500" />
              </motion.div>
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Payment Cancelled
              </h1>
              <p className="text-white/90">Your payment was not processed</p>
            </div>

            <CardContent className="p-8 text-center">
              <p className="text-[#5a7a9a] mb-8">
                No worries! Your payment was cancelled and you haven&apos;t been charged.
                If you changed your mind or encountered an issue, you can try again anytime.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="border-[#e5e0d5] text-[#1e3a5f]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#1e3a5f]">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
