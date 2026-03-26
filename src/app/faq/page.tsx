"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

// ─── Fallback FAQs ──────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [faqsList, setFaqsList] = useState<FAQ[]>([])

  useEffect(() => {
    const fetchFaqs = async () => {
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
        console.error("Error fetching FAQs:", error)
      }
    }
    fetchFaqs()
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFAF0]">
      {/* Nav */}
      <nav className="bg-[#FFFAF0] border-b border-[#af8f5b]/10 py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="font-bold text-[#1E2849]">TheStudent</span><span className="font-semibold text-[#af8f5b]">Blueprint</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-[#af8f5b] font-bold uppercase tracking-[0.15em] hover:text-[#1E2849] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative py-20 sm:py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#af8f5b]/[0.02] rounded-full blur-[200px]" />

        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">FAQ</p>
            <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
              Questions<span className="text-[#af8f5b]">?</span>
            </h1>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {(faqsList.length > 0 ? faqsList : faqs).map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-[#af8f5b]/20 rounded-xl px-6 sm:px-8 data-[state=open]:border-[#af8f5b]/40 transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-[#af8f5b]/5"
                style={{ backgroundColor: "#1b2034" }}
              >
                <AccordionTrigger className="text-white/80 hover:text-white text-left py-6 text-base sm:text-lg font-bold hover:no-underline transition-colors duration-300 uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/50 pb-8 text-sm sm:text-base leading-relaxed font-medium">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#af8f5b]/20" style={{ backgroundColor: "#1b2034" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs text-white/35 tracking-[0.15em] uppercase font-bold">
            &copy; {new Date().getFullYear()} The Student Blueprint
          </div>
          <div className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium mt-1">
            Powered by VMotiv8
          </div>
        </div>
      </footer>
    </div>
  )
}
