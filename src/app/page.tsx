"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/landing/Footer"
import StatCard, { type Stat } from "@/components/landing/StatCard"
import ClockTransition from "@/components/landing/ClockTransition"
import TestimonialMarquee from "@/components/landing/TestimonialMarquee"
import ProductDemo from "@/components/landing/ProductDemo"
import { fadeUp, ease } from "@/components/landing/animations"

// ─── Data ────────────────────────────────────────────────────────────────────

const stats: Stat[] = [
  { number: "150K+", label: "Data Points", sub: "Real admissions data" },
  { number: "1200+", label: "Accepted Students", sub: "Analyzed & benchmarked" },
  { number: "20+", label: "Report Sections", sub: "Personalized to your child" }
]

const reportSections = [
  {
    title: "Student Archetype & Competitiveness Score",
    description: "Discover your child\u2019s unique applicant identity \u2014 like \u201CAnalytical Entrepreneur\u201D or \u201CCreative Humanitarian\u201D \u2014 plus a 0-100 competitiveness score benchmarked against real admits.",
    featured: true
  },
  {
    title: "Gap Analysis",
    description: "What\u2019s missing from your child\u2019s profile \u2014 blind spots that admissions officers will notice, with specific actions to close each gap."
  },
  {
    title: "Projects & Research",
    description: "Tailored passion project ideas and research opportunities with step-by-step plans, mentor suggestions, and timeline."
  },
  {
    title: "Career Pathways",
    description: "Career recommendations aligned to your child\u2019s strengths, with salary potential, internship ideas, and major suggestions."
  },
  {
    title: "Academics",
    description: "Course recommendations by grade \u2014 AP, IB, Honors, and electives \u2014 plus GPA targets and SAT/ACT prep strategy."
  },
  {
    title: "Scholarships",
    description: "Matched scholarship opportunities based on your child\u2019s profile, interests, and demographics. Found funding families miss."
  },
  {
    title: "Activities & Leadership",
    description: "Which clubs, competitions, and leadership roles to pursue \u2014 and which to drop. Prioritized by admissions impact."
  },
  {
    title: "College Match List",
    description: "Reach, Target, and Safety schools with match scores and explanations \u2014 built from your child\u2019s actual profile data."
  },
  {
    title: "Essay Strategy",
    description: "Narrative themes and personal story angles drawn from your child\u2019s experiences \u2014 the foundation for standout application essays."
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
  {
    question: "How long does the assessment take?",
    answer: "The assessment typically takes about one hour to complete. It covers 15 sections including academics, extracurriculars, career aspirations, and personality. You can save your progress at any point and return later using a unique resume code sent to your email."
  },
  {
    question: "What happens after I complete the assessment?",
    answer: "Once you submit the assessment, our AI engine analyzes your profile and generates a comprehensive, personalized roadmap within minutes. You\u2019ll receive an email with a link to your full results dashboard, which includes your student archetype, competitiveness score, grade-by-grade action plan, college recommendations, and more."
  },
  {
    question: "Can I retake the assessment?",
    answer: "The assessment is designed to be taken once to capture an accurate snapshot of your current profile. However, if your circumstances change significantly, an admin can regenerate your report with updated data to reflect your latest achievements and goals."
  },
  {
    question: "What is the competitiveness score?",
    answer: "The competitiveness score is a number from 0 to 100 that evaluates how strong your overall college application profile is relative to successful Ivy League and Top 20 applicants. It considers your academics, testing, extracurriculars, leadership, research experience, and personal narrative to give you a clear benchmark."
  },
  {
    question: "What is a student archetype?",
    answer: "Your student archetype is a unique two-to-three word descriptor that captures your core strengths and identity as an applicant \u2014 for example, \u2018Analytical Entrepreneur\u2019 or \u2018Creative Humanitarian.\u2019 It\u2019s derived from your personality traits, interests, and activities, and serves as the foundation for your personalized roadmap."
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
    answer: "The assessment is designed for students in grades 8 through 12. The roadmap automatically adapts to your current grade level, providing age-appropriate recommendations and a year-by-year plan through graduation. Earlier is better \u2014 students who start in 8th or 9th grade get the most actionable runway."
  },
  {
    question: "Do I need to pay before taking the assessment?",
    answer: "Payment is required before submitting the assessment for analysis. You can browse the assessment questions for free to understand what\u2019s involved, but generating your personalized roadmap and report requires a completed payment or a valid coupon code."
  },
  {
    question: "Can I download my report as a PDF?",
    answer: "Yes. Once your report is generated, you can download a professionally formatted PDF version directly from your results dashboard. The PDF includes your full archetype analysis, competitiveness score, strengths and gaps, grade-by-grade roadmap, college recommendations, and all other sections."
  },
  {
    question: "What makes this different from a regular college counselor?",
    answer: "A traditional counselor offers subjective advice based on their experience. Blueprint Intelligence combines AI-powered analysis with admissions data to deliver a structured, comprehensive strategy covering academics, testing, extracurriculars, leadership, research, internships, competitions, and more \u2014 all personalized to your specific profile, location, and curriculum."
  },
  {
    question: "Does this work for international students?",
    answer: "Yes. The platform supports students worldwide and tailors recommendations based on your country, curriculum (including CBSE, IB, A-Levels, and US curricula), and target study-abroad destinations. If you\u2019re planning to apply to US, UK, or Canadian universities from abroad, the roadmap will reflect those specific admissions requirements."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team by emailing partners@vmotiv8.com. We typically respond within 24 hours on business days."
  },
  {
    question: "What kind of questions are on the assessment?",
    answer: "The assessment is divided into 15 detailed sections. You\u2019ll answer questions about your basic information (name, grade, location, curriculum), academic profile (GPA, courses taken, class rank, awards), standardized testing (PSAT, SAT, ACT, AP scores), extracurricular activities and leadership roles, competition history, passions and interests, career aspirations, research and internship experience, summer programs, special talents, family context (parent professions, legacy connections, financial aid needs), personality traits and strengths, personal stories (challenges, proud moments, leadership experiences), and your available time commitment. Every answer helps the AI build a more precise and actionable roadmap."
  },
  {
    question: "What exactly is included in my results report?",
    answer: "Your report includes over 20 personalized sections: a student archetype and personality profile with scores across 8 dimensions, a competitiveness score out of 100, a detailed strengths analysis with competitive advantages and differentiators, a gap analysis highlighting what\u2019s missing from your profile, a phased roadmap (immediate, short-term, medium-term, and long-term actions), a grade-by-grade plan through 12th grade, academic course recommendations (AP, IB, Honors, electives), SAT/ACT target scores and prep strategy, research and publication opportunities, leadership development recommendations, community service suggestions, summer program picks including Ivy League pre-college programs, sports and competition strategies, student government pathways, internship opportunities, culture and arts recommendations, passion project ideas with implementation steps, career recommendations with salary potential, college match analysis with Reach/Target/Safety tiers and match scores, mentor suggestions, and a list of activities to deprioritize."
  },
  {
    question: "How do payments work?",
    answer: "Payments are processed securely through Stripe. After entering your email and starting the assessment flow, you\u2019ll be prompted to complete payment before your responses are submitted for analysis. We accept all major credit and debit cards. Once payment is confirmed, your assessment is analyzed and your report is generated automatically."
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
    question: "What if I haven\u2019t taken the SAT or ACT yet?",
    answer: "That\u2019s completely fine. The assessment asks about your testing history, but it\u2019s not required. If you haven\u2019t taken standardized tests yet, the report will include target scores tailored to your college goals, a recommended testing timeline, and a prep strategy so you know exactly when and how to prepare."
  },
  {
    question: "How does the mentor matching work?",
    answer: "Based on your academic interests, career aspirations, and target schools, the report suggests specific professors and researchers at top universities who align with your goals. Each recommendation includes their name, university, department, and an explanation of why they\u2019d be a strong mentor match. You can use these suggestions to reach out for research opportunities, informational interviews, or mentorship."
  },
  {
    question: "What are passion projects and how are they recommended?",
    answer: "Passion projects are self-directed initiatives that demonstrate your genuine interests and ability to create impact outside the classroom. Your report recommends two or more specific project ideas tailored to your profile, each with a title, detailed description, estimated time commitment, skills you\u2019ll develop, the impact it will have on your college application, resources to get started, and step-by-step implementation instructions. These projects are designed to become standout elements of your application narrative."
  }
]

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

// ─── Competitiveness Score Tiers ─────────────────────────────────────────────

const scoreTiers = [
  { range: "90-100", tier: "Exceptional", color: "text-emerald-400", dot: "bg-emerald-400", desc: "ISEF finalist, published researcher, 1550+ SAT, clear \u201Cspike\u201D and national/international recognition." },
  { range: "80-89", tier: "Very Competitive", color: "text-blue-400", dot: "bg-blue-400", desc: "State-level winner, 1450+ SAT, clear narrative forming. Strong shot at T20 schools." },
  { range: "70-79", tier: "Competitive", color: "text-amber-400", dot: "bg-amber-400", desc: "1350+ SAT, good GPA, but lacking a standout \u201Cspike.\u201D Needs a defining achievement." },
  { range: "Below 70", tier: "Developing", color: "text-red-400", dot: "bg-red-400", desc: "Time to build your story \u2014 testing & leadership need attention." }
]

// ─── Main Page ───────────────────────────────────────────────────────────────

function FamiliesHomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [faqsList, setFaqsList] = useState<FAQ[]>([])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroY = useTransform(heroProgress, [0, 1], [0, -80])

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
        const res = await fetch('/api/cms/faqs')
        const data = await res.json()
        if (data.faqs && data.faqs.length > 0) {
          const cmsFaqs = data.faqs as FAQ[]
          const cmsKeys = new Set(cmsFaqs.map((f: FAQ) => f.question.toLowerCase().trim()))
          const seen = new Set<string>()
          const uniqueCms = cmsFaqs.filter((faq: FAQ) => {
            const key = faq.question.toLowerCase().trim()
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          const extras = faqs
            .filter(f => !cmsKeys.has(f.question.toLowerCase().trim()))
            .map((f, i) => ({ ...f, id: `fallback-${i}`, display_order: 1000 + i }))
          setFaqsList([...uniqueCms, ...extras])
        }
      } catch (error) {
        console.error("Error fetching CMS FAQs:", error)
      }
    }
    fetchCMS()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFAF0] font-sans selection:bg-[#af8f5b]/30">
      <Navbar isScrolled={isScrolled} />

      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FFFAF0] pt-24 sm:pt-28 md:pt-32 will-change-transform">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#FFFAF0]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-white/80 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1E2849]/20 to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-[#af8f5b] mb-6 sm:mb-8"
          >
            Clarity is the unfair advantage.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 sm:mb-8"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
          >
            <span className="text-[#1E2849]">YOUR CHILD&apos;S PATH TO</span>
            <br />
            <span className="text-[#1E2849]">THE IVY LEAGUE,</span>
            <br />
            <span className="text-[#af8f5b]">MAPPED OUT.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-[#1E2849]/50 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 font-semibold"
          >
            Your child&apos;s GPA, test scores, extracurriculars, and goals analyzed against real admissions data from <span className="text-[#1E2849] font-bold">150k data points</span> and over <span className="text-[#1E2849] font-bold">1,200+ accepted students</span>. You walk away with a custom grade-by-grade plan: what to take, what to build, what to skip, and exactly when to do it. It&apos;s a detailed roadmap that works.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide text-[#1E2849] mb-10 sm:mb-12"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
          >
            TURN <span className="text-[#af8f5b]">AMBITION</span> INTO <span className="text-[#af8f5b]">ADMISSION.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Button asChild size="lg" className="bg-[#1E2849] hover:bg-[#1E2849]/90 text-white px-8 sm:px-12 py-5 sm:py-6 h-auto text-sm font-bold rounded-none transition-all duration-500 shadow-2xl shadow-[#1E2849]/20 tracking-wide">
              <Link href="/checkout">
                Get My Child&apos;s Roadmap <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#1E2849]/20 text-[#1E2849]/70 hover:text-[#1E2849] hover:border-[#1E2849]/40 px-8 sm:px-10 py-5 sm:py-6 h-auto text-sm font-medium rounded-none transition-all duration-500 bg-transparent">
              <Link href="#methodology">
                How It Works
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-xs sm:text-sm text-[#1E2849]/40 font-medium"
          >
            One-time investment: $497 &middot; Full report in minutes
          </motion.p>
        </motion.div>
      </section>

      {/* ── Section 2: Parent Quote ──────────────────────────────────────── */}
      <section ref={statementRef} className="min-h-screen flex items-center justify-center bg-[#FFFAF0] px-6">
        <motion.div
          style={{ opacity: stmtOpacity, y: stmtY }}
          className="max-w-5xl mx-auto text-center"
        >
          <p
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#1E2849] mb-4 sm:mb-6 uppercase tracking-[0.1em]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
          >
            Every Parent Says<br />The Same Thing:
          </p>
          <p
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.1] text-[#af8f5b]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
          >
            &ldquo;I WISH WE<br />STARTED EARLIER.&rdquo;
          </p>
        </motion.div>
      </section>

      <ClockTransition />

      {/* ── Section 4: Stats ─────────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 sm:gap-20">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── Section 5: How It Works ──────────────────────────────────────── */}
      <section id="methodology" className="relative py-32 sm:py-48 bg-[#FFFAF0] px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 sm:mb-24">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">THE PROCESS</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Three Steps
              <br />
              <span className="text-[#af8f5b]">to Your Child&apos;s Roadmap</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#1b2034" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Take</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">The Assessment</p>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  15 sections covering academics, activities, goals, personality, and more. Takes about 60 minutes to complete.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#313b5c" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Analyze</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">AI Does The Work</p>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  Your child&apos;s profile is benchmarked against 150K+ data points and 1,200+ accepted students.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#47547c" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Receive</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">Your Roadmap</p>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  A 40+ page personalized report with a grade-by-grade plan, college matches, and actionable next steps.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
      </section>

      <ProductDemo />

      {/* ── Section 6: What's In Your Report ──────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 sm:mb-24">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">WHAT YOU GET</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Inside <span className="text-[#af8f5b]">Your Report</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured card: Archetype + Competitiveness Score */}
            <motion.div {...fadeUp} className="sm:col-span-2 rounded-xl p-6 sm:p-8" style={{ backgroundColor: "#1b2034" }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#af8f5b] mb-3">Student Archetype & Competitiveness Score</p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Discover your child&apos;s unique applicant identity &mdash; like &ldquo;Analytical Entrepreneur&rdquo; or &ldquo;Creative Humanitarian&rdquo; &mdash; plus a 0-100 competitiveness score benchmarked against real admits.
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-3">What Your Score Means</p>
                  <div className="space-y-2">
                    {scoreTiers.map((tier, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="font-bold text-white w-14 shrink-0">{tier.range}</span>
                        <span className={`${tier.dot} w-2 h-2 rounded-full mt-1 shrink-0`} />
                        <span className={`font-bold ${tier.color} w-28 shrink-0`}>{tier.tier}</span>
                        <span className="text-white/40 hidden sm:inline">{tier.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Remaining cards */}
            {reportSections.filter(s => !s.featured).map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease }}
                className="rounded-xl p-6 sm:p-8"
                style={{ backgroundColor: "#1b2034" }}
              >
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#af8f5b] mb-3">{section.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{section.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Testimonials ──────────────────────────────────────── */}
      <section className="relative py-32 sm:py-48 bg-[#FFFAF0] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-6 mb-16 sm:mb-20">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Results</p>
              <div className="w-12 h-px bg-[#1E2849]/30 mb-6" />
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                What Families <span className="text-[#af8f5b]">Are Saying</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-[#af8f5b]/30 w-fit" style={{ backgroundColor: "#1b2034" }}>
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#af8f5b] text-[#af8f5b]" />
                ))}
              </div>
              <span className="text-xs font-bold text-white tracking-[0.15em] uppercase">5/5 Rating</span>
            </div>
          </motion.div>
        </div>

        <TestimonialMarquee testimonials={placeholderTestimonials} />
      </section>

      {/* ── Section 8: FAQ ────────────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 sm:mb-24">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">FAQ</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Questions <span className="text-[#af8f5b]">& Answers</span>
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {(faqsList.length > 0 ? faqsList : faqs.map((f, i) => ({ ...f, id: `default-${i}`, display_order: i }))).map((faq, i) => (
              <AccordionItem
                key={faq.id || i}
                value={faq.id || `faq-${i}`}
                className="border border-[#1E2849]/10 rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-sm sm:text-base font-bold text-[#1E2849] hover:text-[#af8f5b] transition-colors py-5 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#1E2849]/60 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Section 9: Final CTA ────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-48 overflow-hidden bg-[#FFFAF0]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Take Action</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase text-[#1E2849] mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Don&apos;t Let Them{" "}
              <span className="text-[#af8f5b]">Fall Behind.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1E2849] mb-12 font-bold leading-relaxed max-w-2xl mx-auto uppercase tracking-[0.15em]">
              The students getting into top schools aren&apos;t smarter. They started with a plan. Give your child the same advantage.
            </p>

            <Button asChild size="lg" className="bg-[#1E2849] hover:bg-[#1E2849]/90 text-white px-8 sm:px-12 py-5 sm:py-6 h-auto text-sm font-bold rounded-none transition-all duration-500 shadow-2xl shadow-[#1E2849]/20 tracking-wide">
              <Link href="/checkout">
                Get My Child&apos;s Roadmap <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default FamiliesHomePage
