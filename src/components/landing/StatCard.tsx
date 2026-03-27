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
