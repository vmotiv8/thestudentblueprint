"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Brain,
  Target,
  TrendingUp,
  Award,
  Briefcase,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Check,
  Minus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: "White-Labeled Assessments",
    description: "Deploy a professional 15-section assessment under your own brand to instantly elevate your agency's authority."
  },
  {
    icon: Target,
    title: "Automated Strategy Maps",
    description: "Generate personalized Ivy League action plans for your students in seconds, saving your counselors hundreds of hours."
  },
  {
    icon: TrendingUp,
    title: "Agency Revenue Growth",
    description: "Increase your average deal size by offering premium, data-driven roadmap services as a high-margin add-on."
  },
  {
    icon: Award,
    title: "Elite Benchmarking",
    description: "Give your clients confidence by comparing their profile against thousands of successful Ivy League applications."
  }
]

const testimonials = [
  {
    name: "Rachel Kim",
    school: "Founder, Apex Admissions Group",
    quote: "We went from spending 6 hours per student on manual profile analysis to generating a comprehensive Ivy League roadmap in under 10 minutes. Our counselors now handle 3x the caseload without sacrificing quality. Last year, 23 of our students got into T20 schools using Blueprint-generated strategies."
  },
  {
    name: "David Okafor",
    school: "CEO, Meridian College Consulting",
    quote: "The white-label feature was the game-changer for us. Our clients have no idea the roadmaps come from Blueprint \u2014 they think we built it all in-house. We added it as a $2,500 premium tier and it became our highest-margin service overnight. Revenue is up 47% year over year."
  },
  {
    name: "Sarah Mitchell",
    school: "Director, Ivy Bridge Partners",
    quote: "I was skeptical that Blueprint Intelligence could match what our ex-admissions-officer counselors do. I was wrong. The archetype analysis and gap identification caught blind spots we consistently missed. One student's profile was completely repositioned around a narrative we hadn't considered, and she got into Princeton early action."
  },
  {
    name: "James Chen",
    school: "Managing Partner, Pacific Prep Advisors",
    quote: "We serve 400+ families across the Bay Area and Shanghai. Before Blueprint, scaling meant hiring more counselors at $90K each. Now one counselor with Blueprint delivers better outcomes than three without it. The scholarship matching alone has saved our families over $2M in found funding this cycle."
  },
  {
    name: "Anita Desai",
    school: "Founder, Aspire Education Collective",
    quote: "What sets Blueprint apart is the grade-by-grade roadmap. Parents see a concrete four-year plan and immediately understand the value. Our close rate on premium packages went from 35% to 72% after we started showing the Blueprint analysis in our initial consultations. It sells itself."
  },
  {
    name: "Michael Torres",
    school: "Head of Strategy, Compass College Advisory",
    quote: "We piloted Blueprint with 50 students last spring. Every single one said the personalized roadmap was the most valuable part of our service. The mentor matching feature connected three students with research opportunities that became the centerpiece of their applications. Two got into Stanford."
  },
  {
    name: "Linda Park",
    school: "Founder, Elevate College Prep",
    quote: "We were a two-person operation trying to compete with agencies that had ten counselors. Blueprint leveled the playing field completely. Our reports now look more polished than firms charging $15K per family. We onboarded 80 new students in our first quarter after launching with the platform."
  },
  {
    name: "Marcus Williams",
    school: "CEO, Summit Education Partners",
    quote: "The ROI was immediate. We purchased 100 licenses, resold the assessments at $1,200 each, and made back our entire investment within the first two weeks. The platform essentially prints money if you have the student pipeline. Our margins went from 30% to over 65%."
  },
  {
    name: "Dr. Priya Sharma",
    school: "Director, Global Scholars Academy",
    quote: "We work with students across India, Dubai, and Singapore who are targeting US universities. The platform understands international curricula — CBSE, IB, A-Levels — and tailors the roadmap accordingly. No other tool we've tried gets the nuance of cross-border admissions strategy right."
  },
  {
    name: "Tom Brennan",
    school: "Co-Founder, Northeast Admissions Co.",
    quote: "I've been in admissions consulting for 12 years. The competitiveness scoring is shockingly accurate — it identified the same gaps I would have, plus a few I missed. We now use the Blueprint report as the starting point for every student engagement. It saves our senior counselors about 4 hours per student."
  },
  {
    name: "Yuki Tanaka",
    school: "Founder, Bright Path Education",
    quote: "Parents in our market are data-driven. When we show them the archetype analysis, the radar chart, and a concrete four-year plan in the first consultation, they sign on the spot. Our conversion rate on discovery calls doubled after we started leading with the Blueprint report."
  },
  {
    name: "Olivia Grant",
    school: "Managing Director, Prestige Prep Partners",
    quote: "We white-labeled the entire platform under our brand. Our clients think we built a proprietary AI system. The custom domain, our logo, our colors — it's seamless. That perception of innovation has helped us close enterprise contracts with three private schools this year."
  },
  {
    name: "Daniel Reyes",
    school: "Head of Operations, CollegeMap Advisors",
    quote: "Before Blueprint, our bottleneck was the strategy report. Each one took a senior counselor an entire day. Now we generate them in minutes and spend that time on what actually matters — the one-on-one coaching sessions. Our student satisfaction scores went from 4.1 to 4.8 out of 5."
  },
  {
    name: "Fatima Al-Rashid",
    school: "Founder, Atlas Admissions Consulting",
    quote: "We launched our agency six months ago with zero brand recognition. Blueprint gave us instant credibility. Walking into parent meetings with a 40-page personalized PDF report makes us look like we've been doing this for a decade. We signed 45 families in our first season."
  },
  {
    name: "Robert Chang",
    school: "Partner, Keystone Academic Group",
    quote: "The passion project recommendations alone are worth the price. Three of our students launched initiatives directly from Blueprint's suggestions — one built a climate research blog that got cited by a local newspaper, and she used it as the centerpiece of her Columbia application. She got in."
  },
  {
    name: "Catherine Dubois",
    school: "Founder, Lumière College Consulting",
    quote: "I run a boutique firm serving 30 families per cycle. Blueprint didn't replace my expertise — it amplified it. I use the AI report as a diagnostic foundation, then layer my personal insights on top. My students are better prepared, and I can confidently charge premium rates because the deliverables are exceptional."
  },
  {
    name: "Jason Adebayo",
    school: "CEO, Pathway Scholars International",
    quote: "We needed a solution that could handle scale without diluting quality. Blueprint lets our junior counselors deliver the same caliber of strategy that used to require our most experienced staff. We expanded from 200 to 600 students this year and our acceptance rates actually improved."
  },
  {
    name: "Stephanie Nguyen",
    school: "Director, Horizon Education Group",
    quote: "The grade-by-grade roadmap is what parents are willing to pay for. It's not just a list of suggestions — it's a structured, year-by-year plan with specific milestones. When a parent sees their 9th grader's path mapped all the way to senior year, they understand exactly why our services are worth the investment."
  }
]

const stats = [
  { number: "10x", label: "Efficiency", sub: "Automated report generation" },
  { number: "40%", label: "Revenue Growth", sub: "Per student enrollment" },
  { number: "100+", label: "Partner Agencies", sub: "Scaling admissions success" }
]

const faqs = [
  {
    question: "How long does the assessment take?",
    answer: "The assessment typically takes about one hour to complete. It covers 15 sections including academics, extracurriculars, career aspirations, and personality. You can save your progress at any point and return later using a unique resume code sent to your email."
  },
  {
    question: "What happens after I complete the assessment?",
    answer: "Once you submit the assessment, our AI engine analyzes your profile and generates a comprehensive, personalized roadmap within minutes. You'll receive an email with a link to your full results dashboard, which includes your student archetype, competitiveness score, grade-by-grade action plan, college recommendations, and more."
  },
  {
    question: "Can I retake the assessment?",
    answer: "The assessment is designed to be taken once to capture an accurate snapshot of your current profile. However, if your circumstances change significantly, an admin can regenerate your report with updated data to reflect your latest achievements and goals."
  },
  {
    question: "How does this integrate with my tutoring agency?",
    answer: "The platform is designed as a plug-and-play solution for agencies. You can send the assessment link to students as part of onboarding or as a premium strategy session. Results can be fully white-labeled to match your agency's branding, and you get an admin dashboard to track all your students' progress."
  },
  {
    question: "Is there an agency partner program?",
    answer: "Yes. We offer bulk pricing and enterprise licenses for tutoring agencies and schools. This includes white-labeling, custom domains, a dedicated admin dashboard, and priority support. Contact us to learn about our agency tiers and volume pricing."
  },
  {
    question: "What is the competitiveness score?",
    answer: "The competitiveness score is a number from 0 to 100 that evaluates how strong your overall college application profile is relative to successful Ivy League and Top 20 applicants. It considers your academics, testing, extracurriculars, leadership, research experience, and personal narrative to give you a clear benchmark."
  },
  {
    question: "What is a student archetype?",
    answer: "Your student archetype is a unique two-to-three word descriptor that captures your core strengths and identity as an applicant — for example, 'Analytical Entrepreneur' or 'Creative Humanitarian.' It's derived from your personality traits, interests, and activities, and serves as the foundation for your personalized roadmap."
  },
  {
    question: "How accurate are the college recommendations?",
    answer: "Our college recommendations are generated based on your academic profile, test scores, extracurriculars, geographic preferences, and career goals. They are categorized into Reach, Target, and Safety tiers with match scores and explanations for each school. While no tool can guarantee admission, our recommendations are grounded in real admissions data and trends."
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. All assessment data is encrypted in transit and at rest. We use enterprise-grade database security with row-level access controls, and your personal information is never shared with third parties. Only you and your authorized counselor or agency can access your results."
  },
  {
    question: "What grade levels is this designed for?",
    answer: "The assessment is designed for students in grades 8 through 12. The roadmap automatically adapts to your current grade level, providing age-appropriate recommendations and a year-by-year plan through graduation. Earlier is better — students who start in 8th or 9th grade get the most actionable runway."
  },
  {
    question: "Do I need to pay before taking the assessment?",
    answer: "Payment is required before submitting the assessment for analysis. You can browse the assessment questions for free to understand what's involved, but generating your personalized roadmap and report requires a completed payment or a valid coupon code."
  },
  {
    question: "Can I download my report as a PDF?",
    answer: "Yes. Once your report is generated, you can download a professionally formatted PDF version directly from your results dashboard. The PDF includes your full archetype analysis, competitiveness score, strengths and gaps, grade-by-grade roadmap, college recommendations, and all other sections."
  },
  {
    question: "What makes this different from a regular college counselor?",
    answer: "A traditional counselor offers subjective advice based on their experience. Blueprint Intelligence combines AI-powered analysis with admissions data to deliver a structured, comprehensive strategy covering academics, testing, extracurriculars, leadership, research, internships, competitions, and more — all personalized to your specific profile, location, and curriculum."
  },
  {
    question: "Does this work for international students?",
    answer: "Yes. The platform supports students worldwide and tailors recommendations based on your country, curriculum (including CBSE, IB, A-Levels, and US curricula), and target study-abroad destinations. If you're planning to apply to US, UK, or Canadian universities from abroad, the roadmap will reflect those specific admissions requirements."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team by emailing hello@thestudentblueprint.com. For agency partners, priority support is available through your admin dashboard. We typically respond within 24 hours on business days."
  },
  {
    question: "What kind of questions are on the assessment?",
    answer: "The assessment is divided into 15 detailed sections. You'll answer questions about your basic information (name, grade, location, curriculum), academic profile (GPA, courses taken, class rank, awards), standardized testing (PSAT, SAT, ACT, AP scores), extracurricular activities and leadership roles, competition history, passions and interests, career aspirations, research and internship experience, summer programs, special talents, family context (parent professions, legacy connections, financial aid needs), personality traits and strengths, personal stories (challenges, proud moments, leadership experiences), and your available time commitment. Every answer helps the AI build a more precise and actionable roadmap."
  },
  {
    question: "What exactly is included in my results report?",
    answer: "Your report includes over 20 personalized sections: a student archetype and personality profile with scores across 8 dimensions, a competitiveness score out of 100, a detailed strengths analysis with competitive advantages and differentiators, a gap analysis highlighting what's missing from your profile, a phased roadmap (immediate, short-term, medium-term, and long-term actions), a grade-by-grade plan through 12th grade, academic course recommendations (AP, IB, Honors, electives), SAT/ACT target scores and prep strategy, research and publication opportunities, leadership development recommendations, community service suggestions, summer program picks including Ivy League pre-college programs, sports and competition strategies, student government pathways, internship opportunities, culture and arts recommendations, passion project ideas with implementation steps, career recommendations with salary potential, college match analysis with Reach/Target/Safety tiers and match scores, mentor suggestions, and a list of activities to deprioritize."
  },
  {
    question: "How do payments work?",
    answer: "Payments are processed securely through Stripe. After entering your email and starting the assessment flow, you'll be prompted to complete payment before your responses are submitted for analysis. We accept all major credit and debit cards. If your agency or school has set up free assessments or provided a coupon code, you can bypass payment entirely. Once payment is confirmed, your assessment is analyzed and your report is generated automatically."
  },
  {
    question: "How do agencies collect payments from their students?",
    answer: "Agencies have two options. First, you can set your own assessment price through your admin dashboard — when students go through your white-labeled assessment link, they pay the price you've configured, and funds go directly to your connected Stripe account via Stripe Connect. Second, you can mark assessments as free for your organization and handle billing separately through your own invoicing process. Either way, you have full control over your pricing and revenue."
  },
  {
    question: "What is the grade-by-grade roadmap?",
    answer: "The grade-by-grade roadmap is a year-by-year action plan that starts from your current grade and extends through 12th grade graduation. For each year, it provides specific goals across five areas: academics (courses to take and GPA targets), extracurriculars (activities to pursue and deepen), testing (when to take the PSAT, SAT, ACT, and AP exams), leadership (age-appropriate roles and responsibilities), and a summer plan (programs, internships, or projects to pursue). Each year builds on the previous one, ensuring a cohesive narrative for your college applications."
  },
  {
    question: "Can my parents see my results?",
    answer: "Yes. If you provide a parent or guardian email address during the assessment, they will automatically receive an email notification when your report is ready, along with a link to view your results. This makes it easy for families to review the roadmap together and plan next steps."
  },
  {
    question: "What if I haven't taken the SAT or ACT yet?",
    answer: "That's completely fine. The assessment asks about your testing history, but it's not required. If you haven't taken standardized tests yet, the report will include target scores tailored to your college goals, a recommended testing timeline, and a prep strategy so you know exactly when and how to prepare."
  },
  {
    question: "How does the mentor matching work?",
    answer: "Based on your academic interests, career aspirations, and target schools, the report suggests specific professors and researchers at top universities who align with your goals. Each recommendation includes their name, university, department, and an explanation of why they'd be a strong mentor match. You can use these suggestions to reach out for research opportunities, informational interviews, or mentorship."
  },
  {
    question: "What are passion projects and how are they recommended?",
    answer: "Passion projects are self-directed initiatives that demonstrate your genuine interests and ability to create impact outside the classroom. Your report recommends two or more specific project ideas tailored to your profile, each with a title, detailed description, estimated time commitment, skills you'll develop, the impact it will have on your college application, resources to get started, and step-by-step implementation instructions. These projects are designed to become standout elements of your application narrative."
  }
]

const sampleQuestions = [
  {
    category: "Institutional Impact",
    icon: Briefcase,
    questions: [
      "How many students does your agency currently serve?",
      "What is your current success rate for T20 admissions?",
      "What is the biggest bottleneck in your strategy process?"
    ]
  },
  {
    category: "Revenue Optimization",
    icon: TrendingUp,
    questions: [
      "What is your average revenue per student?",
      "How many hours do your counselors spend on manual reports?",
      "Are you looking to scale your premium consulting offerings?"
    ]
  }
]

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

interface Testimonial {
  id: string
  name: string
  school: string
  quote: string
  display_order: number
}

// ─── Animation constants ─────────────────────────────────────────────────────

const ease = [0.25, 0.1, 0.25, 1] as const
const fadeUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease }
}
const stagger = (i: number, base = 0.15) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay: i * base, ease }
})

// ─── Counter Hook ────────────────────────────────────────────────────────────

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

// ─── Testimonial Marquee ─────────────────────────────────────────────────────

function TestimonialMarquee({ testimonials: initialTestimonials }: { testimonials: Testimonial[] }) {
  const x = useMotionValue(0)
  const controls = useRef<any>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doubledTestimonials = [...initialTestimonials, ...initialTestimonials, ...initialTestimonials]

  const startMarquee = () => {
    if (pausedRef.current) return
    if (controls.current) controls.current.stop()

    const currentX = x.get()
    const targetX = -33.333
    const remainingDistance = currentX <= targetX ? 33.333 + currentX : Math.abs(targetX - currentX)
    const baseDuration = Math.max(30, initialTestimonials.length * 5)
    const duration = (remainingDistance / 33.333) * baseDuration

    controls.current = animate(x, targetX, {
      duration: duration,
      ease: "linear",
      onComplete: () => {
        x.set(0)
        if (!pausedRef.current) startMarquee()
      }
    })
  }

  const pause = () => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    if (controls.current) controls.current.stop()
  }

  const resumeAfterDelay = (ms = 3000) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
      startMarquee()
    }, ms)
  }

  useEffect(() => {
    startMarquee()
    return () => {
      controls.current?.stop()
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [initialTestimonials])

  const scroll = (direction: 'left' | 'right') => {
    pause()

    const currentX = x.get()
    const step = 3
    const targetX = direction === 'left' ? currentX + step : currentX - step

    animate(x, targetX, {
      duration: 0.4,
      ease: "easeOut",
    })

    resumeAfterDelay(4000)
  }

  return (
    <div className="relative group px-4 sm:px-12">
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-r from-[#faf8f3] via-[#faf8f3] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-l from-[#faf8f3] via-[#faf8f3] to-transparent z-20 pointer-events-none" />

      <button
        className="absolute left-1 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#c9a227] hover:text-white hover:border-[#c9a227] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        className="absolute right-1 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a0a0a] hover:bg-[#c9a227] hover:text-white hover:border-[#c9a227] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="relative overflow-hidden py-12">
        <motion.div
          className="flex"
          style={{ x: useTransform(x, v => `${v}%`) }}
          onMouseEnter={() => pause()}
          onMouseLeave={() => {
            pausedRef.current = false
            startMarquee()
          }}
        >
          {doubledTestimonials.map((t, i) => (
            <div key={i} className="flex-shrink-0 px-3 group/card">
              <motion.div
                className="w-[320px] sm:w-[440px] bg-white border border-[#e5e0d5] p-6 sm:p-8 rounded-2xl transition-all duration-700 group-hover/card:border-[#c9a227]/30 group-hover/card:shadow-xl group-hover/card:shadow-[#c9a227]/5 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <div className="mb-5 relative">
                  <div className="absolute -top-4 -left-2 text-6xl font-display text-[#c9a227]/15 select-none">&ldquo;</div>
                  <p className="text-sm sm:text-[15px] text-[#1a1a1a] leading-relaxed relative z-10 min-h-[100px]">{t.quote}</p>
                </div>
                <div className="pt-5 border-t border-[#e5e0d5]">
                  <p className="text-xs sm:text-sm font-bold text-[#0a0a0a]">{t.name}</p>
                  <p className="text-xs sm:text-xs text-[#c9a227] font-medium mt-1">{t.school}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const display = useCountUp(stat.number, inView)

  return (
    <motion.div
      ref={ref}
      {...stagger(index, 0.2)}
      className="text-center"
    >
      <div
        className="text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {display}
      </div>
      <div className="text-xs sm:text-sm font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-2">
        {stat.label}
      </div>
      <div className="text-xs text-white/60 font-light tracking-wide">
        {stat.sub}
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [faqsList, setFaqsList] = useState<FAQ[]>([])
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(heroProgress, [0, 0.5], [0, -100])
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.95])

  const statementRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: stmtProgress } = useScroll({
    target: statementRef,
    offset: ["start end", "end start"]
  })
  const stmtOpacity = useTransform(stmtProgress, [0.1, 0.35, 0.65, 0.9], [0, 1, 1, 0])
  const stmtY = useTransform(stmtProgress, [0.1, 0.35], [60, 0])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)

    const fetchCMS = async () => {
      try {
        const [faqsRes, testimonialsRes] = await Promise.all([
          fetch('/api/cms/faqs'),
          fetch('/api/cms/testimonials')
        ])
        const faqsData = await faqsRes.json()
        const testimonialsData = await testimonialsRes.json()

        if (faqsData.faqs && faqsData.faqs.length > 0) {
          // Merge CMS FAQs with hardcoded ones: CMS takes priority, then append
          // any hardcoded FAQs whose questions aren't already covered by CMS
          const cmsFaqs = faqsData.faqs as FAQ[]
          const cmsKeys = new Set(cmsFaqs.map((f: FAQ) => f.question.toLowerCase().trim()))

          // Deduplicate CMS FAQs themselves
          const seen = new Set<string>()
          const uniqueCms = cmsFaqs.filter((faq: FAQ) => {
            const key = faq.question.toLowerCase().trim()
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })

          // Append hardcoded FAQs not already in CMS
          const extras = faqs
            .filter(f => !cmsKeys.has(f.question.toLowerCase().trim()))
            .map((f, i) => ({ ...f, id: `fallback-${i}`, display_order: 1000 + i }))

          setFaqsList([...uniqueCms, ...extras])
        }
        if (testimonialsData.testimonials) {
          // Map CMS field names (content/author_name/author_title) to component field names (quote/name/school)
          setTestimonialsList(testimonialsData.testimonials.map((t: any) => ({
            ...t,
            quote: t.quote || t.content || '',
            name: t.name || t.author_name || '',
            school: t.school || t.author_title || '',
          })))
        }
      } catch (error) {
        console.error("Error fetching CMS content:", error)
      }
    }
    fetchCMS()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-[#c9a227]/30">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? "bg-[#0a0a0a]/90 backdrop-blur-2xl py-4 border-b border-white/5" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-700 group-hover:rotate-[360deg]">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              TheStudentBlueprint
            </span>
            <div className="px-1.5 py-0.5 bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-full hidden sm:block">
              <span className="text-xs sm:text-xs font-bold text-[#c9a227] uppercase tracking-widest">Beta</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {["Services", "Testimonials", "Methodology", "FAQ"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/50 hover:text-white text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/admin/login" className="text-white/70 hover:text-white text-xs sm:text-xs font-medium tracking-[0.2em] uppercase transition-colors">
              Login
            </Link>
            <Button asChild className="hidden sm:inline-flex bg-white hover:bg-[#c9a227] text-[#0a0a0a] font-semibold text-xs px-6 py-3 h-auto rounded-full transition-all duration-500 tracking-wide">
              <Link href="/get-started">
                Get Started
              </Link>
            </Button>
            <button
              className="lg:hidden text-white p-2"
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
              className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-2xl border-b border-white/5 py-8 px-6 shadow-2xl z-50"
            >
              <div className="flex flex-col gap-6">
                {["Services", "Testimonials", "Methodology", "FAQ"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-white/80 hover:text-[#c9a227] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <Link
                  href="/admin/login"
                  className="text-white/80 hover:text-[#c9a227] text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button asChild className="w-full bg-white text-[#0a0a0a] font-semibold py-4 rounded-full uppercase tracking-[0.15em]">
                  <Link href="/get-started" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] pt-24 sm:pt-28 md:pt-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#c9a227]/[0.04] rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-[#c9a227]/80 mb-6 sm:mb-8"
          >
            The platform behind the top 1% of admissions agencies
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 sm:mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-white">What If Every Student</span>
            <br />
            <span className="text-white">Got a Roadmap Built by</span>
            <br />
            <span className="bg-gradient-to-r from-[#c9a227] via-[#e8d48b] to-[#c9a227] bg-clip-text text-transparent">
              an Ivy League Strategist?
            </span>
          </motion.h1>

          {/* Subheadline — the reveal */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
          >
            Now they can. <span className="text-white font-medium">Blueprint Intelligence</span> gives
            your agency the power to deliver elite, personalized college strategies
            to <span className="text-[#c9a227] font-medium">hundreds of students</span> — in the time it used to take for one.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Button asChild size="lg" className="bg-[#c9a227] hover:bg-[#e8d48b] text-[#0a0a0a] px-8 sm:px-12 py-5 sm:py-6 h-auto text-sm font-bold rounded-full transition-all duration-500 shadow-2xl shadow-[#c9a227]/20 tracking-wide">
              <Link href="/get-started">
                See It in Action <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/15 text-white/70 hover:text-white hover:border-white/30 px-8 sm:px-10 py-5 sm:py-6 h-auto text-sm font-medium rounded-full transition-all duration-500 bg-transparent">
              <Link href="#methodology">
                How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-xs text-white/25"
          >
            Free to explore. No credit card. Set up in 5 minutes.
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Section 2: Statement ─────────────────────────────────────────── */}
      <section ref={statementRef} className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <motion.div
          style={{ opacity: stmtOpacity, y: stmtY }}
          className="max-w-5xl mx-auto text-center"
        >
          <p
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.3] text-white/90"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A single counselor. Hundreds of students.{" "}
            <span className="bg-gradient-to-r from-[#c9a227] to-[#e8d48b] bg-clip-text text-transparent font-medium italic">
              Every roadmap as personal as a one-on-one session.
            </span>{" "}
            That&apos;s not a dream — it&apos;s what Blueprint agencies deliver every day.
          </p>
        </motion.div>
      </section>

      {/* ── Section 3: Stats ─────────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#0a0a0a] px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 sm:gap-20">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── Section 4: How It Works ──────────────────────────────────────── */}
      <section id="methodology" className="relative py-32 sm:py-48 bg-[#0a0a0a] px-6 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c9a227]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20 sm:mb-28">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-4">The Process</p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Three Steps to{" "}
              <span className="bg-gradient-to-r from-[#c9a227] via-[#e8d48b] to-[#c9a227] bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Agency
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto">
              From setup to scale in under a week. No technical expertise required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Deploy",
                subtitle: "Launch in minutes",
                description: "White-labeled assessment under your brand. Send to students as part of onboarding or premium strategy sessions.",
                icon: "🚀",
              },
              {
                step: "02",
                title: "Analyze",
                subtitle: "Powered by Blueprint Intelligence",
                description: "Personalized Ivy League roadmaps generated in seconds. Data-driven insights your counselors can act on immediately.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "Scale",
                subtitle: "Grow without limits",
                description: "Serve 10x more students without adding headcount. Turn every interaction into a premium, high-margin service.",
                icon: "📈",
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...stagger(i, 0.2)}
                className="relative group"
              >
                {/* Card */}
                <div className="relative p-8 sm:p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-[#c9a227]/30 hover:bg-white/[0.04] transition-all duration-700 h-full overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#c9a227]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />

                  <div className="relative z-10">
                    {/* Step number + icon */}
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-b from-white/10 to-transparent bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {item.step}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-xl group-hover:bg-[#c9a227]/20 group-hover:scale-110 transition-all duration-500">
                        {item.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-[#c9a227] mb-4 tracking-wide">
                      {item.subtitle}
                    </p>
                    <p className="text-base text-white/50 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bottom accent */}
                    <div className="mt-8 h-px w-full bg-gradient-to-r from-[#c9a227]/30 via-[#c9a227]/10 to-transparent group-hover:from-[#c9a227]/50 group-hover:via-[#c9a227]/20 transition-all duration-700" />
                  </div>
                </div>

                {/* Connector line between cards (hidden on last) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#c9a227]/30 to-[#c9a227]/10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent" />
      </section>

      {/* ── Section 5: Features ──────────────────────────────────────────── */}
      <section id="services" className="py-32 sm:py-48 bg-[#0a0a0a] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20 sm:mb-28">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-4">Platform</p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Built for Scale
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                {...stagger(i, 0.15)}
                className="relative group p-8 sm:p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-700 overflow-hidden"
              >
                {/* Glassmorphism highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#c9a227]/10 flex items-center justify-center mb-8 group-hover:bg-[#c9a227]/20 transition-colors duration-500">
                    <feature.icon className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Comparison ────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#faf8f3] px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20 sm:mb-28">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-4">Why Switch</p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#0a0a0a]" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Difference
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease }}
              className="p-8 sm:p-12 rounded-2xl border border-[#e5e0d5] bg-white"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]/70 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                Traditional Agency
              </h3>
              <ul className="space-y-5">
                {[
                  "Inconsistent profile analysis",
                  "Manual, time-consuming roadmaps",
                  "No white-label reporting",
                  "Slow student onboarding",
                  "Limited scalability",
                  "No predictive modeling"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#0a0a0a]/70 font-light">
                    <Minus className="w-4 h-4 mt-1 shrink-0 text-[#0a0a0a]/20" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-[#e5e0d5]">
                <p className="text-sm font-medium text-[#0a0a0a]/30 uppercase tracking-[0.2em]">Profit Margin</p>
                <p className="text-2xl text-[#0a0a0a]/50 mt-2 italic" style={{ fontFamily: "'Playfair Display', serif" }}>Low</p>
              </div>
            </motion.div>

            {/* Blueprint-Powered */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease }}
              className="p-8 sm:p-12 rounded-2xl border-2 border-[#c9a227]/30 bg-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[#c9a227] px-4 py-1.5 rounded-bl-xl">
                <span className="text-xs font-bold text-[#0a0a0a] uppercase tracking-[0.2em]">Recommended</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                Blueprint-Powered
              </h3>
              <ul className="space-y-5">
                {[
                  "Data-driven profile analysis",
                  "Automated Ivy League roadmaps",
                  "Full white-label reporting",
                  "Instant student onboarding",
                  "Unlimited scalability",
                  "Predictive success modeling"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#0a0a0a] font-medium">
                    <Check className="w-4 h-4 mt-1 shrink-0 text-[#c9a227]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-[#c9a227]/20">
                <p className="text-sm font-medium text-[#c9a227] uppercase tracking-[0.2em]">Profit Margin</p>
                <p className="text-2xl text-[#0a0a0a] mt-2 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>High</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Deep Dive ─────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#0a0a0a] px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 sm:gap-24 items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-6">Strategic Intelligence</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              We look beyond the{" "}
              <span className="italic bg-gradient-to-r from-[#c9a227] to-[#e8d48b] bg-clip-text text-transparent">
                surface level.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed mb-12 max-w-lg">
              Our 15-section methodology is designed to uncover the hidden gems in your students' profiles. We automate the dimensions that standard counselors often overlook.
            </p>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white hover:text-[#0a0a0a] rounded-full px-10 py-6 text-sm font-medium tracking-wide transition-all duration-500 bg-transparent">
              <Link href="/get-started">
                Get Started
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-6">
            {sampleQuestions.map((section, i) => (
              <motion.div
                key={i}
                {...stagger(i, 0.2)}
                className="p-8 sm:p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[#c9a227]/20 transition-all duration-700"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#c9a227]/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-[#c9a227]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {section.category}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {section.questions.map((q, j) => (
                    <li key={j} className="flex items-start gap-4 group">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#c9a227] shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm text-white/60 font-light group-hover:text-white/70 transition-colors duration-500 italic">
                        {q}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Testimonials ──────────────────────────────────────── */}
      <section id="testimonials" className="py-32 sm:py-48 bg-[#faf8f3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 sm:mb-20">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-4">Agency Success</p>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#0a0a0a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                What Agencies Say
              </h2>
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-full border border-[#e5e0d5] w-fit shadow-sm">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#c9a227] text-[#c9a227]" />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#0a0a0a] tracking-wide">4.9/5 Rating</span>
            </div>
          </motion.div>
        </div>

        <TestimonialMarquee testimonials={(() => {
          const cms = testimonialsList.length > 0 && testimonialsList.some((t: any) => t.quote?.length > 10)
            ? testimonialsList
            : []
          const cmsNames = new Set(cms.map((t: any) => t.name?.toLowerCase().trim()))
          const extras = (testimonials as any[]).filter((t: any) => !cmsNames.has(t.name?.toLowerCase().trim()))
          return [...cms, ...extras]
        })()} />
      </section>

      {/* ── Section 9: FAQ ───────────────────────────────────────────────── */}
      <section id="faq" className="py-32 sm:py-48 bg-[#0a0a0a] px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Questions?
            </h2>
          </motion.div>

          <motion.div {...fadeUp}>
            <Accordion type="single" collapsible className="space-y-3">
              {(faqsList.length > 0 ? faqsList : faqs).map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 sm:px-8 data-[state=open]:border-[#c9a227]/30 data-[state=open]:bg-white/[0.05] transition-all duration-500"
                >
                  <AccordionTrigger className="text-white/80 hover:text-white text-left py-6 text-base sm:text-lg font-medium hover:no-underline transition-colors duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70 pb-8 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── Section 10: Final CTA ────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-48 overflow-hidden bg-[#0a0a0a]">
        {/* Gradient orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a227]/[0.04] rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#1e3a5f]/[0.06] rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to{" "}
              <span className="bg-gradient-to-r from-[#c9a227] to-[#e8d48b] bg-clip-text text-transparent">
                Scale?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
              Join the elite network of tutoring agencies and educational consultancies using TheStudentBlueprint to deliver world-class admissions strategy.
            </p>

            <Button asChild size="lg" className="bg-white hover:bg-[#c9a227] text-[#0a0a0a] px-12 sm:px-16 py-6 sm:py-8 h-auto text-sm sm:text-base font-semibold rounded-full transition-all duration-500 shadow-2xl shadow-white/10">
              <Link href="/get-started">
                Get Started <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </Button>

            <div className="mt-16 sm:mt-20 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-8 sm:gap-12 text-xs text-white/50 font-medium">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#c9a227]/50" /> Secure Integration
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#c9a227]/50" /> Scalable Infrastructure
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#c9a227]/50" /> White-Labeled Reports
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] py-16 sm:py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-xl sm:text-2xl text-white font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                TheStudentBlueprint
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/privacy" className="text-xs text-white/50 hover:text-white/60 transition-colors tracking-wide">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-white/50 hover:text-white/60 transition-colors tracking-wide">
                Terms & Conditions
              </Link>
            </div>

            <div className="text-xs text-white/40 tracking-wide">
              &copy; {new Date().getFullYear()} TheStudentBlueprint
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
