# B2C Families Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a B2C families homepage at `/`, move current B2B agency homepage to `/b2b`, and extract a shared navbar component used by both pages.

**Architecture:** The current monolithic `src/app/page.tsx` (1782 lines) contains all data, helper components, and the main page. We will: (1) extract the navbar into a shared component, (2) extract reusable sub-components (TestimonialMarquee, StatCard, ClockTransition, ProductDemo, etc.) into their own files, (3) move the current homepage to `/b2b` importing those shared pieces, (4) create the new B2C homepage at `/` also importing shared pieces plus new B2C-specific sections.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Radix UI, Lucide React icons

**Spec:** `docs/superpowers/specs/2026-03-27-b2c-families-page-design.md`

---

## File Structure

### New files to create:
- `src/components/Navbar.tsx` — Shared navbar with B2B Self-Service, Login, Resume, Start Assessment links
- `src/components/landing/TestimonialMarquee.tsx` — Extracted testimonial marquee component
- `src/components/landing/StatCard.tsx` — Extracted stat card with count-up animation
- `src/components/landing/ClockTransition.tsx` — Extracted clock transition component
- `src/components/landing/ProductDemo.tsx` — Extracted product demo with tabs (all Demo* sub-components)
- `src/components/landing/Footer.tsx` — Extracted footer component
- `src/components/landing/animations.ts` — Shared animation constants (fadeUp, stagger, ease)
- `src/app/b2b/page.tsx` — B2B agency homepage (current homepage content)
- `src/app/page.tsx` — B2C families homepage (new, replaces current)

### Files to modify:
- None — all changes are new files or full rewrites of `src/app/page.tsx`

---

### Task 1: Extract shared animation constants

**Files:**
- Create: `src/components/landing/animations.ts`

- [ ] **Step 1: Create the animations utility file**

```ts
// src/components/landing/animations.ts

export const ease = [0.25, 0.1, 0.25, 1] as const

export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease }
}

export const stagger = (i: number, base = 0.15) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay: i * base, ease }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/animations.ts
git commit -m "feat: extract shared animation constants for landing pages"
```

---

### Task 2: Extract Navbar component

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Create the Navbar component**

This component replicates the existing nav from `src/app/page.tsx` lines 1161-1219 but with updated links per the spec.

```tsx
// src/components/Navbar.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NavbarProps {
  isScrolled: boolean
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <Link href="/b2b" className="text-[#1E2849]/60 hover:text-[#1E2849] text-xs font-medium tracking-[0.2em] uppercase transition-colors">
            B2B Self-Service
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
                href="/b2b"
                className="text-[#1E2849]/70 hover:text-[#af8f5b] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                B2B Self-Service
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: extract shared Navbar component with B2C nav links"
```

---

### Task 3: Extract Footer component

**Files:**
- Create: `src/components/landing/Footer.tsx`

- [ ] **Step 1: Create the Footer component**

Extracted from `src/app/page.tsx` lines 1743-1777.

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/Footer.tsx
git commit -m "feat: extract shared Footer component"
```

---

### Task 4: Extract StatCard, ClockTransition, and TestimonialMarquee

**Files:**
- Create: `src/components/landing/StatCard.tsx`
- Create: `src/components/landing/ClockTransition.tsx`
- Create: `src/components/landing/TestimonialMarquee.tsx`

- [ ] **Step 1: Create StatCard component**

Extracted from `src/app/page.tsx` lines 321-569. Includes the `useCountUp` hook.

```tsx
// src/components/landing/StatCard.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { stagger } from "./animations"

function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState("0")
  const hasRun = useRef(false)

  useEffect(() => {
    if (!inView || hasRun.current) return
    hasRun.current = true

    const numericMatch = target.match(/(\d+)/)
    if (!numericMatch) { setDisplay(target); return }

    const end = parseInt(numericMatch[1])
    const prefix = target.slice(0, target.indexOf(numericMatch[1]))
    const suffix = target.slice(target.indexOf(numericMatch[1]) + numericMatch[1].length)
    const duration = 2000
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * end)
      setDisplay(`${prefix}${current}${suffix}`)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return display
}

export interface Stat {
  number: string
  label: string
  sub: string
}

export default function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const display = useCountUp(stat.number, inView)

  return (
    <motion.div
      ref={ref}
      {...stagger(index, 0.2)}
      className="text-center"
    >
      <div className="border border-[#af8f5b]/40 p-10 sm:p-14 mb-6 aspect-square flex flex-col items-center justify-center">
        <div
          className="text-7xl sm:text-8xl md:text-9xl font-bold text-[#1E2849] mb-4"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
        >
          {display}
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.3em] uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          {stat.label}
        </div>
      </div>
      <div className="text-xs sm:text-sm text-[#1E2849]/70 font-bold tracking-[0.2em] uppercase">
        {stat.sub}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create ClockTransition component**

Extracted from `src/app/page.tsx` lines 994-1079.

```tsx
// src/components/landing/ClockTransition.tsx
"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function ClockTransition() {
  const clockRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<SVGGElement>(null)
  const hourRef = useRef<SVGGElement>(null)

  const { scrollYProgress } = useScroll({
    target: clockRef,
    offset: ["start end", "end start"]
  })

  const clockOpacity = useTransform(scrollYProgress, [0, 0.15, 0.75, 0.95], [0, 1, 1, 0])
  const clockScale = useTransform(scrollYProgress, [0, 0.15, 0.75, 0.95], [0.6, 1, 1, 0.6])

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const minuteDeg = ((v - 0.1) / 0.8) * 720
      const hourDeg = minuteDeg / 12
      if (minuteRef.current) {
        minuteRef.current.setAttribute("transform", `rotate(${minuteDeg} 100 100)`)
      }
      if (hourRef.current) {
        hourRef.current.setAttribute("transform", `rotate(${hourDeg} 100 100)`)
      }
    })
    return unsubscribe
  }, [scrollYProgress])

  return (
    <section ref={clockRef} className="h-[60vh] sm:h-[80vh] flex items-center justify-center bg-[#FFFAF0] overflow-hidden">
      <motion.div
        style={{ opacity: clockOpacity, scale: clockScale }}
        className="flex items-center gap-6 sm:gap-10 md:gap-14"
      >
        <span className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] uppercase text-[#1E2849] select-none" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>TICK</span>
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="95" fill="none" stroke="#1E2849" strokeWidth="2" opacity="0.15" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="#af8f5b" strokeWidth="1" opacity="0.3" />
            {[
              { x1: 100, y1: 15, x2: 100, y2: 26, main: true },
              { x1: 142.5, y1: 24.55, x2: 139, y2: 32.45, main: false },
              { x1: 173.61, y1: 56.7, x2: 167.47, y2: 61.36, main: false },
              { x1: 185, y1: 100, x2: 178, y2: 100, main: true },
              { x1: 173.61, y1: 143.3, x2: 167.47, y2: 138.64, main: false },
              { x1: 142.5, y1: 175.45, x2: 139, y2: 167.55, main: false },
              { x1: 100, y1: 185, x2: 100, y2: 174, main: true },
              { x1: 57.5, y1: 175.45, x2: 61, y2: 167.55, main: false },
              { x1: 26.39, y1: 143.3, x2: 32.53, y2: 138.64, main: false },
              { x1: 15, y1: 100, x2: 22, y2: 100, main: true },
              { x1: 26.39, y1: 56.7, x2: 32.53, y2: 61.36, main: false },
              { x1: 57.5, y1: 24.55, x2: 61, y2: 32.45, main: false },
            ].map((m, i) => (
              <line
                key={i}
                x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                stroke="#1E2849"
                strokeWidth={m.main ? 2.5 : 1}
                opacity={m.main ? 0.5 : 0.2}
                strokeLinecap="round"
              />
            ))}
            <circle cx="100" cy="100" r="4" fill="#af8f5b" />
            <g ref={hourRef}>
              <line x1="100" y1="100" x2="100" y2="52" stroke="#1E2849" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <g ref={minuteRef}>
              <line x1="100" y1="100" x2="100" y2="30" stroke="#af8f5b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="100" cy="100" r="2.5" fill="#FFFAF0" />
          </svg>
        </div>
        <span className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] uppercase text-[#af8f5b] select-none" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>TOCK</span>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 3: Create TestimonialMarquee component**

Extracted from `src/app/page.tsx` lines 354-538. This is the most complex shared component.

```tsx
// src/components/landing/TestimonialMarquee.tsx
"use client"

import { useRef, useState, useEffect } from "react"
import { animate } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface Testimonial {
  name: string
  school: string
  quote: string
}

export default function TestimonialMarquee({ testimonials: initialTestimonials }: { testimonials: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const controls = useRef<any>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging = useRef(false)
  const doubledTestimonials = [...initialTestimonials, ...initialTestimonials]

  const [cardWidth, setCardWidth] = useState(452)
  useEffect(() => {
    setCardWidth(window.innerWidth < 640 ? 332 : 452)
    const handleResize = () => setCardWidth(window.innerWidth < 640 ? 332 : 452)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const totalWidth = initialTestimonials.length * cardWidth

  const getCurrentX = (): number => {
    if (!innerRef.current) return 0
    try {
      const transform = window.getComputedStyle(innerRef.current).transform
      if (!transform || transform === 'none') return 0
      const match = transform.match(/matrix.*\((.+)\)/)
      if (match) {
        const values = match[1].split(',')
        return parseFloat(values[4]) || 0
      }
    } catch (e) {
      console.error('[Marquee] Failed to read transform:', e)
    }
    return 0
  }

  const startMarquee = () => {
    if (pausedRef.current || !innerRef.current) return
    if (controls.current) controls.current.stop()

    const currentX = getCurrentX()
    const resetPoint = -totalWidth
    const baseDuration = Math.max(40, initialTestimonials.length * 4)

    const remaining = Math.abs(resetPoint - currentX)
    const fullDistance = Math.abs(resetPoint)
    const duration = fullDistance > 0 ? (remaining / fullDistance) * baseDuration : baseDuration

    controls.current = animate(innerRef.current, { x: resetPoint }, {
      duration,
      ease: "linear",
      onComplete: () => {
        if (innerRef.current) {
          innerRef.current.style.transform = 'translateX(0px)'
        }
        if (!pausedRef.current) startMarquee()
      }
    })
  }

  const pause = () => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    if (controls.current) controls.current.stop()
  }

  const resumeAfterDelay = (ms = 4000) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
      startMarquee()
    }, ms)
  }

  useEffect(() => {
    const timer = setTimeout(() => startMarquee(), 500)
    return () => {
      clearTimeout(timer)
      controls.current?.stop()
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [initialTestimonials])

  const scroll = (direction: 'left' | 'right') => {
    pause()
    if (!innerRef.current) return

    const current = getCurrentX()
    const step = cardWidth
    const target = direction === 'left' ? current + step : current - step

    animate(innerRef.current, { x: target }, {
      duration: 0.4,
      ease: "easeOut",
    })

    resumeAfterDelay(5000)
  }

  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    pause()
    isDragging.current = false
    dragStartX.current = e.clientX
    dragStartScroll.current = getCurrentX()
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch (err) {
      console.warn('[Marquee] setPointerCapture failed:', err)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.buttons) return
    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > 5) isDragging.current = true
    if (innerRef.current) {
      innerRef.current.style.transform = `translateX(${dragStartScroll.current + dx}px)`
    }
  }

  const handlePointerUp = () => {
    resumeAfterDelay(5000)
  }

  return (
    <div className="relative group px-4 sm:px-12">
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-r from-[#FFFAF0] via-[#FFFAF0] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-l from-[#FFFAF0] via-[#FFFAF0] to-transparent z-20 pointer-events-none" />

      <button
        className="absolute left-1 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#af8f5b] hover:text-white hover:border-[#af8f5b] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        className="absolute right-1 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#af8f5b] hover:text-white hover:border-[#af8f5b] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div
        ref={containerRef}
        className="relative overflow-hidden py-12 cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => pause()}
        onMouseLeave={() => {
          if (!isDragging.current) {
            pausedRef.current = false
            startMarquee()
          }
        }}
      >
        <div
          ref={innerRef}
          className="flex will-change-transform"
        >
          {doubledTestimonials.map((t, i) => (
            <div key={i} className="flex-shrink-0 px-3">
              <div
                className="w-[320px] sm:w-[440px] bg-white border border-[#e5e0d5] p-6 sm:p-8 rounded-2xl transition-colors duration-700 hover:border-[#af8f5b]/30 hover:shadow-xl hover:shadow-[#af8f5b]/5 shadow-sm"
                onClick={(e) => { if (isDragging.current) e.preventDefault() }}
              >
                <div className="mb-5 relative">
                  <div className="absolute -top-4 -left-2 text-6xl font-display text-[#af8f5b]/15 select-none pointer-events-none">&ldquo;</div>
                  <p className="text-sm sm:text-[15px] text-[#1a1a1a] leading-relaxed relative z-10 min-h-[100px]">{t.quote}</p>
                </div>
                <div className="pt-5 border-t border-[#e5e0d5]">
                  <p className="text-xs sm:text-sm font-bold text-[#0a0a0a]">{t.name}</p>
                  <p className="text-xs sm:text-xs text-[#af8f5b] font-medium mt-1">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/StatCard.tsx src/components/landing/ClockTransition.tsx src/components/landing/TestimonialMarquee.tsx
git commit -m "feat: extract StatCard, ClockTransition, and TestimonialMarquee components"
```

---

### Task 5: Extract ProductDemo component

**Files:**
- Create: `src/components/landing/ProductDemo.tsx`

- [ ] **Step 1: Create ProductDemo component**

Extract the entire ProductDemo section from `src/app/page.tsx` lines 574-990. This includes `demoTabs` data, `ProductDemo`, `DemoArchetype`, `DemoRoadmap`, `DemoGaps`, `DemoProjects`, `DemoAcademics`, `DemoTesting`, `DemoScholarships`, and `DemoColleges` — all in one file since they're tightly coupled.

Copy lines 574-990 from `src/app/page.tsx` into `src/components/landing/ProductDemo.tsx`. Add at the top:

```tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeUp } from "./animations"
import {
  Sparkles, Calendar, AlertCircle, Lightbulb, BookOpen,
  ClipboardList, DollarSign, School, ArrowRight, Check
} from "lucide-react"
```

Export `ProductDemo` as the default export. Keep everything else as file-private functions.

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/ProductDemo.tsx
git commit -m "feat: extract ProductDemo component with all demo tab sub-components"
```

---

### Task 6: Move current homepage to `/b2b`

**Files:**
- Create: `src/app/b2b/page.tsx`

- [ ] **Step 1: Create the B2B page**

This file imports all the extracted shared components and recreates the current homepage layout. It contains only the B2B-specific data (agency testimonials, agency stats, agency features, agency FAQs, etc.) and the page composition.

The page should:
1. Import `Navbar`, `Footer`, `StatCard`, `ClockTransition`, `TestimonialMarquee`, `ProductDemo`, `fadeUp` from the extracted components
2. Keep all the B2B-specific data arrays inline (features, testimonials, stats, faqs, sampleQuestions)
3. Keep the B2B-specific sections inline (hero, parent quote, how-it-works cards with SVG animations, features grid, comparison section, deep-dive section, testimonials section, final CTA with iframe)
4. Use the shared `Navbar` and `Footer`
5. Maintain the same scroll-driven animations (heroRef, statementRef, etc.)
6. All agency CTAs point to `/get-started`

Structure:
```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { /* all needed icons */ } from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import Navbar from "@/components/Navbar"
import Footer from "@/components/landing/Footer"
import StatCard, { Stat } from "@/components/landing/StatCard"
import ClockTransition from "@/components/landing/ClockTransition"
import TestimonialMarquee, { Testimonial } from "@/components/landing/TestimonialMarquee"
import ProductDemo from "@/components/landing/ProductDemo"
import { fadeUp, ease } from "@/components/landing/animations"

// ... all B2B data arrays (features, testimonials, stats, faqs, sampleQuestions) ...
// ... FAQ/Testimonial interfaces ...
// ... LandingPage component with all B2B sections, using shared Navbar/Footer ...

export default B2BPage
```

Copy all the data arrays and section JSX from the current `src/app/page.tsx`, replacing inline component definitions with imports. The nav section is replaced by `<Navbar isScrolled={isScrolled} />` and the footer by `<Footer />`.

- [ ] **Step 2: Verify the B2B page builds**

Run: `cd /Users/vish/Documents/Platforms/thestudentblueprint && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds (or at minimum, no errors in `src/app/b2b/page.tsx`)

- [ ] **Step 3: Commit**

```bash
git add src/app/b2b/page.tsx
git commit -m "feat: move B2B agency homepage to /b2b route"
```

---

### Task 7: Create the B2C families homepage

**Files:**
- Create: `src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Write the new B2C homepage**

This replaces the current `src/app/page.tsx` entirely. It imports shared components and contains B2C-specific content per the spec.

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ArrowRight, ArrowDown, Brain, Target, TrendingUp, Award,
  Search, Rocket, GraduationCap, BookOpen, DollarSign, Users,
  Pen, ShieldCheck, Zap, Lightbulb, School
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/landing/Footer"
import StatCard, { Stat } from "@/components/landing/StatCard"
import ClockTransition from "@/components/landing/ClockTransition"
import ProductDemo from "@/components/landing/ProductDemo"
import { fadeUp, ease } from "@/components/landing/animations"
```

**B2C-specific data:**

```tsx
const stats: Stat[] = [
  { number: "150K+", label: "Data Points", sub: "Real admissions data" },
  { number: "1200+", label: "Accepted Students", sub: "Analyzed & benchmarked" },
  { number: "20+", label: "Report Sections", sub: "Personalized to your child" }
]

const reportSections = [
  {
    title: "Student Archetype & Competitiveness Score",
    description: "Discover your child's unique applicant identity — like \"Analytical Entrepreneur\" or \"Creative Humanitarian\" — plus a 0-100 competitiveness score benchmarked against real admits.",
    featured: true
  },
  {
    title: "Gap Analysis",
    description: "What's missing from your child's profile — blind spots that admissions officers will notice, with specific actions to close each gap."
  },
  {
    title: "Projects & Research",
    description: "Tailored passion project ideas and research opportunities with step-by-step plans, mentor suggestions, and timeline."
  },
  {
    title: "Career Pathways",
    description: "Career recommendations aligned to your child's strengths, with salary potential, internship ideas, and major suggestions."
  },
  {
    title: "Academics",
    description: "Course recommendations by grade — AP, IB, Honors, and electives — plus GPA targets and SAT/ACT prep strategy."
  },
  {
    title: "Scholarships",
    description: "Matched scholarship opportunities based on your child's profile, interests, and demographics. Found funding families miss."
  },
  {
    title: "Activities & Leadership",
    description: "Which clubs, competitions, and leadership roles to pursue — and which to drop. Prioritized by admissions impact."
  },
  {
    title: "College Match List",
    description: "Reach, Target, and Safety schools with match scores and explanations — built from your child's actual profile data."
  },
  {
    title: "Essay Strategy",
    description: "Narrative themes and personal story angles drawn from your child's experiences — the foundation for standout application essays."
  }
]

const placeholderTestimonials = [
  {
    name: "Jennifer M.",
    school: "Parent, Class of 2025",
    quote: "The roadmap showed us exactly what our daughter was missing. She started a research project in 10th grade that became the centerpiece of her application. She got into her top choice."
  },
  {
    name: "David & Sarah K.",
    school: "Parents, Class of 2026",
    quote: "We spent $8,000 on a private counselor who gave us a one-page summary. This report was 40 pages of actionable strategy. Not even close."
  },
  {
    name: "Maria L.",
    school: "Parent, Class of 2027",
    quote: "My son had no idea what to focus on. The assessment gave him a clear identity and a four-year plan. His confidence completely changed."
  }
]

const faqs = [
  // All student/family-relevant FAQs from the current page — EXCLUDE:
  // "How does this integrate with my tutoring agency?"
  // "Is there an agency partner program?"
  // "How do agencies collect payments from their students?"
  // Include all others from the current page's faqs array
]
```

**Page sections in order:**

1. **Navbar** — `<Navbar isScrolled={isScrolled} />`
2. **Hero** — Eyebrow: "Clarity is the unfair advantage." / Headline: "YOUR CHILD'S PATH TO THE IVY LEAGUE, MAPPED OUT." / Subheadline with 150K data points copy / Tagline: "TURN AMBITION INTO ADMISSION." / Primary CTA: "Get My Child's Roadmap →" → `/checkout` / Secondary: "How It Works ↓" / Price anchor: "One-time investment: $497 · Full report in minutes"
3. **Parent Quote** — kept as-is (scroll-driven opacity)
4. **Clock Transition** — `<ClockTransition />`
5. **Stats** — `stats.map(...)` with `<StatCard />`
6. **How It Works** — "Three Steps to Your Child's Roadmap" with three dark cards: Take/Analyze/Receive (new B2C copy, same visual style as B2B Deploy/Analyze/Scale cards including SVG animations)
7. **Product Demo** — `<ProductDemo />`
8. **What's In Your Report** — 9-card grid. First card (Archetype + Competitiveness) spans 2 columns and includes the score tier table. Remaining 8 cards in a 3-column grid.
9. **Testimonials** — heading "What Families Are Saying" with `<TestimonialMarquee testimonials={placeholderTestimonials} />`
10. **FAQ** — Accordion with family-filtered FAQs (fetched from CMS, merged with hardcoded, agency-specific ones excluded)
11. **Final CTA** — "DON'T LET THEM FALL BEHIND." / "The students getting into top schools aren't smarter. They started with a plan. Give your child the same advantage." / "Get My Child's Roadmap →" → `/checkout` / No pricing.
12. **Footer** — `<Footer />`

- [ ] **Step 2: Verify the build succeeds**

Run: `cd /Users/vish/Documents/Platforms/thestudentblueprint && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: create B2C families homepage with direct assessment CTA"
```

---

### Task 8: Visual QA and final adjustments

- [ ] **Step 1: Start dev server and visually verify both pages**

Run: `cd /Users/vish/Documents/Platforms/thestudentblueprint && npm run dev`

Check:
- `http://localhost:3000` — B2C homepage loads with correct hero copy, stats, sections, nav links
- `http://localhost:3000/b2b` — B2B page loads with original agency content, nav links work
- Nav links: B2B Self-Service → `/b2b`, Login → `/login`, Resume → `/resume`, Start Assessment → `/checkout`
- Mobile hamburger menu works on both pages
- All animations play correctly (scroll-driven parent quote, clock, count-up stats)

- [ ] **Step 2: Fix any visual issues found**

Address any layout, styling, or animation issues.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: visual QA adjustments for B2C and B2B pages"
```

---

### Task 9: Full build verification

- [ ] **Step 1: Run production build**

Run: `cd /Users/vish/Documents/Platforms/thestudentblueprint && npm run build 2>&1 | tail -30`

Expected: Build succeeds with no errors. Both `/` and `/b2b` routes appear in the output.

- [ ] **Step 2: Commit any remaining fixes**

If the build reveals issues, fix them and commit.
