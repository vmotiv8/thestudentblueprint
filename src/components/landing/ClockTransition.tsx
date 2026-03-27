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
