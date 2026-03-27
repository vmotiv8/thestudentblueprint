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
