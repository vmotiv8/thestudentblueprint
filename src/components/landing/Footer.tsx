// src/components/landing/Footer.tsx
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="py-16 sm:py-20 px-6 border-t border-[#af8f5b]/20" style={{ backgroundColor: "#1b2034" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="font-bold text-white">TheStudent</span><span className="font-semibold text-[#af8f5b]">Blueprint</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <a href="/faq" className="text-xs text-white/40 hover:text-white/60 transition-colors tracking-[0.15em] uppercase font-bold">
              FAQ
            </a>
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors tracking-[0.15em] uppercase font-bold">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors tracking-[0.15em] uppercase font-bold">
              Terms & Conditions
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="text-xs text-white/35 tracking-[0.15em] uppercase font-bold">
              &copy; {new Date().getFullYear()} The Student Blueprint
            </div>
            <div className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium">
              Powered by VMotiv8
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
