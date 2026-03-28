"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Star,
  Brain,
  Target,
  TrendingUp,
  Award,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import Navbar from "@/components/Navbar"
import Footer from "@/components/landing/Footer"
import StatCard, { type Stat } from "@/components/landing/StatCard"
import ClockTransition from "@/components/landing/ClockTransition"
import TestimonialMarquee from "@/components/landing/TestimonialMarquee"
import ProductDemo from "@/components/landing/ProductDemo"
import { fadeUp, ease } from "@/components/landing/animations"

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
    description: "Generate personalized action plans for your students in seconds, saving your counselors hundreds of hours."
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
    quote: "We work with students across India, Dubai, and Singapore who are targeting US universities. The platform understands international curricula \u2014 CBSE, IB, A-Levels \u2014 and tailors the roadmap accordingly. No other tool we've tried gets the nuance of cross-border admissions strategy right."
  },
  {
    name: "Tom Brennan",
    school: "Co-Founder, Northeast Admissions Co.",
    quote: "I've been in admissions consulting for 12 years. The competitiveness scoring is shockingly accurate \u2014 it identified the same gaps I would have, plus a few I missed. We now use the Blueprint report as the starting point for every student engagement. It saves our senior counselors about 4 hours per student."
  },
  {
    name: "Yuki Tanaka",
    school: "Founder, Bright Path Education",
    quote: "Parents in our market are data-driven. When we show them the archetype analysis, the radar chart, and a concrete four-year plan in the first consultation, they sign on the spot. Our conversion rate on discovery calls doubled after we started leading with the Blueprint report."
  },
  {
    name: "Olivia Grant",
    school: "Managing Director, Prestige Prep Partners",
    quote: "We white-labeled the entire platform under our brand. Our clients think we built a proprietary AI system. The custom domain, our logo, our colors \u2014 it's seamless. That perception of innovation has helped us close enterprise contracts with three private schools this year."
  },
  {
    name: "Daniel Reyes",
    school: "Head of Operations, CollegeMap Advisors",
    quote: "Before Blueprint, our bottleneck was the strategy report. Each one took a senior counselor an entire day. Now we generate them in minutes and spend that time on what actually matters \u2014 the one-on-one coaching sessions. Our student satisfaction scores went from 4.1 to 4.8 out of 5."
  },
  {
    name: "Fatima Al-Rashid",
    school: "Founder, Atlas Admissions Consulting",
    quote: "We launched our agency six months ago with zero brand recognition. Blueprint gave us instant credibility. Walking into parent meetings with a 40-page personalized PDF report makes us look like we've been doing this for a decade. We signed 45 families in our first season."
  },
  {
    name: "Robert Chang",
    school: "Partner, Keystone Academic Group",
    quote: "The passion project recommendations alone are worth the price. Three of our students launched initiatives directly from Blueprint's suggestions \u2014 one built a climate research blog that got cited by a local newspaper, and she used it as the centerpiece of her Columbia application. She got in."
  },
  {
    name: "Catherine Dubois",
    school: "Founder, Lumi\u00e8re College Consulting",
    quote: "I run a boutique firm serving 30 families per cycle. Blueprint didn't replace my expertise \u2014 it amplified it. I use the AI report as a diagnostic foundation, then layer my personal insights on top. My students are better prepared, and I can confidently charge premium rates because the deliverables are exceptional."
  },
  {
    name: "Jason Adebayo",
    school: "CEO, Pathway Scholars International",
    quote: "We needed a solution that could handle scale without diluting quality. Blueprint lets our junior counselors deliver the same caliber of strategy that used to require our most experienced staff. We expanded from 200 to 600 students this year and our acceptance rates actually improved."
  },
  {
    name: "Stephanie Nguyen",
    school: "Director, Horizon Education Group",
    quote: "The grade-by-grade roadmap is what parents are willing to pay for. It's not just a list of suggestions \u2014 it's a structured, year-by-year plan with specific milestones. When a parent sees their 9th grader's path mapped all the way to senior year, they understand exactly why our services are worth the investment."
  }
]

const stats: Stat[] = [
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
    answer: "Your student archetype is a unique two-to-three word descriptor that captures your core strengths and identity as an applicant \u2014 for example, 'Analytical Entrepreneur' or 'Creative Humanitarian.' It's derived from your personality traits, interests, and activities, and serves as the foundation for your personalized roadmap."
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
    answer: "Payment is required before submitting the assessment for analysis. You can browse the assessment questions for free to understand what's involved, but generating your personalized roadmap and report requires a completed payment or a valid coupon code."
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
    answer: "Yes. The platform supports students worldwide and tailors recommendations based on your country, curriculum (including CBSE, IB, A-Levels, and US curricula), and target study-abroad destinations. If you're planning to apply to US, UK, or Canadian universities from abroad, the roadmap will reflect those specific admissions requirements."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team by emailing partners@vmotiv8.com. For agency partners, priority support is available through your admin dashboard. We typically respond within 24 hours on business days."
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
    answer: "Agencies have two options. First, you can set your own assessment price through your admin dashboard \u2014 when students go through your white-labeled assessment link, they pay the price you've configured, and funds go directly to your connected Stripe account via Stripe Connect. Second, you can mark assessments as free for your organization and handle billing separately through your own invoicing process. Either way, you have full control over your pricing and revenue."
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
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function B2BPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [faqsList, setFaqsList] = useState<FAQ[]>([])
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([])

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
        const [faqsRes, testimonialsRes] = await Promise.all([
          fetch('/api/cms/faqs'),
          fetch('/api/cms/testimonials')
        ])
        const faqsData = await faqsRes.json()
        const testimonialsData = await testimonialsRes.json()

        if (faqsData.faqs && faqsData.faqs.length > 0) {
          const cmsFaqs = faqsData.faqs as FAQ[]
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
        if (testimonialsData.testimonials) {
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
            The Platform Powering the Top 1% of Admissions Agencies
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 sm:mb-8"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
          >
            <span className="text-[#1E2849]">WHAT IF EVERY STUDENT</span>
            <br />
            <span className="text-[#1E2849]">HAD AN IVY LEAGUE-</span>
            <br />
            <span className="text-[#af8f5b]">DESIGNED FUTURE?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-[#1E2849]/50 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 font-semibold"
          >
            With <span className="text-[#1E2849] font-bold">Blueprint Intelligence</span>, your agency can deliver elite, deeply personalized college strategies at scale, transforming what once took weeks for one student into a seamless experience for hundreds.
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
              <Link href="/get-started">
                Start Now <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#1E2849]/20 text-[#1E2849]/70 hover:text-[#1E2849] hover:border-[#1E2849]/40 px-8 sm:px-10 py-5 sm:py-6 h-auto text-sm font-medium rounded-none transition-all duration-500 bg-transparent">
              <Link href="#methodology">
                How It Works
              </Link>
            </Button>
          </motion.div>
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

      {/* ── Section 3: Stats ─────────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 sm:gap-20">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── Section 4: How It Works ──────────────────────────────────────── */}
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
              <span className="text-[#af8f5b]">to Transform Your Agency</span>
            </h2>
            <p className="mt-6 text-sm sm:text-base text-[#1E2849] max-w-4xl mx-auto uppercase tracking-[0.15em] font-bold">
              From setup to scale in under a week. No technical expertise required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#1b2034" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Deploy</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">Launch in minutes</p>
                <div className="mb-8 w-32 h-32">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                    <style>{`
                      @keyframes b2b_flame1 { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
                      @keyframes b2b_flame2 { 0%,100% { opacity:0.3; } 50% { opacity:0.7; } }
                      @keyframes b2b_flame3 { 0%,100% { opacity:0.5; } 50% { opacity:0.9; } }
                      @keyframes b2b_rocketHover { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
                      .b2b-rocket-body { animation: b2b_rocketHover 2s ease-in-out infinite; }
                      .b2b-flame-1 { animation: b2b_flame1 0.4s ease-in-out infinite; }
                      .b2b-flame-2 { animation: b2b_flame2 0.5s ease-in-out infinite 0.1s; }
                      .b2b-flame-3 { animation: b2b_flame3 0.35s ease-in-out infinite 0.2s; }
                    `}</style>
                    <g className="b2b-rocket-body">
                      <path d="M40 10 C40 10, 28 22, 28 38 C28 43, 30 48, 33 51 L47 51 C50 48, 52 43, 52 38 C52 22, 40 10, 40 10Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                      <path d="M33 51 L27 58 L33 55Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                      <path d="M47 51 L53 58 L47 55Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                      <circle cx="40" cy="32" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                      <line x1="33" y1="51" x2="47" y2="51" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                    </g>
                    <path className="b2b-flame-1" d="M36 52 C36 56, 33 60, 35 64 C37 60, 38 56, 36 52Z" fill="#af8f5b" opacity="0.4" />
                    <path className="b2b-flame-2" d="M40 53 C40 58, 43 62, 41 66 C39 62, 38 58, 40 53Z" fill="#e8a84c" opacity="0.3" />
                    <path className="b2b-flame-3" d="M44 52 C44 56, 47 60, 45 64 C43 60, 42 56, 44 52Z" fill="#ff9944" opacity="0.5" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  White-labeled assessment under your brand. Send to students as part of onboarding or premium strategy sessions.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#313b5c" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Analyze</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">Powered by Intelligence</p>
                <div className="mb-8 w-32 h-32">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                    <style>{`
                      @keyframes b2b_searchOrbit { 0% { transform: rotate(0deg) translateX(4px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(4px) rotate(-360deg); } }
                      .b2b-search-group { transform-origin: 32px 32px; animation: b2b_searchOrbit 4s linear infinite; }
                    `}</style>
                    <g className="b2b-search-group">
                      <circle cx="32" cy="32" r="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                      <line x1="44" y1="44" x2="60" y2="60" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M26 32 L30 36 L38 28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </g>
                  </svg>
                </div>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  Personalized Ivy League roadmaps generated in seconds. Data-driven insights your counselors can act on immediately.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="rounded-xl p-8 sm:p-10 h-full flex flex-col" style={{ backgroundColor: "#47547c" }}>
                <h3 className="text-4xl sm:text-5xl font-bold mb-3 uppercase text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Scale</h3>
                <p className="text-sm font-bold mb-8 tracking-[0.15em] uppercase text-white">Grow without limits</p>
                <div className="mb-8 w-32 h-32">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                    <style>{`
                      @keyframes b2b_growLine { 0% { stroke-dashoffset: 80; } 50% { stroke-dashoffset: 0; } 50.01% { stroke-dashoffset: 80; } 100% { stroke-dashoffset: 0; } }
                      @keyframes b2b_arrowPulse { 0%,40% { opacity: 0; transform: translate(0,0); } 50% { opacity: 1; transform: translate(0,0); } 90% { opacity: 1; transform: translate(3px,-3px); } 100% { opacity: 0; transform: translate(3px,-3px); } }
                      .b2b-grow-line { stroke-dasharray: 80; animation: b2b_growLine 3s ease-in-out infinite; }
                      .b2b-grow-arrow { animation: b2b_arrowPulse 3s ease-in-out infinite; }
                    `}</style>
                    <line x1="10" y1="66" x2="70" y2="66" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <line x1="10" y1="66" x2="10" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <path className="b2b-grow-line" d="M14 60 C22 56, 28 50, 38 42 C46 34, 52 24, 64 14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <g className="b2b-grow-arrow">
                      <path d="M56 14 L64 14 L64 22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>
                <p className="text-sm sm:text-base leading-relaxed mt-auto font-bold text-white">
                  Serve 10x more students without adding headcount. Turn every interaction into a premium, high-margin service.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
      </section>

      <ProductDemo />

      {/* ── Section 5: Features ──────────────────────────────────────────── */}
      <section id="services" className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 sm:mb-24">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Platform</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              <span className="text-[#1E2849]">Built </span>
              <span className="text-[#af8f5b]">for Scale</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp}>
            <div className="grid sm:grid-cols-2" style={{ borderColor: '#1E2849' }}>
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-8 sm:p-12"
                  style={{
                    borderBottom: i < 2 ? '2px solid #af8f5b' : 'none',
                    borderRight: i % 2 === 0 ? '2px solid #af8f5b' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#af8f5b] uppercase leading-tight" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                      {feature.title}
                    </h3>
                    <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#af8f5b] shrink-0" strokeWidth={1.2} />
                  </div>
                  <p className="text-sm sm:text-base text-[#1E2849]/70 leading-relaxed font-bold">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 6: Comparison ────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 bg-[#FFFAF0] px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 sm:mb-24">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Why Switch</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              <span className="text-[#af8f5b]">The </span>
              <span className="text-[#1E2849]">Difference</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease }}
              className="p-8 sm:p-12 rounded-xl bg-[#f0e8d9] text-center"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E2849] mb-8 uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Traditional Agency</h3>
              <div className="space-y-0">
                {["Inconsistent profile analysis", "Manual, time-consuming roadmaps built on guesswork", "No white-label reporting", "Slow student onboarding", "Limited scalability", "No predictive modeling"].map((item, i) => (
                  <div key={i}>
                    <p className="py-4 text-base sm:text-lg text-[#1E2849] font-bold">{item}</p>
                    {i < 5 && <div className="w-10 h-px bg-[#af8f5b] mx-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8">
                <p className="text-2xl sm:text-3xl font-bold text-[#1E2849] uppercase tracking-[0.1em] mb-1" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Profit Margin</p>
                <p className="text-4xl sm:text-5xl text-[#1E2849] font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Low</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease }}
              className="p-8 sm:p-12 rounded-xl bg-[#af8f5b] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[#1E2849] px-4 py-2 rounded-bl-lg">
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Recommended</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E2849] mb-8 uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Blueprint-Powered</h3>
              <div className="space-y-0">
                {["Data-driven profile analysis", "Automated Ivy League-level roadmaps", "Full white-label reporting", "Instant student onboarding", "Unlimited scalability", "Predictive success modeling"].map((item, i) => (
                  <div key={i}>
                    <p className="py-4 text-base sm:text-lg text-[#1E2849] font-bold">{item}</p>
                    {i < 5 && <div className="w-10 h-px bg-[#1E2849]/30 mx-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8">
                <p className="text-2xl sm:text-3xl font-bold text-[#1E2849] uppercase tracking-[0.1em] mb-1" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>Profit Margin</p>
                <p className="text-4xl sm:text-5xl text-[#1E2849] font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>High</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Deep Dive ─────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-48 bg-[#FFFAF0] px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 sm:gap-24 items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Strategic Intelligence</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mb-6" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849] leading-tight mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              We look beyond the{" "}
              <span className="text-[#af8f5b]">surface level.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1E2849] max-w-lg uppercase tracking-[0.15em] font-bold leading-relaxed mb-12">
              Our 15-section methodology is designed to uncover the hidden gems in your students&apos; profiles. We automate the dimensions that standard counselors often overlook.
            </p>
            <Button asChild variant="outline" className="border-[#1E2849] text-[#1E2849] hover:bg-[#1E2849] hover:text-white rounded-full px-10 py-6 text-sm font-bold tracking-[0.15em] uppercase transition-all duration-500 bg-transparent">
              <Link href="/get-started">Get Started</Link>
            </Button>
          </motion.div>

          <div className="grid gap-6">
            {sampleQuestions.map((section, i) => (
              <div
                key={i}
                className="p-8 sm:p-10 rounded-xl border border-[#af8f5b]/30 hover:border-[#af8f5b]/60 transition-colors duration-300 shadow-sm hover:shadow-lg hover:shadow-[#af8f5b]/5"
                style={{ backgroundColor: "#1b2034" }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#af8f5b]/20 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-[#af8f5b]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                    {section.category}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {section.questions.map((q, j) => (
                    <li key={j} className="flex items-start gap-4 group">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#af8f5b] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm text-white/50 font-medium group-hover:text-white/70 transition-colors duration-500">{q}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Testimonials ──────────────────────────────────────── */}
      <section id="testimonials" className="relative py-32 sm:py-48 bg-[#FFFAF0] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-6 mb-16 sm:mb-20">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Agency Success</p>
              <div className="w-12 h-px bg-[#1E2849]/30 mb-6" />
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                What Agencies <span className="text-[#af8f5b]">Say</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-[#af8f5b]/30 w-fit" style={{ backgroundColor: "#1b2034" }}>
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#af8f5b] text-[#af8f5b]" />
                ))}
              </div>
              <span className="text-xs font-bold text-white tracking-[0.15em] uppercase">4.9/5 Rating</span>
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

      {/* ── Section 10: Final CTA ────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-48 overflow-hidden bg-[#FFFAF0]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#af8f5b]/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Take Action</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase text-[#1E2849] mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Ready to{" "}
              <span className="text-[#af8f5b]">Scale?</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1E2849] mb-12 font-bold leading-relaxed max-w-2xl mx-auto uppercase tracking-[0.15em]">
              Join the elite network of tutoring agencies and educational consultancies using The Student Blueprint to deliver world-class admissions strategy.
            </p>

            <div className="w-full max-w-2xl mx-auto mb-12 rounded-xl overflow-hidden border border-[#af8f5b]/20 shadow-2xl shadow-[#1b2034]/10" style={{ backgroundColor: "#1b2034" }}>
              <div className="px-6 pt-6 pb-2 text-center">
                <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-2">Get Started</p>
                <div className="w-8 h-px bg-white/20 mx-auto" />
              </div>
              <iframe
                src="https://api.leadconnectorhq.com/widget/survey/0h1BJKf73z6pEylD4LW5"
                style={{ border: "none", width: "100%", minHeight: "400px" }}
                scrolling="no"
                id="0h1BJKf73z6pEylD4LW5"
                title="survey"
              />
              <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
            </div>

            <div className="mt-16 sm:mt-20 pt-12 border-t border-[#af8f5b]/20 flex flex-wrap justify-center gap-8 sm:gap-12 text-xs text-[#1E2849] font-bold tracking-[0.15em] uppercase">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#af8f5b]" /> Secure Integration
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#af8f5b]" /> Scalable Infrastructure
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#af8f5b]" /> White-Labeled Reports
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default B2BPage
