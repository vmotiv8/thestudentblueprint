"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeUp } from "./animations"
import {
  Sparkles,
  Calendar,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ClipboardList,
  DollarSign,
  School,
  Check,
  ArrowRight,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const demoTabs = [
  {
    id: "archetype",
    label: "Archetype",
    icon: Sparkles,
    content: {
      title: "Entrepreneurial Technologist",
      score: 78,
      scoreLabel: "Competitive",
      summary: "Your personalized college roadmap is ready. Based on your profile, we've identified your unique strengths and created a customized action plan.",
      detail: "Solid extracurriculars and good academics, but developing a national-level \"spike\" would strengthen your profile.",
      hint: "Think: Active in 3-4 clubs with some leadership, 1350+ SAT, good GPA, but lacking a standout achievement that makes admissions officers take notice."
    }
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: Calendar,
    content: {
      phases: [
        { phase: "Immediate (0-3 months)", items: ["Launch a tech blog or podcast", "Join or start a robotics/CS club", "Begin SAT prep targeting 1500+"] },
        { phase: "Short-term (3-6 months)", items: ["Apply to summer research programs", "Start a community tech initiative", "Take AP Computer Science A"] },
        { phase: "Medium-term (6-12 months)", items: ["Compete in science olympiad or hackathons", "Secure a mentorship with a professor", "Publish a research paper or tech project"] },
      ]
    }
  },
  {
    id: "gaps",
    label: "Gaps",
    icon: AlertCircle,
    content: {
      gaps: [
        { area: "Research Experience", severity: "high", action: "No formal research. Reach out to local university professors in CS or engineering for summer research opportunities." },
        { area: "National Recognition", severity: "high", action: "Compete in USACO, Science Olympiad, or submit to Regeneron STS to build national-level credentials." },
        { area: "Community Impact", severity: "medium", action: "Start a tech literacy program at a local community center to demonstrate leadership and social impact." },
        { area: "Published Work", severity: "medium", action: "Write and publish articles on Medium or a personal blog. Consider submitting to the Concord Review." },
      ]
    }
  },
  {
    id: "projects",
    label: "Projects",
    icon: Lightbulb,
    content: {
      projects: [
        { name: "AI Accessibility Tool", desc: "Build an AI-powered app that helps visually impaired students navigate campus resources. Combines CS skills with social impact.", time: "3-4 months", impact: "High" },
        { name: "Local Business Tech Consulting", desc: "Offer free tech consulting to small businesses in your community. Document case studies for your portfolio.", time: "Ongoing", impact: "High" },
        { name: "Research Blog & Newsletter", desc: "Start a weekly newsletter analyzing emerging tech trends for a student audience. Build a readership of 500+.", time: "Ongoing", impact: "Medium" },
      ]
    }
  },
  {
    id: "academics",
    label: "Academics",
    icon: BookOpen,
    content: {
      courses: [
        { year: "Junior Year", recommended: ["AP Computer Science A", "AP Calculus BC", "AP Physics C", "AP English Language", "AP US History"] },
        { year: "Senior Year", recommended: ["AP Computer Science Principles", "AP Statistics", "AP Physics C: E&M", "AP Literature", "Multivariable Calculus (dual enrollment)"] },
      ],
      gpaTarget: "3.9+ unweighted",
      note: "Focus on STEM rigor while maintaining humanities balance. Admissions officers want to see intellectual curiosity across disciplines."
    }
  },
  {
    id: "testing",
    label: "Testing",
    icon: ClipboardList,
    content: {
      current: { sat: 1350, goal: 1500 },
      plan: [
        { test: "SAT", target: "1500+", timeline: "Retake by October of junior year" },
        { test: "AP Computer Science A", target: "5", timeline: "May of junior year" },
        { test: "AP Calculus BC", target: "5", timeline: "May of junior year" },
        { test: "SAT Math II", target: "780+", timeline: "November of junior year" },
        { test: "SAT Physics", target: "760+", timeline: "June of junior year" },
      ]
    }
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: DollarSign,
    content: {
      matches: [
        { name: "National Merit Scholarship", amount: "$2,500 - Full Tuition", match: 72, deadline: "October" },
        { name: "Regeneron STS", amount: "$25,000 - $250,000", match: 58, deadline: "November" },
        { name: "Coca-Cola Scholars", amount: "$20,000", match: 65, deadline: "October" },
        { name: "Amazon Future Engineer", amount: "$40,000", match: 81, deadline: "January" },
        { name: "Elks Most Valuable Student", amount: "$4,000 - $50,000", match: 70, deadline: "November" },
      ]
    }
  },
  {
    id: "colleges",
    label: "Colleges",
    icon: School,
    content: {
      tiers: [
        { tier: "Reach", schools: [{ name: "MIT", match: 62 }, { name: "Stanford", match: 58 }, { name: "Carnegie Mellon", match: 68 }] },
        { tier: "Target", schools: [{ name: "Georgia Tech", match: 79 }, { name: "UIUC", match: 82 }, { name: "Purdue", match: 85 }] },
        { tier: "Safety", schools: [{ name: "Virginia Tech", match: 91 }, { name: "RPI", match: 88 }, { name: "RIT", match: 93 }] },
      ]
    }
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoArchetype({ data }: { data: any }) {
  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-8">
      <div>
        <p className="text-white/40 text-sm mb-2">Congratulations,</p>
        <h3 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>John Smith</h3>
        <span className="inline-block px-5 py-2 rounded-full bg-[#af8f5b] text-[#1b2034] font-bold text-sm uppercase tracking-[0.1em]">
          {data.title}
        </span>
        <p className="text-white/50 mt-6 leading-relaxed text-sm sm:text-base">
          {data.summary}
        </p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
        <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Comp. Score</p>
        <p className="text-6xl font-bold text-[#af8f5b]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{data.score}</p>
        <p className="text-xs text-white/40 mt-1">out of 100</p>
        <div className="w-12 h-px bg-white/10 mx-auto my-3" />
        <p className="text-sm font-bold text-[#af8f5b] uppercase tracking-[0.15em] mb-3">{data.scoreLabel}</p>
        <p className="text-xs text-white/40 leading-relaxed">{data.detail}</p>
        <div className="w-12 h-px bg-white/10 mx-auto my-3" />
        <p className="text-xs text-[#af8f5b]/60 leading-relaxed italic">{data.hint}</p>
      </div>
    </div>
  )
}

function DemoRoadmap({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Your Personalized <span className="text-[#af8f5b]">Roadmap</span>
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {data.phases.map((p: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <p className="text-xs font-bold text-[#af8f5b] uppercase tracking-[0.15em] mb-4">{p.phase}</p>
            <ul className="space-y-3">
              {p.items.map((item: string, j: number) => (
                <li key={j} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#af8f5b] mt-1.5 shrink-0" />
                  <span className="text-sm text-white/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoGaps({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Gap <span className="text-[#af8f5b]">Analysis</span>
      </h3>
      <div className="space-y-3">
        {data.gaps.map((g: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5 flex gap-4 items-start">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${g.severity === "high" ? "bg-red-400" : "bg-amber-400"}`} />
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-[0.1em] mb-1">{g.area}</p>
              <p className="text-sm text-white/50 leading-relaxed">{g.action}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded shrink-0 ${
              g.severity === "high" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400"
            }`}>{g.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoProjects({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Passion <span className="text-[#af8f5b]">Projects</span>
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {data.projects.map((p: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col">
            <p className="text-sm font-bold text-white mb-2">{p.name}</p>
            <p className="text-xs text-white/40 leading-relaxed mb-4 flex-1">{p.desc}</p>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.1em]">
              <span className="text-white/30">{p.time}</span>
              <span className={`${p.impact === "High" ? "text-[#af8f5b]" : "text-white/40"}`}>{p.impact} Impact</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoAcademics({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Academic <span className="text-[#af8f5b]">Plan</span>
        </h3>
        <span className="text-xs font-bold text-[#af8f5b] uppercase tracking-[0.15em]">GPA Target: {data.gpaTarget}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {data.courses.map((yr: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <p className="text-xs font-bold text-[#af8f5b] uppercase tracking-[0.15em] mb-4">{yr.year}</p>
            <ul className="space-y-2.5">
              {yr.recommended.map((c: string, j: number) => (
                <li key={j} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#af8f5b] shrink-0" />
                  <span className="text-sm text-white/60">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 leading-relaxed italic">{data.note}</p>
    </div>
  )
}

function DemoTesting({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
          Testing <span className="text-[#af8f5b]">Strategy</span>
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30 font-bold uppercase tracking-[0.1em]">SAT: {data.current.sat}</span>
          <ArrowRight className="w-3 h-3 text-[#af8f5b]" />
          <span className="text-xs text-[#af8f5b] font-bold uppercase tracking-[0.1em]">{data.current.goal}</span>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr,100px,1fr] sm:grid-cols-[1fr,100px,1fr] px-5 py-3 border-b border-white/10">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Test</span>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] text-center">Target</span>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] text-right">Timeline</span>
        </div>
        {/* Rows */}
        {data.plan.map((t: any, i: number) => (
          <div key={i} className={`grid grid-cols-[1fr,100px,1fr] sm:grid-cols-[1fr,100px,1fr] px-5 py-3.5 items-center ${i < data.plan.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="text-sm font-bold text-white">{t.test}</span>
            <span className="text-sm font-bold text-[#af8f5b] text-center">{t.target}</span>
            <span className="text-xs text-white/30 font-medium text-right">{t.timeline}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoScholarships({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Scholarship <span className="text-[#af8f5b]">Matches</span>
      </h3>
      <div className="space-y-2">
        {data.matches.map((s: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{s.name}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.amount}</p>
            </div>
            <span className="text-xs text-white/30 font-medium hidden sm:block">{s.deadline}</span>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#af8f5b] rounded-full" style={{ width: `${s.match}%` }} />
              </div>
              <span className="text-xs font-bold text-[#af8f5b] w-8 text-right">{s.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoColleges({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        College <span className="text-[#af8f5b]">Matches</span>
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {data.tiers.map((tier: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <p className={`text-xs font-bold uppercase tracking-[0.15em] mb-4 ${
              tier.tier === "Reach" ? "text-red-400" : tier.tier === "Target" ? "text-amber-400" : "text-emerald-400"
            }`}>{tier.tier}</p>
            <div className="space-y-3">
              {tier.schools.map((s: any, j: number) => (
                <div key={j} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        tier.tier === "Reach" ? "bg-red-400" : tier.tier === "Target" ? "bg-amber-400" : "bg-emerald-400"
                      }`} style={{ width: `${s.match}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white/40 w-8 text-right">{s.match}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState("archetype")
  const tab = demoTabs.find(t => t.id === activeTab)!

  return (
    <section className="py-20 sm:py-32 bg-[#FFFAF0] px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#af8f5b] mb-6">Product Preview</p>
          <div className="w-12 h-px bg-[#1E2849]/30 mx-auto mb-6" />
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase text-[#1E2849]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
            The <span className="text-[#af8f5b]">Blueprint</span> Report
          </h2>
          <p className="mt-6 text-sm sm:text-base text-[#1E2849] max-w-3xl mx-auto uppercase tracking-[0.15em] font-bold">
            Every student receives a comprehensive, personalized roadmap. Here&apos;s what yours could look like.
          </p>
        </motion.div>

        {/* Browser Frame */}
        <motion.div
          {...fadeUp}
          className="rounded-xl overflow-hidden shadow-2xl shadow-[#1E2849]/10 border border-[#1E2849]/10"
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1b2034] border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/10 rounded-md px-4 py-1.5 text-xs text-white/50 font-medium tracking-wide max-w-sm w-full text-center">
                thestudentblueprint.com/results/john-smith
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#FFFAF0] border-b border-[#1E2849]/10 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {demoTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 border-b-2 whitespace-nowrap ${
                    activeTab === t.id
                      ? "text-[#af8f5b] border-[#af8f5b] bg-[#af8f5b]/5"
                      : "text-[#1E2849]/40 border-transparent hover:text-[#1E2849]/60 hover:border-[#1E2849]/10"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px] sm:min-h-[450px]" style={{ backgroundColor: "#1b2034" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10"
              >
                {activeTab === "archetype" && <DemoArchetype data={tab.content} />}
                {activeTab === "roadmap" && <DemoRoadmap data={tab.content} />}
                {activeTab === "gaps" && <DemoGaps data={tab.content} />}
                {activeTab === "projects" && <DemoProjects data={tab.content} />}
                {activeTab === "academics" && <DemoAcademics data={tab.content} />}
                {activeTab === "testing" && <DemoTesting data={tab.content} />}
                {activeTab === "scholarships" && <DemoScholarships data={tab.content} />}
                {activeTab === "colleges" && <DemoColleges data={tab.content} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-xs sm:text-sm text-[#1E2849]/40 font-bold uppercase tracking-[0.15em] mt-8">
          This is just a small glimpse. The full report includes 20+ personalized sections with far greater depth and detail.
        </p>
      </div>
    </section>
  )
}
