"use client"

import { useEffect, useState } from "react"
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
  Briefcase,
  Users,
  Pen,
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
  {
    id: "career",
    label: "Career",
    icon: Briefcase,
    content: {
      careers: [
        { title: "Software Engineering", match: 92, salary: "$120K - $200K+", majors: ["Computer Science", "Software Engineering", "Mathematics"], why: "Strong alignment with your technical skills, CS coursework, and passion for building tools. High demand and clear growth trajectory." },
        { title: "Product Management", match: 78, salary: "$110K - $180K+", majors: ["Computer Science", "Business", "Cognitive Science"], why: "Combines your leadership experience with technical fluency. Your entrepreneurial projects demonstrate product thinking." },
        { title: "Data Science", match: 74, salary: "$100K - $170K+", majors: ["Statistics", "Computer Science", "Applied Math"], why: "Your quantitative strengths and research interests align well. Consider building a portfolio of data projects." },
      ]
    }
  },
  {
    id: "activities",
    label: "Activities",
    icon: Users,
    content: {
      keep: [
        { name: "Robotics Club (President)", impact: "high", reason: "Leadership + technical depth. National competition path strengthens profile significantly." },
        { name: "Math Team (Captain)", impact: "high", reason: "Demonstrates quantitative rigor. AMC/AIME scores add competitive edge." },
        { name: "Community Tech Tutoring", impact: "medium", reason: "Shows service orientation and communication skills. Admissions officers value community impact." },
      ],
      drop: [
        { name: "JV Tennis", reason: "No competitive distinction. Time better spent deepening STEM leadership." },
        { name: "French Club", reason: "Passive membership with no leadership role. Not contributing to your narrative." },
      ]
    }
  },
  {
    id: "essays",
    label: "Essays",
    icon: Pen,
    content: {
      themes: [
        { title: "The Builder's Mindset", desc: "Frame your journey through the lens of someone who sees problems as opportunities to create solutions. Connect your robotics projects, tech tutoring, and entrepreneurial instincts into a cohesive narrative about building things that matter.", strength: "high" },
        { title: "Bridging the Digital Divide", desc: "Your community tech tutoring reveals a deeper story about equity and access. Explore how teaching others to code changed your own understanding of technology's role in society.", strength: "medium" },
        { title: "From Competition to Collaboration", desc: "Use your transition from individual math competitions to leading a robotics team as a metaphor for growth. Show how you learned that the best innovations come from bringing people together.", strength: "medium" },
      ]
    }
  },
]

// Undergrad demo: rising senior pivoting to grad school + industry options.
const undergradDemoTabs = [
  {
    id: "archetype",
    label: "Archetype",
    icon: Sparkles,
    content: {
      title: "Research-Driven Pre-Med",
      score: 81,
      scoreLabel: "Very Competitive",
      summary: "Your personalized growth roadmap is ready. Based on your profile, we've identified your unique strengths and built a stage-specific action plan.",
      detail: "Strong undergrad foundation with research output. Sharpen MCAT and clinical hours to compete for top medical schools and dual-degree programs.",
      hint: "Think: 3.85 GPA, two summers in a research lab, 200+ clinical volunteer hours, but no first-author publication and MCAT prep just starting."
    }
  },
  {
    id: "gaps",
    label: "Gaps",
    icon: AlertCircle,
    content: {
      gaps: [
        { area: "First-Author Publication", severity: "high", action: "Lead a sub-project from your current lab toward submission. JEM, JCI Insight, or PLOS ONE are realistic targets for an undergrad first-author paper." },
        { area: "MCAT Score", severity: "high", action: "No MCAT yet. Lock in a January or April test date and target 515+. Use UWorld + AAMC full-lengths." },
        { area: "Sustained Clinical Mentor", severity: "medium", action: "Replace ad-hoc shadowing with a recurring 6-month relationship that can produce a strong clinical letter of recommendation." },
        { area: "Leadership Beyond the Lab", severity: "medium", action: "Take a position in a campus health-equity org or run a peer-led MCAT study cohort to demonstrate leadership outside research." },
      ]
    }
  },
  {
    id: "projects",
    label: "Projects",
    icon: Lightbulb,
    content: {
      projects: [
        { name: "Independent Honors Thesis", desc: "Convert your current lab work into a senior honors thesis with original data and faculty advisor support. Strong differentiator for top medical schools.", time: "9 months", impact: "High" },
        { name: "Health-Equity Pilot", desc: "Launch a small clinic-volunteer cohort tracking patient outcomes for one underserved condition. Pair with your pre-med peers; submit to a public-health journal.", time: "6-8 months", impact: "High" },
        { name: "Med-School Q&A Newsletter", desc: "Curate weekly insights on lab finds, MCAT tactics, and admissions data. Builds personal brand and content for your secondaries.", time: "Ongoing", impact: "Medium" },
      ]
    }
  },
  {
    id: "academics",
    label: "Academics",
    icon: BookOpen,
    content: {
      courses: [
        { year: "Senior Year - Fall", recommended: ["Biochemistry II", "Genetics Lab", "Medical Ethics Seminar", "Statistics for the Health Sciences"] },
        { year: "Senior Year - Spring", recommended: ["Honors Thesis (capstone)", "Public Health Policy", "Advanced Cell Biology", "MCAT Review (audited)"] },
      ],
      gpaTarget: "3.85+ cumulative",
      note: "Med schools weight upward GPA trajectory and rigor. Keep humanities balance via medical ethics and policy electives; they signal maturity in personal statements and interviews."
    }
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: DollarSign,
    content: {
      matches: [
        { name: "Goldwater Scholarship", amount: "$7,500", match: 78, deadline: "January" },
        { name: "Beckman Scholars Program", amount: "$26,000", match: 71, deadline: "February" },
        { name: "AMA Foundation Physicians of Tomorrow", amount: "$10,000", match: 68, deadline: "May" },
        { name: "NIH Undergraduate Scholarship", amount: "$20,000", match: 74, deadline: "March" },
        { name: "Tylenol Future Care Scholarship", amount: "$5,000 - $10,000", match: 65, deadline: "September" },
      ]
    }
  },
  {
    id: "career",
    label: "Career",
    icon: Briefcase,
    content: {
      careers: [
        { title: "MD-PhD Candidate", match: 88, salary: "$60K stipend → $250K+ post-residency", majors: ["Biology", "Biochemistry", "Public Health"], why: "Your research track and clinical hours align with dual-degree paths. NIH-funded MSTP programs (Harvard, JHU, UPenn) offer full tuition + stipend." },
        { title: "Clinical Research Coordinator (Gap Year)", match: 79, salary: "$55K - $75K", majors: ["Biology", "Public Health"], why: "Strong gap-year strategy if you're not application-ready. Builds clinical credit, recommendation letters, and runway for a stronger medical-school application cycle." },
        { title: "Biotech Industry Analyst", match: 72, salary: "$80K - $130K", majors: ["Biology", "Biochemistry", "Economics"], why: "Hybrid science/business path if you want to delay medical school. Firms like Flagship Pioneering and L.E.K. recruit pre-med juniors with research backgrounds." },
      ]
    }
  },
  {
    id: "activities",
    label: "Activities",
    icon: Users,
    content: {
      keep: [
        { name: "Undergraduate Research Lab", impact: "high", reason: "Two-year tenure with abstract submissions. Push for first-author paper and a senior thesis to maximize this signal." },
        { name: "Clinical Volunteer (Pediatric ER)", impact: "high", reason: "200+ hours with patient interaction. Convert ad-hoc shifts into a sustained mentorship for a clinical recommendation letter." },
        { name: "Pre-Med Society Vice President", impact: "medium", reason: "Demonstrates leadership and peer mentorship. Use the platform to launch the MCAT study cohort." },
      ],
      drop: [
        { name: "Generic Tutoring Center Shifts", reason: "High effort, low admissions signal. Time better spent on the honors thesis and MCAT prep." },
        { name: "Multiple Cultural Clubs (passive)", reason: "Membership without leadership doesn't add to your application narrative. Keep one and go deep, drop the rest." },
      ]
    }
  },
  {
    id: "essays",
    label: "Statement",
    icon: Pen,
    content: {
      themes: [
        { title: "From Bench to Bedside", desc: "Connect your lab discoveries with the patients you've shadowed. The narrative arc (research as a tool to ease specific human suffering) is exactly what medical-school admissions read for.", strength: "high" },
        { title: "The Cost of Not Knowing", desc: "Frame a moment when missing data harmed a patient or family. Position your research aspirations as the answer. Powerful if you can name a specific case.", strength: "medium" },
        { title: "Why Now, Why Medicine", desc: "Address the implicit question every secondary asks. Use your gap-year decision (or lack thereof) as a hinge moment that reveals your readiness.", strength: "medium" },
      ]
    }
  },
]

// Grad / PhD demo: PhD candidate building toward dissertation defense + career launch.
const gradDemoTabs = [
  {
    id: "archetype",
    label: "Archetype",
    icon: Sparkles,
    content: {
      title: "Computational Biologist",
      score: 84,
      scoreLabel: "Very Competitive",
      summary: "Your personalized growth roadmap is ready. We've benchmarked your profile against successful PhD applicants and faculty hires in your field.",
      detail: "Strong technical foundation and a clear research arc. Two more publications and a targeted advisor outreach campaign would put you in striking range of NIH F31 / NSF GRFP territory.",
      hint: "Think: 2 first-author papers, 1 conference talk, GRE 333, but no major fellowship secured and an academia-vs-industry decision still open."
    }
  },
  {
    id: "gaps",
    label: "Gaps",
    icon: AlertCircle,
    content: {
      gaps: [
        { area: "Fellowship Funding", severity: "high", action: "No NSF GRFP, NIH F31, or DOE CSGF on the CV. Apply this cycle, since fellowship-funded PhDs have measurably higher faculty placement rates." },
        { area: "Cross-Disciplinary Reach", severity: "high", action: "Your work is technically deep but narrow. Co-author a paper with a wet-lab or clinical group to broaden your research network and methods footprint." },
        { area: "Visibility", severity: "medium", action: "Limited conference presence. Submit to RECOMB, ISMB, and a domain-specific workshop this year. Push for talks, not just posters." },
        { area: "Industry Optionality", severity: "medium", action: "Build at least one polished GitHub project that showcases ML on biological data, which keeps the industry door open if academia tightens." },
      ]
    }
  },
  {
    id: "career",
    label: "Career",
    icon: Briefcase,
    content: {
      careers: [
        { title: "Tenure-Track Faculty (R1)", match: 71, salary: "$85K - $130K starting", majors: ["Computational Biology", "Bioinformatics"], why: "Your publication trajectory points here, but cohort competition is brutal. Need 2 more first-author papers plus an external fellowship to be a top-decile applicant." },
        { title: "Industry Research Scientist (Genentech / Recursion / Insitro)", match: 86, salary: "$180K - $280K total comp", majors: ["Computational Biology", "Machine Learning"], why: "Your ML-on-biology skills are in active demand at AI-first biotechs. Internships during the PhD are the fastest route; most full-time hires come from intern pools." },
        { title: "Computational Biology Postdoc (Broad / Stanford / EBI)", match: 83, salary: "$60K - $80K", majors: ["Computational Biology"], why: "Strong bridge to faculty applications. Target labs with K99 / R00 placement track records to maximize independence in 2-3 years." },
      ]
    }
  },
  {
    id: "scholarships",
    label: "Funding",
    icon: DollarSign,
    content: {
      matches: [
        { name: "NSF Graduate Research Fellowship (GRFP)", amount: "$37K stipend × 3 years + tuition", match: 79, deadline: "October" },
        { name: "NIH F31 Predoctoral Fellowship", amount: "$28K stipend + research budget", match: 82, deadline: "December (rolling)" },
        { name: "DOE Computational Science Graduate Fellowship (CSGF)", amount: "$45K stipend + practicum", match: 74, deadline: "January" },
        { name: "Hertz Foundation Fellowship", amount: "$36K + tuition (5 years)", match: 61, deadline: "October" },
        { name: "ARCS Foundation Scholar Award", amount: "$10K - $20K", match: 70, deadline: "Varies by chapter" },
      ]
    }
  },
  {
    id: "essays",
    label: "Statement",
    icon: Pen,
    content: {
      themes: [
        { title: "The Question I Couldn't Stop Asking", desc: "Anchor your research statement in a single concrete biological question that has shaped your work. Show admissions and fellowship committees a researcher who already knows what matters.", strength: "high" },
        { title: "From Code to Cure", desc: "Connect your computational tooling to a specific therapeutic outcome, even a hypothesized one. Strongest if you can name a disease, mechanism, and method in the first paragraph.", strength: "medium" },
        { title: "Why This Lab, This Year", desc: "Tailored advisor-outreach essay. Cite their specific recent paper, propose a project that extends it, and explain why your training is the right complement.", strength: "medium" },
      ]
    }
  },
]

// Elementary demo: discovery and enrichment focus for K-5 learners.
const elementaryDemoTabs = [
  {
    id: "archetype",
    label: "Archetype",
    icon: Sparkles,
    content: {
      title: "Curious Builder",
      score: 72,
      scoreLabel: "On Track",
      summary: "Your child's personalized growth roadmap is ready. We've spotted the early signals of what they love and built a plan parents can implement this month.",
      detail: "Strong curiosity and hands-on learning style. Channel this through age-appropriate enrichment, library programs, and weekend project time.",
      hint: "Think: Loves Lego, asks endless 'why' questions, reads above grade level, but hasn't yet had a chance to try a music instrument, sport, or coding club."
    }
  },
  {
    id: "activities",
    label: "Activities",
    icon: Users,
    content: {
      keep: [
        { name: "Saturday Library Reading Program", impact: "high", reason: "Cements the love of reading and exposes your child to a wider vocabulary. Free, recurring, and parent-friendly to drop in on." },
        { name: "Weekly Math Olympiad Practice (online)", impact: "high", reason: "Light, playful problem-solving builds confidence. Try Beast Academy, Art of Problem Solving's Beast Academy, or Khan Kids." },
        { name: "Family Project Hour (Sundays)", impact: "medium", reason: "30-60 minutes of one structured build per week (Lego challenge, baking experiment, garden bed) creates the habit of finishing things." },
      ],
      drop: [
        { name: "Unstructured tablet time", reason: "Replace passive screens with one curated app (Khan Kids, ScratchJr) for short sessions." },
        { name: "Over-scheduled weekday evenings", reason: "Two activities per week is plenty at this age. Protect downtime for free play and reading." },
      ]
    }
  },
]

// Middle school demo: foundation-building, talent search prep, and HS readiness.
const middleDemoTabs = [
  {
    id: "archetype",
    label: "Archetype",
    icon: Sparkles,
    content: {
      title: "Emerging Innovator",
      score: 75,
      scoreLabel: "Building Momentum",
      summary: "Your personalized growth roadmap is ready. We've benchmarked your profile against students who later earned admission to top high-school programs and competitive enrichment summers.",
      detail: "Solid academic foundation and clear interests. Sharpen one passion area into a recognizable strength before high school begins.",
      hint: "Think: Top of class in math, plays an instrument casually, hasn't yet tried a regional competition or a multi-week summer program."
    }
  },
  {
    id: "gaps",
    label: "Gaps",
    icon: AlertCircle,
    content: {
      gaps: [
        { area: "First Real Competition", severity: "high", action: "Sign up for one regional competition this year (MATHCOUNTS, Science Olympiad, Scripps Spelling Bee, or a coding contest like USACO Bronze). Wins matter less than learning to compete." },
        { area: "Talent Search Test", severity: "medium", action: "Take the SAT or ACT through a talent search like Johns Hopkins CTY or Duke TIP. High scorers unlock summer programs and pre-college courses." },
        { area: "Sustained Project", severity: "medium", action: "Pick one project that runs 3+ months (a YouTube channel, a small business, a research notebook). It teaches finishing, the rarest middle-school skill." },
        { area: "High-School Course Plan", severity: "medium", action: "Map out which honors and high-school-level classes (Algebra I, foreign language) you can take in 7th-8th grade to set up a strong 9th-grade schedule." },
      ]
    }
  },
  {
    id: "activities",
    label: "Activities",
    icon: Users,
    content: {
      keep: [
        { name: "Math Counts Team", impact: "high", reason: "Builds quantitative depth and a competition resume. Carries directly into high-school AMC/AIME track." },
        { name: "Robotics Club (FLL)", impact: "high", reason: "Hands-on engineering plus teamwork. FIRST LEGO League records and awards transfer well to high-school robotics applications." },
        { name: "School Newspaper or Blog", impact: "medium", reason: "Writing reps now save you essay pain in 11th grade. Pick one beat and own it for the year." },
      ],
      drop: [
        { name: "Generic 'tutoring' that's already-known material", reason: "Move on to genuinely harder material via online programs (AoPS, CTY) or skip-grade math at school." },
        { name: "Over-broad activity sampling", reason: "Don't try every club. Pick two or three for the year and go deeper than your peers." },
      ]
    }
  },
  {
    id: "career",
    label: "Career",
    icon: Briefcase,
    content: {
      careers: [
        { title: "Software / AI Engineer (long-term)", match: 84, salary: "Future: $130K - $250K+", majors: ["Computer Science", "Math", "Engineering"], why: "Your curiosity for puzzles and patterns aligns with software. Start now with Scratch → Python → first GitHub project. By 8th grade, aim for one finished tool you can show people." },
        { title: "Research Scientist / Doctor (long-term)", match: 76, salary: "Future: $120K - $300K+", majors: ["Biology", "Chemistry", "Neuroscience"], why: "Strong reading and reasoning skills point here. Volunteer at a science fair, shadow a relative in healthcare, and start a research notebook to track 'why does this happen?' questions." },
        { title: "Founder / Entrepreneur (long-term)", match: 72, salary: "Future: highly variable", majors: ["Economics", "Computer Science", "Design"], why: "If your child has run a small store, sold crafts, or organized a fundraiser, that's the real start. Now is the time for a tiny business with real customers, even if revenue is $50/month." },
      ]
    }
  },
  {
    id: "essays",
    label: "Stories",
    icon: Pen,
    content: {
      themes: [
        { title: "The Hard Thing You Finished", desc: "Pick one project, sport, or learning goal you stuck with for 3+ months. Write the story in a journal now. By high school, it becomes the spine of your Common App essay.", strength: "high" },
        { title: "What You Want to Build", desc: "What problem in your school, neighborhood, or family bugs you the most? Sketch the solution. The clearer you can write this in 7th grade, the more shaped your high-school choices become.", strength: "medium" },
        { title: "Where You Got It Wrong", desc: "Failure stories are gold. Pick one moment that didn't go your way (lost competition, dropped instrument) and explain what you'd do differently. Practice telling it out loud.", strength: "medium" },
      ]
    }
  },
]

// All demos by stage. The tab list shown for each stage matches what the actual
// results page surfaces for that student type, so the marketing demo accurately
// reflects what users will see.
type StageValue = 'elementary' | 'middle' | 'high_school' | 'undergrad' | 'grad'

const STAGE_OPTIONS: { value: StageValue; label: string; sub: string }[] = [
  { value: 'elementary', label: 'Elementary', sub: 'Discovery & enrichment' },
  { value: 'middle', label: 'Middle School', sub: 'Foundations & talent search' },
  { value: 'high_school', label: 'High School', sub: 'College admissions strategy' },
  { value: 'undergrad', label: 'Undergrad', sub: 'Grad school & career launch' },
  { value: 'grad', label: 'Grad / PhD', sub: 'Fellowships & faculty path' },
]

const demosByStage: Record<StageValue, { studentName: string; addressSlug: string; tabs: typeof demoTabs }> = {
  elementary: { studentName: 'Aanya Krishnan', addressSlug: 'aanya-krishnan', tabs: elementaryDemoTabs },
  middle: { studentName: 'Jordan Williams', addressSlug: 'jordan-williams', tabs: middleDemoTabs },
  high_school: { studentName: 'John Smith', addressSlug: 'john-smith', tabs: demoTabs },
  undergrad: { studentName: 'Maya Patel', addressSlug: 'maya-patel', tabs: undergradDemoTabs },
  grad: { studentName: 'Dr. James Liu', addressSlug: 'james-liu', tabs: gradDemoTabs },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoArchetype({ data, studentName }: { data: any; studentName: string }) {
  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-8">
      <div>
        <p className="text-white/40 text-sm mb-2">Congratulations,</p>
        <h3 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{studentName}</h3>
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

function DemoCareer({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Career <span className="text-[#af8f5b]">Pathways</span>
      </h3>
      <div className="space-y-3">
        {data.careers.map((c: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">{c.title}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 font-medium">{c.salary}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#af8f5b] rounded-full" style={{ width: `${c.match}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[#af8f5b] w-8 text-right">{c.match}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-2">{c.why}</p>
            <div className="flex gap-2 flex-wrap">
              {c.majors.map((m: string, j: number) => (
                <span key={j} className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded bg-[#af8f5b]/10 text-[#af8f5b]">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoActivities({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Activities & <span className="text-[#af8f5b]">Leadership</span>
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em] mb-4">Keep & Deepen</p>
          <div className="space-y-3">
            {data.keep.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">{a.name}</p>
                  <p className="text-xs text-white/40 mt-1">{a.reason}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded shrink-0 ${a.impact === "high" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"}`}>{a.impact}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <p className="text-xs font-bold text-red-400 uppercase tracking-[0.15em] mb-4">Deprioritize</p>
          <div className="space-y-3">
            {data.drop.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-4 h-0.5 bg-red-400/50 shrink-0 mt-2.5" />
                <div>
                  <p className="text-sm font-bold text-white/50 line-through">{a.name}</p>
                  <p className="text-xs text-white/30 mt-1">{a.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoEssays({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
        Essay <span className="text-[#af8f5b]">Strategy</span>
      </h3>
      <div className="space-y-3">
        {data.themes.map((t: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">{t.title}</p>
              <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded ${t.strength === "high" ? "bg-[#af8f5b]/10 text-[#af8f5b]" : "bg-white/5 text-white/40"}`}>
                {t.strength === "high" ? "Recommended" : "Alternative"}
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDemo() {
  const [stage, setStage] = useState<StageValue>('high_school')
  const currentDemo = demosByStage[stage]
  const [activeTab, setActiveTab] = useState(currentDemo.tabs[0].id)

  // When stage changes, snap to a tab that exists in the new dataset.
  useEffect(() => {
    if (!currentDemo.tabs.some(t => t.id === activeTab)) {
      setActiveTab(currentDemo.tabs[0].id)
    }
  }, [stage, currentDemo.tabs, activeTab])

  const tab = currentDemo.tabs.find(t => t.id === activeTab) ?? currentDemo.tabs[0]

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
            Every student receives a comprehensive, personalized roadmap tailored to their stage. Here&apos;s a glimpse.
          </p>
        </motion.div>

        {/* Stage Selector */}
        <motion.div {...fadeUp} className="flex flex-col items-center gap-3 mb-8">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#1E2849]/40">Switch the stage to see how the report changes</p>
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-[#1E2849]/5 border border-[#1E2849]/10">
            {STAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStage(opt.value)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 ${
                  stage === opt.value
                    ? 'bg-[#1E2849] text-white shadow-lg shadow-[#1E2849]/20'
                    : 'text-[#1E2849]/60 hover:text-[#1E2849] hover:bg-[#1E2849]/5'
                }`}
              >
                <span className="block">{opt.label}</span>
                <span className={`block text-[9px] font-medium tracking-[0.1em] mt-0.5 ${stage === opt.value ? 'text-white/60' : 'text-[#1E2849]/40'}`}>{opt.sub}</span>
              </button>
            ))}
          </div>
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
                thestudentblueprint.com/results/{currentDemo.addressSlug}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#FFFAF0] border-b border-[#1E2849]/10 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {currentDemo.tabs.map((t) => (
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
                key={`${stage}-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10"
              >
                {activeTab === "archetype" && <DemoArchetype data={tab.content} studentName={currentDemo.studentName} />}
                {activeTab === "roadmap" && <DemoRoadmap data={tab.content} />}
                {activeTab === "gaps" && <DemoGaps data={tab.content} />}
                {activeTab === "projects" && <DemoProjects data={tab.content} />}
                {activeTab === "academics" && <DemoAcademics data={tab.content} />}
                {activeTab === "testing" && <DemoTesting data={tab.content} />}
                {activeTab === "scholarships" && <DemoScholarships data={tab.content} />}
                {activeTab === "colleges" && <DemoColleges data={tab.content} />}
                {activeTab === "career" && <DemoCareer data={tab.content} />}
                {activeTab === "activities" && <DemoActivities data={tab.content} />}
                {activeTab === "essays" && <DemoEssays data={tab.content} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-xs sm:text-sm text-[#1E2849]/40 font-bold uppercase tracking-[0.15em] mt-8">
          This is just a small glimpse. The full report includes 20+ personalized sections tailored to each stage.
        </p>
      </div>
    </section>
  )
}
