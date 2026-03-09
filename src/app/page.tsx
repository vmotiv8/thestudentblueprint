"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useAnimationControls, useMotionValue, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  GraduationCap, 
  Target, 
  Clock, 
  ChevronLeft,
  ChevronRight, 
  Star, 
  Brain,
  TrendingUp,
  Award,
  Heart,
  Trophy,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lightbulb,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    name: "Elite Academy",
    school: "Tutoring Agency",
    quote: "TheStudentBlueprint has transformed our consulting workflow. We can now deliver Ivy League level strategies to 10x more students."
  },
  {
    name: "Global Scholars",
    school: "Educational Consultancy",
    quote: "The automated roadmap is our most popular premium feature. Our revenue per student has increased by 40%."
  },
  {
    name: "Prestige Prep",
    school: "Admissions Boutique",
    quote: "The depth of the profile analysis is incredible. It finds strengths in students that our manual process used to miss."
  }
]

const stats = [
  { number: "10x", label: "Counseling Efficiency", sub: "Automated report generation" },
  { number: "40%", label: "Avg. Revenue Increase", sub: "Per student enrollment" },
  { number: "100+", label: "Partner Agencies", sub: "Scaling their admissions success" }
]

const faqs = [
  {
    question: "How does this integrate with my tutoring agency?",
    answer: "Our platform is designed to be a plug-and-play solution. You can send the assessment link to your students as part of their onboarding or as a premium strategy session. The results can be white-labeled to match your agency's branding."
  },
  {
    question: "Is there an agency partner program?",
    answer: "Yes. We offer bulk pricing and enterprise licenses for tutoring agencies and schools. Contact us to learn about our agency tiers and revenue-sharing models."
  },
  {
    question: "Do my counselors need special training?",
    answer: "No. The platform handles the heavy lifting of data analysis. Your counselors can use the generated roadmap as a structured foundation for their 1-on-1 sessions, making them more effective and authoritative."
  },
  {
    question: "Can I customize the assessment questions?",
    answer: "Enterprise partners can request custom modules to align with their specific counseling methodology or regional requirements."
  },
  {
    question: "How long does it take to set up?",
    answer: "You can start using the platform with your students today. Setting up a full agency account with white-labeling typically takes less than 24 hours."
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

function TestimonialMarquee({ testimonials: initialTestimonials }: { testimonials: Testimonial[] }) {
  const [isPaused, setIsPaused] = useState(false)
  const x = useMotionValue(0)
  const controls = useRef<any>(null)
  const doubledTestimonials = [...initialTestimonials, ...initialTestimonials, ...initialTestimonials]
  
  const startMarquee = () => {
    if (controls.current) controls.current.stop()
    
    const currentX = x.get()
    const targetX = -33.333
    // Speed: 33.333% in 50 seconds => 0.666% per second
    const remainingDistance = currentX <= targetX ? 33.333 + currentX : Math.abs(targetX - currentX)
    const duration = (remainingDistance / 33.333) * 50

    controls.current = animate(x, targetX, {
      duration: duration,
      ease: "linear",
      onComplete: () => {
        x.set(0)
        startMarquee()
      }
    })
  }

  useEffect(() => {
    startMarquee()
    return () => controls.current?.stop()
  }, [initialTestimonials])

  const scroll = (direction: 'left' | 'right') => {
    if (controls.current) controls.current.stop()
    setIsPaused(true)
    
    const currentX = x.get()
    const step = 5 // 5% move
    let targetX = direction === 'left' ? currentX + step : currentX - step
    
    // Wrap around logic for manual scroll
    if (targetX > 0) targetX = -33.333 + targetX
    if (targetX < -33.333) targetX = targetX + 33.333

    animate(x, targetX, {
      duration: 0.5,
      ease: "easeOut",
      onComplete: () => {
        if (!isPaused) startMarquee()
      }
    })
  }

  return (
    <div className="relative group px-4 sm:px-12">
      {/* Overlay Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-r from-white via-white to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-48 bg-gradient-to-l from-white via-white to-transparent z-20 pointer-events-none" />

      {/* Manual Navigation Arrows */}
      <button 
        className="absolute left-1 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a192f] hover:bg-[#c9a227] hover:text-white hover:border-[#c9a227] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button 
        className="absolute right-1 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border border-[#e5e0d5] flex items-center justify-center text-[#0a192f] hover:bg-[#c9a227] hover:text-white hover:border-[#c9a227] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="relative overflow-hidden py-12">
        <motion.div
          className="flex"
          style={{ x: useTransform(x, v => `${v}%`) }}
          onMouseEnter={() => {
            setIsPaused(true)
            controls.current?.stop()
          }}
          onMouseLeave={() => {
            setIsPaused(false)
            startMarquee()
          }}
        >
          {doubledTestimonials.map((t, i) => (
            <div key={i} className="flex-shrink-0 px-3 group/card">
              <motion.div 
                className={`w-[280px] sm:w-[380px] bg-[#faf8f3] border border-[#e5e0d5] p-6 sm:p-8 transition-all duration-700 group-hover/card:border-[#c9a227]/30 group-hover/card:shadow-xl group-hover/card:shadow-[#c9a227]/5 ${i % 3 === 1 ? 'scale-105 shadow-lg z-10' : 'scale-100'}`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-6 relative">
                  <div className="absolute -top-6 -left-4 text-7xl font-display text-[#c9a227]/10">&ldquo;</div>
                  <p className="text-sm sm:text-base text-[#0a192f] leading-relaxed font-light italic relative z-10">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="pt-6 border-t border-[#e5e0d5]">
                  <p className="text-[10px] sm:text-xs font-bold text-[#0a192f] uppercase tracking-[0.3em]">{t.name}</p>
                  <p className="text-[9px] sm:text-[11px] text-[#c9a227] font-medium uppercase tracking-[0.3em] mt-2">{t.school}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [faqsList, setFaqsList] = useState<FAQ[]>([])
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Parallax effects
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    
    // Fetch CMS content
    const fetchCMS = async () => {
      try {
        const [faqsRes, testimonialsRes] = await Promise.all([
          fetch('/api/cms/faqs'),
          fetch('/api/cms/testimonials')
        ])
        const faqsData = await faqsRes.json()
        const testimonialsData = await testimonialsRes.json()
        
        if (faqsData.faqs) setFaqsList(faqsData.faqs)
        if (testimonialsData.testimonials) setTestimonialsList(testimonialsData.testimonials)
      } catch (error) {
        console.error("Error fetching CMS content:", error)
      }
    }
    fetchCMS()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans selection:bg-[#c9a227]/30">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-[#0a192f]/98 backdrop-blur-xl py-4 border-b border-white/5 shadow-2xl" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-700 group-hover:rotate-[360deg]">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className={`font-display text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-300 ${isScrolled ? "text-white" : "text-white"}`} style={{ fontFamily: "'Playfair Display', serif" }}>
              TheStudentBlueprint
            </span>
            <div className="px-1.5 sm:py-0.5 bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-full hidden xs:block">
              <span className="text-[8px] sm:text-[10px] font-bold text-[#c9a227] uppercase tracking-widest">Beta</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {["Services", "Testimonials", "Methodology", "FAQ"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-white/60 hover:text-[#c9a227] text-xs font-bold tracking-[0.3em] uppercase transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/admin/login" className="text-white/50 hover:text-white text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-colors">
              Login
            </Link>
            <Link href="/admin/login" className="hidden sm:block">
              <Button className="bg-[#c9a227] hover:bg-white hover:text-[#0a192f] text-[#0a192f] font-bold text-[10px] sm:text-sm px-4 sm:px-8 py-3 sm:py-6 h-auto rounded-none border border-[#c9a227] transition-all duration-700 tracking-[0.2em] sm:tracking-[0.3em] uppercase shadow-lg shadow-[#c9a227]/10">
                Get Started
              </Button>
            </Link>
            <button 
              className="lg:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-[#0a192f] border-b border-white/10 py-8 px-6 shadow-2xl z-50"
            >
              <div className="flex flex-col gap-6">
                {["Services", "Testimonials", "Methodology", "FAQ"].map((item) => (
                  <Link 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="text-white/80 hover:text-[#c9a227] text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <Link 
                  href="/admin/login" 
                  className="text-white/80 hover:text-[#c9a227] text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#c9a227] text-[#0a192f] font-bold py-4 rounded-none uppercase tracking-[0.2em]">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section ref={containerRef} className="relative h-screen min-h-[600px] sm:min-h-[800px] flex items-center overflow-hidden bg-[#1a365d]">
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000" 
            alt="Library" 
            fill 
            className="object-cover opacity-30 scale-110 grayscale-[30%]"
            priority
          />
          <div className="absolute inset-0 bg-[#1a365d]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#112240] via-[#112240]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#112240] to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-24 items-center">
          <motion.div style={{ y: contentY, opacity, scale: heroScale }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="inline-flex items-center gap-4 text-[#c9a227] mb-8"
            >
              <div className="h-[1px] w-16 bg-[#c9a227]" />
              <span className="text-xs font-bold tracking-[0.5em] uppercase">For Educational Organizations</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-4xl xs:text-5xl md:text-7xl font-medium text-white mb-8 leading-[1.1]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Scale Your <br />
              <span className="text-[#c9a227] italic">Tutoring Agency</span> <br />
              Revenue
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed font-light"
            >
              The premium infrastructure for elite admissions. Empower your counselors with data-driven strategy and deliver personalized Ivy League roadmaps to every student in your agency.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Link href="/admin/login">
                <Button size="lg" className="bg-[#c9a227] hover:bg-white hover:text-[#0a192f] text-[#0a192f] px-8 sm:px-12 py-5 sm:py-8 h-auto text-xs sm:text-sm font-bold rounded-none border border-[#c9a227] transition-all duration-700 tracking-[0.2em] sm:tracking-[0.4em] uppercase shadow-2xl shadow-[#c9a227]/20">
                  Get Started <ArrowRight className="ml-4 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-10 bg-[#c9a227]/10 blur-[120px] rounded-full" />
            <div className="relative bg-[#0a192f]/60 backdrop-blur-3xl border border-white/5 p-10 rounded-none">
              <div className="mb-8">
                <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">Agency Dashboard</span>
                <h3 className="text-2xl text-white mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>Platform Preview</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: Briefcase, text: "Organization Management", sub: "Manage counselors & students" },
                  { icon: TrendingUp, text: "Revenue Analytics", sub: "Track high-margin growth" },
                  { icon: ShieldCheck, text: "White-Label Branding", sub: "Your brand, our infrastructure" },
                  { icon: Award, text: "Success Benchmarking", sub: "Ivy League admission data" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="flex items-start gap-5"
                  >
                    <div className="w-10 h-10 rounded-none border border-[#c9a227]/20 bg-[#c9a227]/5 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-[#c9a227]" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-white tracking-wide">{item.text}</p>
                      <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.4em] text-white/30 uppercase">Enterprise Solution</p>
                  <p className="text-2xl text-white mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>Custom Pricing <span className="text-xs font-sans text-white/20 ml-3 font-light">Per Student</span></p>
                </div>
                <div className="flex items-center gap-3 px-3 py-1.5 bg-[#c9a227]/10 border border-[#c9a227]/20">
                  <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
                  <span className="text-[11px] font-bold text-[#c9a227] uppercase tracking-[0.3em]">Verified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0a192f] py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 p-8 sm:p-20 grid md:grid-cols-3 gap-10 sm:gap-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl sm:text-5xl text-white mb-3 group-hover:text-[#c9a227] transition-colors duration-700" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.number}</div>
                <div className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#c9a227] mb-2">{stat.label}</div>
                <div className="text-[10px] sm:text-xs text-white/40 italic font-light tracking-wide">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="methodology" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">The Agency Infrastructure</span>
            <h2 className="text-3xl sm:text-5xl text-[#0a192f] mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>Enterprise-Grade Success</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e0d5] border border-[#e5e0d5]">
            {features.map((feature, i) => (
              <div key={i} className="bg-[#faf8f3] p-8 sm:p-12 hover:bg-white transition-all duration-700 group cursor-default">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-[#0a192f]/5 flex items-center justify-center mb-8 group-hover:bg-[#0a192f] transition-all duration-700">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0a192f] group-hover:text-[#c9a227] transition-colors duration-700" />
                </div>
                <h3 className="text-lg sm:text-xl text-[#0a192f] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{feature.title}</h3>
                <p className="text-sm sm:text-base text-[#0a192f]/60 leading-relaxed font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 bg-[#faf8f3] border-y border-[#e5e0d5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">Premium Value</span>
            <h2 className="text-3xl sm:text-4xl text-[#0a192f] mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>The Future of Admissions Consulting</h2>
          </div>

          <div className="overflow-x-auto border border-[#e5e0d5] shadow-2xl scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[600px]">
              <thead>
                  <tr className="bg-[#0a192f] text-white">
                    <th className="p-3 sm:p-8 text-[9px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">Capability</th>
                    <th className="p-3 sm:p-8 text-[9px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase border-x border-white/10">Traditional Agency</th>
                    <th className="p-3 sm:p-8 text-[9px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#c9a227]">TheStudentBlueprint Powered Agency</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {[
                    { label: "Data-Driven Profile Analysis", private: "Inconsistent", blueprint: true },
                    { label: "Automated Ivy League Roadmaps", private: false, blueprint: true },
                    { label: "White-Labeled Reporting", private: "Manual", blueprint: true },
                    { label: "Scalable Student Onboarding", private: "Slow", blueprint: true },
                    { label: "Counselor Efficiency Tools", private: false, blueprint: true },
                    { label: "Predictive Success Modeling", private: false, blueprint: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-[#e5e0d5] hover:bg-[#faf8f3] transition-colors">
                      <td className="p-3 sm:p-8 text-[10px] sm:text-sm font-medium text-[#0a192f] leading-tight">{row.label}</td>
                      <td className="p-3 sm:p-8 text-[10px] sm:text-sm text-[#0a192f]/40 font-light border-x border-[#e5e0d5]">
                        {typeof row.private === 'boolean' ? (row.private ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a192f]/20" /> : "—") : row.private}
                      </td>
                      <td className="p-3 sm:p-8 text-[10px] sm:text-sm font-bold text-[#0a192f] bg-[#c9a227]/5">
                        {typeof row.blueprint === 'boolean' ? (row.blueprint ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a227]" /> : "—") : row.blueprint}
                      </td>
                    </tr>
                  ))}
                <tr className="border-t-2 border-[#0a192f]">
                  <td className="p-3 sm:p-8 text-sm sm:text-lg font-bold text-[#0a192f]" style={{ fontFamily: "'Playfair Display', serif" }}>Profit Margin</td>
                  <td className="p-3 sm:p-8 text-lg sm:text-2xl text-[#0a192f]/40 font-light border-x border-[#e5e0d5] italic">Low (Manual)</td>
                  <td className="p-3 sm:p-8 text-xl sm:text-3xl font-bold text-[#c9a227] bg-[#c9a227]/10" style={{ fontFamily: "'Playfair Display', serif" }}>High (Automated)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-[10px] sm:text-xs text-[#0a192f]/40 italic">Upgrade your agency infrastructure and capture more market share.</p>
        </div>
      </section>

      <section id="services" className="py-20 sm:py-32 bg-[#0a192f] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 sm:gap-24 items-center">
          <div>
            <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">Strategic Intelligence</span>
            <h2 className="text-3xl sm:text-5xl text-white mt-6 mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>We look beyond the <br /><span className="italic text-[#c9a227]">surface level.</span></h2>
            <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed mb-12 max-w-lg">
              Our 15-section methodology is designed to uncover the hidden gems in your students' profiles. We automate the dimensions that standard counselors often overlook.
            </p>
            
            <Link href="/admin/login">
              <Button variant="outline" className="border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#0a192f] rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase transition-all duration-700">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {sampleQuestions.map((section, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 10 }}
                className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 sm:p-10 hover:border-[#c9a227]/30 transition-all duration-700"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-10 h-10 rounded-none bg-[#c9a227]/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-[#c9a227]" />
                  </div>
                  <h3 className="text-lg sm:text-xl text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>{section.category}</h3>
                </div>
                <ul className="space-y-4">
                  {section.questions.map((q, j) => (
                    <li key={j} className="flex items-start gap-5 group">
                      <div className="mt-2 w-1.5 h-1.5 rounded-none bg-[#c9a227] shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" />
                      <p className="text-xs sm:text-sm text-white/30 italic font-light group-hover:text-white/80 transition-colors duration-500">{q}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">Agency Success</span>
              <h2 className="text-3xl sm:text-5xl text-[#0a192f] mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>Voices of <br />Elite Partners</h2>
            </div>
            <div className="flex items-center gap-4 bg-[#faf8f3] px-6 py-4 border border-[#e5e0d5] w-fit">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#c9a227] text-[#c9a227]" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#0a192f] tracking-[0.3em] uppercase">4.9/5 Agency Rating</span>
            </div>
          </div>
        </div>

        <TestimonialMarquee testimonials={testimonialsList.length > 0 ? testimonialsList : (testimonials as any)} />
      </section>

      <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 bg-[#0a192f]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">Have Questions?</span>
            <h2 className="text-3xl sm:text-5xl text-white mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>FAQ</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {(faqsList.length > 0 ? faqsList : faqs).map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="bg-white/5 border border-white/5 px-6 sm:px-8 data-[state=open]:border-[#c9a227]/30 transition-all duration-500"
              >
                <AccordionTrigger className="text-white hover:text-[#c9a227] text-left py-6 text-base sm:text-lg font-medium hover:no-underline transition-colors duration-500">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/40 pb-8 text-sm sm:text-base leading-relaxed font-light">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 sm:py-32 bg-[#faf8f3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#c9a227]">The Competitive Edge</span>
          <h2 className="text-3xl sm:text-5xl text-[#0a192f] mt-6 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Why Scale <span className="italic">Now?</span></h2>
          <div className="bg-white border border-[#e5e0d5] p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#c9a227]" />
            <p className="text-lg sm:text-xl text-[#0a192f]/80 leading-relaxed font-light italic">
              "The admissions landscape has changed. Manual consulting is no longer enough to stay competitive. Agencies that leverage data-driven infrastructure are seeing 10x efficiency gains and significantly higher student success rates. Don't let your methodology fall behind the technology curve."
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-32 overflow-hidden bg-[#0a192f]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000" 
            alt="Study Hall" 
            fill 
            className="object-cover opacity-10 grayscale scale-110"
          />
          <div className="absolute inset-0 bg-[#0a192f]/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-[#c9a227] mx-auto mb-10 opacity-50" />
          <h2 className="text-3xl sm:text-5xl text-white mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Scale Your Agency?</h2>
          <p className="text-base sm:text-lg text-white/50 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Join the elite network of tutoring agencies and educational consultancies using TheStudentBlueprint to deliver world-class admissions strategy.
          </p>
          
          <Link href="/admin/login">
            <Button size="lg" className="bg-[#c9a227] hover:bg-white hover:text-[#0a192f] text-[#0a192f] px-8 sm:px-16 py-5 sm:py-10 h-auto text-[10px] sm:text-xs font-bold rounded-none border border-[#c9a227] transition-all duration-700 tracking-[0.3em] sm:tracking-[0.5em] uppercase shadow-2xl shadow-[#c9a227]/20">
              Get Started
            </Button>
          </Link>
          
          <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-white/5 flex flex-wrap justify-center gap-6 sm:gap-12 text-[9px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.4em] text-white/30 uppercase">
            <div className="flex items-center gap-2 sm:gap-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a227] opacity-50" /> Secure Integration
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a227] opacity-50" /> Scalable Infrastructure
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a227] opacity-50" /> White-Labeled Reports
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a192f] py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-xl sm:text-2xl text-white font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>TheStudentBlueprint</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
              <Link href="/privacy" className="text-[10px] sm:text-xs font-bold text-white/30 hover:text-[#c9a227] uppercase tracking-[0.3em] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[10px] sm:text-xs font-bold text-white/30 hover:text-[#c9a227] uppercase tracking-[0.3em] transition-colors">
                Terms & Conditions
              </Link>
            </div>

            <div className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] text-center">
              © {new Date().getFullYear()} TheStudentBlueprint Admissions Consulting
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
