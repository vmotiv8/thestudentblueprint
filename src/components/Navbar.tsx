// src/components/Navbar.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface NavbarProps {
  isScrolled: boolean
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isB2B = pathname === "/b2b"

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? "bg-[#FFFAF0]/90 backdrop-blur-2xl py-4 border-b border-[#1E2849]/5" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-700 group-hover:rotate-[360deg]">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold text-[#1E2849]">TheStudent</span><span className="font-semibold text-[#af8f5b]">Blueprint</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <Link href={isB2B ? "/" : "/b2b"} className="text-[#1E2849]/60 hover:text-[#1E2849] text-xs font-medium tracking-[0.2em] uppercase transition-colors">
            {isB2B ? "For Families" : "B2B Self-Service"}
          </Link>
          <Link href="/login" className="text-[#1E2849]/60 hover:text-[#1E2849] text-xs font-medium tracking-[0.2em] uppercase transition-colors">
            Login
          </Link>
          <Link href="/resume" className="text-[#1E2849]/60 hover:text-[#1E2849] text-xs font-medium tracking-[0.2em] uppercase transition-colors">
            Resume
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <Button asChild className="hidden sm:inline-flex bg-[#1E2849] hover:bg-[#1E2849]/90 text-white font-semibold text-xs px-6 py-3 h-auto rounded-full transition-all duration-500 tracking-wide">
            <Link href="/checkout">
              Start Assessment
            </Link>
          </Button>
          <button
            className="lg:hidden text-[#1E2849] p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-[#FFFAF0]/98 backdrop-blur-2xl border-b border-[#1E2849]/5 py-8 px-6 shadow-2xl z-50"
          >
            <div className="flex flex-col gap-6">
              <div className="h-px bg-[#1E2849]/10 my-2" />
              <Link
                href={isB2B ? "/" : "/b2b"}
                className="text-[#1E2849]/70 hover:text-[#af8f5b] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isB2B ? "For Families" : "B2B Self-Service"}
              </Link>
              <Link
                href="/login"
                className="text-[#1E2849]/70 hover:text-[#af8f5b] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/resume"
                className="text-[#1E2849]/70 hover:text-[#af8f5b] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resume
              </Link>
              <Button asChild className="w-full bg-[#1E2849] text-white font-semibold py-4 rounded-full uppercase tracking-[0.15em]">
                <Link href="/checkout" onClick={() => setIsMobileMenuOpen(false)}>
                  Start Assessment
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
