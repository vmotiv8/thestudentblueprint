"use client"

import { useEffect, useState, use, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  GraduationCap,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Loader2,
  Download,
  Share2,
    ArrowRight,
    Clock,
    FileText,
    Users,
    Trophy,
    Building,
    Palette,
    Briefcase,
    Sun,
    Flag,
    Dumbbell,
    FlaskConical,
    Compass,
    DollarSign,
    PenLine,
    Linkedin,
    Link2,
    XCircle,
    Mail,
    Copy,
    ArrowLeft,
    Brain,
    Heart,
    Sparkles,
    Zap,
  } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from "recharts"

const PHASE_1_TABS = new Set(['roadmap', 'gaps', 'essays'])
const PHASE_2_TABS = new Set(['projects', 'career-future', 'academics', 'testing', 'scholarships', 'activities', 'college-match'])

interface Assessment {
  id: string
  status: string
  generation_phase: number | null
  phase2_started_at: string | null
  student_archetype: string
  archetype_scores: {
    Visionary: number
    Builder: number
    Healer: number
    Analyst: number
    Artist: number
    Advocate: number
    Entrepreneur: number
    Researcher: number
  } | null
  competitiveness_score: number | null
  report_data?: {
    generationFailed?: boolean
    error?: string
    competitivenessScore?: number | null
    studentArchetype?: string
    [key: string]: unknown
  } | null
  roadmap_data: {
    immediate: string[]
    shortTerm: string[]
    mediumTerm: string[]
    longTerm: string[]
  }
    grade_by_grade_roadmap?: {
      currentGrade: {
        grade: string
        focus: string
        academics: string[]
        research?: string[]
        extracurriculars: string[]
        testing: string[]
        leadership: string[]
        passionProjects: string[]
        summerPlan: string
      }
      nextYears: Array<{
        grade: string
        focus: string
        academics: string[]
        research?: string[]
        extracurriculars: string[]
        testing: string[]
        leadership: string[]
        passionProjects: string[]
        summerPlan: string
        }>
      }
  strengths_analysis: {
    competitiveAdvantages: string[]
    uniqueDifferentiators: string[]
    alignedActivities: string[]
  }
  gap_analysis: {
    missingElements: string[]
    activitiesToDeepen: string[]
    skillsToDevelop: string[]
    skillsToDevelope?: string[]
    vulnerabilities?: string[]
  }
    passion_projects: Array<{
      title: string
      description: string
      timeCommitment: string
      skillsDeveloped: string[]
      applicationImpact: string
      resources: string
      implementationSteps?: string[]
    }>
  academic_courses_recommendations: {
    apCourses: string[]
    ibCourses: string[]
    honorsCourses: string[]
    electivesRecommended: string[]
  }
  sat_act_goals: {
    targetSATScore: string
    satSectionGoals: { reading: string; writing: string; math: string }
    targetACTScore: string
    actSectionGoals: { english: string; math: string; reading: string; science: string }
    prepStrategy: string
    timeline: string
  }
  research_publications_recommendations: {
    researchTopics: string[]
    publicationOpportunities: string[]
    mentorshipSuggestions: string[]
    timeline: string
  }
  leadership_recommendations: {
    clubLeadership: string[]
    schoolWideRoles: string[]
    communityLeadership: string[]
    leadershipDevelopment: string[]
  }
  service_community_recommendations: {
    localOpportunities: string[]
    nationalPrograms: string[]
    internationalService: string[]
    sustainedCommitment: string[]
  }
  summer_ivy_programs_recommendations: {
    preFreshmanPrograms: string[]
    competitivePrograms: string[]
    researchPrograms: string[]
    enrichmentPrograms: string[]
  }
  sports_recommendations: {
    varsitySports: string[]
    clubSports: string[]
    recruitingStrategy: string[]
    fitnessLeadership: string[]
  }
  competitions_recommendations: {
    academicCompetitions: string[]
    businessCompetitions: string[]
    artsCompetitions: string[]
    debateSpeech: string[]
  }
  student_government_recommendations: {
    schoolGovernment: string[]
    districtStateRoles: string[]
    youthGovernment: string[]
    advocacyRoles: string[]
  }
  internships_recommendations: {
    industryInternships: string[]
    researchInternships: string[]
    nonprofitInternships: string[]
    virtualOpportunities: string[]
  }
    culture_arts_recommendations: {
      performingArts: string[]
      visualArts: string[]
      creativeWriting: string[]
      culturalClubs: string[]
    }
    career_recommendations: {
      jobTitles: string[]
      blueOceanIndustries: Array<{ industry: string; why: string }>
      salaryPotential: string
      linkedInBioHeadline: string
    }
    college_recommendations: {
      collegeBreakdown: {
        reach: string[]
        target: string[]
        safety: string[]
      }
      schoolMatches: Array<{ schoolName: string; matchScore: number; why: string }>
    }
        mentor_recommendations: {
          mentors: Array<{
            name: string;
            university: string;
            department: string;
            why: string;
            coldEmailTemplate?: string;
            accessibilityTier?: string;
          }>
        }
    waste_of_time_activities: {
      activities: Array<{ activity: string; whyQuit: string }>
    }
    scholarship_recommendations?: {
      scholarships: Array<{
        name: string
        organization: string
        amount: string
        deadline: string
        why: string
        url: string
      }>
    }
    basic_info: { fullName: string }
  personality: { archetypes: string[] }
  students: {
    full_name: string
    email: string
    current_grade: string
    target_college_year: number
    unique_code: string
  }
}

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [archetypeScores, setArchetypeScores] = useState<Array<{ subject: string; score: number; fullMark: number }>>([])
  const [isPhase2Loading, setIsPhase2Loading] = useState(false)
  const [phase2RetryAvailable, setPhase2RetryAvailable] = useState(false)
  const [retryingPhase2, setRetryingPhase2] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef(0)

  // Organization branding colors (with defaults)
  const primaryColor = tenant?.primary_color || "#1e3a5f"
  const secondaryColor = tenant?.secondary_color || "#c9a227"
  const orgName = tenant?.name || "The Student Blueprint"
  const logoUrl = tenant?.logo_url

  const updateAssessmentState = useCallback((data: Assessment) => {
    setAssessment(data)
    const scores = data.archetype_scores
    if (scores) {
      setArchetypeScores([
        { subject: "Visionary", score: scores.Visionary || 0, fullMark: 100 },
        { subject: "Builder", score: scores.Builder || 0, fullMark: 100 },
        { subject: "Healer", score: scores.Healer || 0, fullMark: 100 },
        { subject: "Analyst", score: scores.Analyst || 0, fullMark: 100 },
        { subject: "Artist", score: scores.Artist || 0, fullMark: 100 },
        { subject: "Advocate", score: scores.Advocate || 0, fullMark: 100 },
        { subject: "Entrepreneur", score: scores.Entrepreneur || 0, fullMark: 100 },
        { subject: "Researcher", score: scores.Researcher || 0, fullMark: 100 }
      ])
    }

    if (data.status === 'completed') {
      setIsPhase2Loading(false)
      setPhase2RetryAvailable(false)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    } else if (data.status === 'partial') {
      setIsPhase2Loading(true)
      // Check if Phase 2 seems stuck (>3 min)
      if (data.phase2_started_at) {
        const elapsed = Date.now() - new Date(data.phase2_started_at).getTime()
        if (elapsed > 180000) {
          setPhase2RetryAvailable(true)
        }
      } else {
        // phase2_started_at is null = Phase 2 failed, show retry
        setPhase2RetryAvailable(true)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, tenantRes] = await Promise.all([
          fetch(`/api/assessment/${resolvedParams.id}`),
          fetch('/api/platform/organizations/me')
        ])

        const [assessmentData, tenantData] = await Promise.all([
          assessmentRes.json(),
          tenantRes.json()
        ])

        if (assessmentData.assessment) {
          updateAssessmentState(assessmentData.assessment)

          // Start polling if not fully complete
          if (assessmentData.assessment.status === 'partial') {
            pollIntervalRef.current = setInterval(async () => {
              pollCountRef.current++
              if (pollCountRef.current > 60) {
                // 5 minutes of polling, show retry
                setPhase2RetryAvailable(true)
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
                return
              }
              try {
                const res = await fetch(`/api/assessment/${resolvedParams.id}`)
                const data = await res.json()
                if (data.assessment) {
                  updateAssessmentState(data.assessment)
                }
              } catch (err) {
                console.error('Polling error:', err)
              }
            }, 5000)
          }
        }

        if (tenantData) {
          setTenant(tenantData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [resolvedParams.id, updateAssessmentState])

  const handleRetryPhase2 = async () => {
    setRetryingPhase2(true)
    setPhase2RetryAvailable(false)
    try {
      const res = await fetch(`/api/assessment/${resolvedParams.id}/generate-phase2`, {
        method: 'POST',
      })
      if (res.ok || res.status === 202) {
        setIsPhase2Loading(true)
        // Restart polling
        pollCountRef.current = 0
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = setInterval(async () => {
          pollCountRef.current++
          if (pollCountRef.current > 60) {
            setPhase2RetryAvailable(true)
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            return
          }
          try {
            const pollRes = await fetch(`/api/assessment/${resolvedParams.id}`)
            const data = await pollRes.json()
            if (data.assessment) {
              updateAssessmentState(data.assessment)
            }
          } catch (err) {
            console.error('Polling error:', err)
          }
        }, 5000)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to generate recommendations')
        setPhase2RetryAvailable(true)
      }
    } catch {
      toast.error('Failed to generate recommendations')
      setPhase2RetryAvailable(true)
    } finally {
      setRetryingPhase2(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/pdf/${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${assessment?.students?.full_name || 'Student'}-StudentBlueprint-Report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${assessment?.students?.full_name}'s The Student Blueprint Results`,
          text: 'Check out my personalized college success roadmap!',
          url
        })
      } catch {
        // User cancelled share dialog
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#c9a227] mx-auto mb-4" />
          <p className="text-[#5a7a9a]">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">Assessment Not Found</h2>
            <p className="text-[#5a7a9a] mb-4">We couldn&apos;t find the results you&apos;re looking for.</p>
            <Link href="/">
              <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if AI analysis failed and report is pending
  if (assessment.report_data?.generationFailed) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Card className="max-w-lg">
          <CardContent className="pt-6 text-center">
            <Clock className="w-12 h-12 text-[#c9a227] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">Report Being Processed</h2>
            <p className="text-[#5a7a9a] mb-4">
              Your report is being processed. Please check back soon or contact your counselor.
            </p>
            <p className="text-xs text-[#5a7a9a]/60 mb-6">
              Your assessment has been submitted successfully. The AI analysis will be completed shortly.
            </p>
            <Link href="/">
              <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studentName = assessment.students?.full_name || assessment.basic_info?.fullName || "Student"
  const fullArchetype = assessment.student_archetype || "Strategic Thinker"
  const archetype = (() => {
    let short = fullArchetype
    if (short.includes(':')) short = short.split(':')[0].trim()
    if (short.includes('\u2014')) short = short.split('\u2014')[0].trim()
    if (short.includes(' - ')) short = short.split(' - ')[0].trim()
    const words = short.split(/\s+/)
    if (words.length > 6) short = words.slice(0, 5).join(' ')
    return short
  })()

    // Map each tab to its generation phase and conservative time estimate
    const tabWaitTimes: Record<string, { phase: number; estimate: string }> = {
      'academics': { phase: 2, estimate: '~3-5 minutes' },
      'testing': { phase: 2, estimate: '~3-5 minutes' },
      'college-match': { phase: 2, estimate: '~3-5 minutes' },
      'scholarships': { phase: 2, estimate: '~3-5 minutes' },
      'career-future': { phase: 2, estimate: '~3-5 minutes' },
      'projects': { phase: 3, estimate: '~5-7 minutes' },
      'leadership': { phase: 3, estimate: '~5-7 minutes' },
      'network': { phase: 3, estimate: '~5-7 minutes' },
      'research': { phase: 4, estimate: '~7-10 minutes' },
      'activities': { phase: 4, estimate: '~7-10 minutes' },
    }

    const Phase2Placeholder = ({ tabKey }: { tabKey?: string }) => {
      const waitInfo = tabKey ? tabWaitTimes[tabKey] : null
      const estimate = waitInfo?.estimate || '~5-10 minutes'

      return (
        <div className="text-center py-16 sm:py-20">
          {retryingPhase2 || (isPhase2Loading && !phase2RetryAvailable) ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: secondaryColor }} />
              <p className="text-[#5a7a9a] font-medium">
                Generating your personalized recommendations...
              </p>
              <p className="text-sm text-[#5a7a9a]/60 mt-1">
                Estimated wait: {estimate} from submission
              </p>
            </>
          ) : phase2RetryAvailable ? (
            <>
              <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: secondaryColor }} />
              <p className="text-[#5a7a9a] font-medium mb-1">
                Detailed recommendations are still being generated
              </p>
              <p className="text-sm text-[#5a7a9a]/60 mb-4">
                This is taking longer than expected. You can retry or check back in a few minutes.
              </p>
              <Button
                onClick={handleRetryPhase2}
                disabled={retryingPhase2}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                {retryingPhase2 ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  'Generate Recommendations'
                )}
              </Button>
            </>
          ) : (
            <>
              <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: secondaryColor }} />
              <p className="text-[#5a7a9a] font-medium">
                We&apos;re still generating your personalized results...
              </p>
              <p className="text-sm text-[#5a7a9a]/60 mt-1">
                Estimated wait: {estimate} from submission. This page updates automatically.
              </p>
            </>
          )}
        </div>
      )
    }

    const RecommendationCard = ({
      title,
      icon: Icon,
      items,
      color
    }: {
      title: string
      icon: React.ElementType
      items: string[] | undefined
      color: string
    }) => {
      if (!items || !Array.isArray(items) || items.length === 0) return null

      return (
        <Card className="border-[#e5e0d5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color }} />
              {title}
              <span className="ml-auto text-[10px] font-bold text-[#5a7a9a]/40">{items.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="multiple" className="space-y-0.5">
              {items.map((item, index) => {
                const text = typeof item === 'string' ? item : (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))
                const colonIdx = text.indexOf(':')
                const dashIdx = text.indexOf(' \u2013 ')
                let heading: string
                let detail: string
                if (colonIdx > 0 && colonIdx < 80) {
                  heading = text.slice(0, colonIdx).trim()
                  detail = text.slice(colonIdx + 1).trim()
                } else if (dashIdx > 0 && dashIdx < 80) {
                  heading = text.slice(0, dashIdx).trim()
                  detail = text.slice(dashIdx + 3).trim()
                } else if (text.length > 80) {
                  const spaceIdx = text.indexOf(' ', 60)
                  heading = text.slice(0, spaceIdx > 0 ? spaceIdx : 60).trim() + '...'
                  detail = text
                } else {
                  heading = text
                  detail = ''
                }
                return (
                  <AccordionItem key={index} value={`${title}-${index}`} className="border-none">
                    {detail ? (
                      <>
                        <AccordionTrigger className="py-1.5 hover:no-underline">
                          <div className="flex items-start gap-2 text-left">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-[13px] font-medium text-[#1e3a5f] leading-snug">{heading}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1.5 pl-3.5">
                          <p className="text-xs text-[#5a7a9a] leading-relaxed">{detail}</p>
                        </AccordionContent>
                      </>
                    ) : (
                      <div className="flex items-start gap-2 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[13px] text-[#5a7a9a] leading-snug">{heading}</span>
                      </div>
                    )}
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )
    }

  return (
    <div className="min-h-screen bg-[#faf8f3] overflow-x-hidden">
      <style>{`
        [data-state=active].brand-tab { background-color: ${primaryColor} !important; color: ${secondaryColor} !important; }
        .brand-tab { color: ${primaryColor}80; }
        .brand-pulse { background-color: ${secondaryColor}; }
      `}</style>
        <nav className="text-white border-b border-white/10 sticky top-0 z-50 shadow-xl backdrop-blur-md w-full" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group transition-transform hover:scale-[1.02] active:scale-[0.98] min-w-0">
              {logoUrl ? (
                <Image src={logoUrl} alt={orgName} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full bg-white p-1 shadow-lg" />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:shadow-amber-500/20 transition-all shrink-0" style={{ boxShadow: `0 4px 14px ${secondaryColor}30` }}>
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base sm:text-xl leading-none tracking-tight truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{orgName}</span>
                <span className="text-[7px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold truncate" style={{ color: secondaryColor }}>Results Portal</span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 border border-white/10 rounded-full px-2.5 sm:px-6 h-8 sm:h-10"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                className="font-bold rounded-full px-3 sm:px-6 h-8 sm:h-10 shadow-lg transition-all hover:-translate-y-0.5 text-[10px] sm:text-sm"
                style={{ backgroundColor: secondaryColor, color: primaryColor, boxShadow: `0 4px 14px ${secondaryColor}40`, opacity: assessment?.status !== 'completed' ? 0.5 : 1 }}
                onClick={handleDownloadPDF}
                disabled={downloading || assessment?.status !== 'completed'}
                title={assessment?.status !== 'completed' ? 'PDF available once all recommendations are generated' : ''}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1 sm:mr-2" />
                )}
                {downloading ? '...' : (
                  <>
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </nav>

        <main className="py-6 sm:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 sm:mb-12"
            >
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}dd)` }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
                  <div>
                    <p className="text-white/60 mb-1 sm:mb-2 text-sm sm:text-base">Congratulations,</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {studentName}
                    </h1>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="text-sm sm:text-lg px-3 sm:px-4 py-0.5 sm:py-1 font-semibold" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                        {archetype}
                      </Badge>
                    </div>
                    <p className="text-white/70 max-w-xl text-sm sm:text-base leading-relaxed">
                      Your personalized college roadmap is ready. Based on your profile, we&apos;ve identified your unique strengths and created a customized action plan.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm max-w-[220px]">
                      <div className="text-center">
                        <p className="text-white/60 text-xs sm:text-sm mb-1 uppercase tracking-wider">Comp. Score</p>
                        <div className="text-4xl sm:text-5xl font-bold" style={{ color: secondaryColor }}>{assessment.competitiveness_score ?? '--'}</div>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-1">out of 100</p>
                      </div>
                      <p className="text-white/50 text-[9px] sm:text-[10px] mt-3 leading-snug text-center">
                        {(assessment.competitiveness_score ?? 0) >= 90
                          ? "Exceptional \u2014 National/international-level achievements and near-perfect stats place you among the most competitive applicants."
                          : (assessment.competitiveness_score ?? 0) >= 80
                          ? "Very Competitive \u2014 Strong regional awards, high-impact leadership, and excellent academics make you a standout candidate."
                          : (assessment.competitiveness_score ?? 0) >= 70
                          ? "Competitive \u2014 Solid extracurriculars and good academics, but developing a national-level \"spike\" would strengthen your profile."
                          : "Developing \u2014 Focus on building your narrative through meaningful extracurriculars, leadership roles, and academic growth."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-1 lg:col-span-2"
              >
                <Card className="border-[#e5e0d5] h-full">
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-xl flex items-center gap-2" style={{ color: primaryColor }}>
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: secondaryColor }} />
                      Archetype Analysis
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your profile across 8 key dimensions</CardDescription>
                  </CardHeader>
                  <CardContent className="px-1 sm:px-6 pb-4 sm:pb-6 overflow-hidden">
                    <div className="h-[240px] sm:h-[320px] lg:h-[350px] w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={archetypeScores} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                          <PolarGrid stroke="#e5e0d5" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#5a7a9a", fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#5a7a9a", fontSize: 9 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke={primaryColor}
                            fill={secondaryColor}
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#faf8f3] rounded-lg border border-[#e5e0d5]">
                      <p className="text-[11px] sm:text-sm text-[#5a7a9a] leading-relaxed">
                        This radar chart maps your personality across 8 archetypes &mdash; from Visionary (big-picture thinking) to Analyst (data-driven reasoning). Higher scores indicate stronger alignment. Your unique shape reveals where your natural talents intersect, helping us tailor your roadmap to careers and activities that match who you are.
                      </p>
                    </div>

                    {/* Personality Profile */}
                    {archetypeScores.length > 0 && (() => {
                      const archetypeDetails: Record<string, { emoji: string; trait: string; style: string; strength: string; environment: string }> = {
                        Visionary: { emoji: '\uD83D\uDD2D', trait: 'Big-picture thinker who sees possibilities others miss', style: 'Learns best through exploration and connecting ideas across fields', strength: 'Strategic foresight & innovation', environment: 'Open-ended, creative spaces with room to experiment' },
                        Builder: { emoji: '\uD83D\uDD27', trait: 'Hands-on creator who turns ideas into tangible results', style: 'Learns best by doing \u2014 prototyping, building, and iterating', strength: 'Execution & practical problem-solving', environment: 'Maker spaces, labs, and project-based settings' },
                        Healer: { emoji: '\uD83D\uDC9A', trait: 'Deeply empathetic with a drive to alleviate suffering', style: 'Learns through human connection and real-world impact stories', strength: 'Compassion & patient advocacy', environment: 'Clinical settings, community service, mentorship roles' },
                        Analyst: { emoji: '\uD83D\uDCCA', trait: 'Data-driven thinker who finds patterns in complexity', style: 'Learns best through structured analysis, research, and logic', strength: 'Critical thinking & evidence-based reasoning', environment: 'Research labs, data teams, and academic settings' },
                        Artist: { emoji: '\uD83C\uDFA8', trait: 'Creative spirit who communicates through expression', style: 'Learns through storytelling, visual thinking, and experimentation', strength: 'Creative expression & original perspective', environment: 'Studios, stages, and interdisciplinary spaces' },
                        Advocate: { emoji: '\uD83D\uDCE2', trait: 'Passionate voice for justice and systemic change', style: 'Learns through debate, policy analysis, and community engagement', strength: 'Persuasion & social impact leadership', environment: 'Civic organizations, policy forums, and activism' },
                        Entrepreneur: { emoji: '\uD83D\uDE80', trait: 'Risk-taker who spots opportunities and builds ventures', style: 'Learns by launching, failing fast, and scaling what works', strength: 'Initiative & business acumen', environment: 'Startups, pitch competitions, and business incubators' },
                        Researcher: { emoji: '\uD83D\uDD2C', trait: 'Relentless investigator driven by intellectual curiosity', style: 'Learns through deep dives, literature reviews, and hypothesis testing', strength: 'Methodical inquiry & academic rigor', environment: 'University labs, journals, and academic conferences' },
                      }
                      const sorted = [...archetypeScores].sort((a, b) => b.score - a.score)
                      const top1 = sorted[0]
                      const top2 = sorted[1]
                      const lowest = sorted[sorted.length - 1]
                      const d1 = archetypeDetails[top1.subject] || archetypeDetails.Visionary
                      const d2 = archetypeDetails[top2.subject] || archetypeDetails.Builder

                      return (
                        <div className="mt-4 sm:mt-6">
                          <div className="flex items-center gap-2 mb-3 px-2 sm:px-0">
                            <Brain className="w-4 h-4 text-[#c9a227]" />
                            <p className="text-[10px] sm:text-xs font-bold text-[#5a7a9a] uppercase tracking-widest">Personality Profile</p>
                          </div>

                          {/* Top 2 Archetypes */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 px-1 sm:px-0">
                            {[{ data: top1, detail: d1, rank: 'Primary' }, { data: top2, detail: d2, rank: 'Secondary' }].map(({ data, detail, rank }) => (
                              <div key={data.subject} className="p-2.5 sm:p-3 rounded-lg border border-[#e5e0d5] bg-[#faf8f3]">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-base sm:text-lg">{detail.emoji}</span>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-[#1e3a5f] truncate">{data.subject}</p>
                                    <p className="text-[9px] sm:text-[10px] text-[#c9a227] font-bold uppercase tracking-wider">{rank} &mdash; {data.score}/100</p>
                                  </div>
                                </div>
                                <p className="text-[10px] sm:text-xs text-[#5a7a9a] leading-relaxed">{detail.trait}</p>
                              </div>
                            ))}
                          </div>

                          {/* Traits */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 px-1 sm:px-0">
                            <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                              <div className="flex items-center gap-1 mb-1">
                                <BookOpen className="w-3 h-3 text-blue-500" />
                                <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 uppercase tracking-wider">Learning Style</p>
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#5a7a9a] leading-relaxed">{d1.style}</p>
                            </div>
                            <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50/60 border border-amber-100">
                              <div className="flex items-center gap-1 mb-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                <p className="text-[9px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-wider">Core Strength</p>
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#5a7a9a] leading-relaxed">{d1.strength}</p>
                            </div>
                            <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Best Environment</p>
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#5a7a9a] leading-relaxed">{d1.environment}</p>
                            </div>
                            <div className="p-2.5 sm:p-3 rounded-lg bg-rose-50/60 border border-rose-100">
                              <div className="flex items-center gap-1 mb-1">
                                <Heart className="w-3 h-3 text-rose-500" />
                                <p className="text-[9px] sm:text-[10px] font-bold text-rose-700 uppercase tracking-wider">Growth Area</p>
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#5a7a9a] leading-relaxed">
                                <span className="font-semibold text-[#1e3a5f]">{lowest.subject}</span> ({lowest.score}/100) &mdash; developing this creates a more well-rounded profile.
                              </p>
                            </div>
                          </div>

                          {/* Blend Summary */}
                          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-[#1e3a5f]/5 rounded-lg border border-[#1e3a5f]/10 mx-1 sm:mx-0">
                            <p className="text-[10px] sm:text-xs text-[#1e3a5f] leading-relaxed">
                              <span className="font-bold">Your blend:</span> As a <span className="font-semibold text-[#c9a227]">{top1.subject}&ndash;{top2.subject}</span>, you bring {d1.strength.toLowerCase()} paired with {d2.strength.toLowerCase()} &mdash; a unique mix for roles requiring both {top1.subject.toLowerCase()}-level thinking and {top2.subject.toLowerCase()}-driven execution.
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-1 lg:col-span-1"
              >
                <Card className="border-[#e5e0d5] h-full">
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-xl text-[#1e3a5f] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a227]" />
                      Top Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1.5 sm:space-y-2">
                    {assessment.strengths_analysis?.competitiveAdvantages?.map((strength: string, index: number) => {
                      const hasColon = strength.includes(':')
                      const label = hasColon ? strength.split(':')[0].trim() : strength
                      const detail = hasColon ? strength.split(':').slice(1).join(':').trim() : ''
                      return (
                        <div key={index} className="border-b border-[#e5e0d5] last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-start gap-2 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[#1e3a5f] text-xs sm:text-sm font-medium leading-snug">{label}</p>
                          </div>
                          {detail && (
                            <p className="text-[11px] sm:text-xs text-[#5a7a9a] leading-relaxed pl-[22px]">{detail}</p>
                          )}
                        </div>
                      )
                    })}
                    <div className="pt-3 mt-1 sm:mt-2 border-t-2 border-[#e5e0d5]">
                      <p className="text-[10px] sm:text-xs text-[#5a7a9a] font-bold uppercase tracking-widest mb-2">Unique Differentiators</p>
                      {assessment.strengths_analysis?.uniqueDifferentiators?.map((diff: string, index: number) => {
                        const hasColon = diff.includes(':')
                        const label = hasColon ? diff.split(':')[0].trim() : diff
                        const detail = hasColon ? diff.split(':').slice(1).join(':').trim() : ''
                        return (
                          <div key={index} className="pb-1.5 last:pb-0">
                            <div className="flex items-start gap-2 py-1">
                              <Award className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0 mt-0.5" />
                              <p className="text-[#1e3a5f] text-xs sm:text-sm font-medium leading-snug">{label}</p>
                            </div>
                            {detail && (
                              <p className="text-[11px] sm:text-xs text-[#5a7a9a] leading-relaxed pl-[22px]">{detail}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

                {isPhase2Loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-gradient-to-r from-[#1e3a5f]/5 to-[#c9a227]/5 border border-[#c9a227]/20 rounded-xl p-4 flex items-center gap-3"
                  >
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: secondaryColor }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: primaryColor }}>
                        Generating detailed recommendations...
                      </p>
                      <p className="text-xs text-[#5a7a9a]">
                        Your core analysis is ready below. Remaining tabs will unlock automatically over the next 5-10 minutes.
                      </p>
                    </div>
                  </motion.div>
                )}

                <Tabs defaultValue="roadmap" className="mb-8 sm:mb-12 w-full">
                  <div className="sm:max-w-full sm:overflow-x-auto scrollbar-hide sm:-mx-0 sm:px-0">
                    <TabsList className="bg-white/40 backdrop-blur-2xl border border-white/20 p-1.5 sm:p-2 grid grid-cols-4 sm:grid-cols-7 h-auto gap-1 sm:gap-2 shadow-2xl shadow-[#1e3a5f]/5 rounded-xl sm:rounded-[2.5rem] w-full scrollbar-hide mb-2">
                      {[
                        { value: "roadmap", icon: Calendar, label: "Roadmap" },
                        { value: "gaps", icon: AlertCircle, label: "Gaps" },
                        { value: "projects", icon: Lightbulb, label: "Projects" },
                        { value: "career-future", icon: Compass, label: "Career" },
                        { value: "academics", icon: BookOpen, label: "Academics" },
                        { value: "testing", icon: Target, label: "Testing" },
                        { value: "scholarships", icon: DollarSign, label: "Scholarships" },
                        { value: "activities", icon: Trophy, label: "Activities" },
                        { value: "college-match", icon: Building, label: "Colleges" },
                        { value: "essays", icon: PenLine, label: "Essays" },
                      ].map(({ value, icon: Icon, label }) => (
                        <TabsTrigger key={value} value={value} className="brand-tab px-1 sm:px-2 py-2 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold flex flex-col items-center gap-0.5 sm:gap-1.5 h-full min-w-0 relative">
                          <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          <span className="text-[7px] sm:text-[10px] uppercase tracking-tight leading-tight truncate w-full text-center">{label}</span>
                          {isPhase2Loading && PHASE_2_TABS.has(value) && (
                            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#c9a227] rounded-full animate-pulse" />
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                <TabsContent value="timeline" className="mt-6">
                <div className="space-y-6">
                  {assessment.grade_by_grade_roadmap ? (
                    <>
                      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Your Multi-Year Roadmap
                        </h3>
                        <p className="text-white/90 text-sm sm:text-base">
                          A comprehensive plan from {assessment.grade_by_grade_roadmap.currentGrade.grade} through graduation. Each year builds on the last to maximize your college application strength.
                        </p>
                      </div>

                      {(() => {
                        const allYears = [
                          { ...assessment.grade_by_grade_roadmap!.currentGrade, isCurrent: true },
                          ...(assessment.grade_by_grade_roadmap!.nextYears || []).map((y: any) => ({ ...y, isCurrent: false }))
                        ]

                        const timelineSections = [
                          { key: 'academics', title: 'Academics', icon: BookOpen, color: '#6366f1' },
                          { key: 'research', title: 'Research', icon: FlaskConical, color: '#06b6d4', altKey: 'research_milestones' },
                          { key: 'extracurriculars', title: 'Activities', icon: Trophy, color: '#c9a227' },
                          { key: 'testing', title: 'Testing', icon: Target, color: '#3b82f6' },
                          { key: 'leadership', title: 'Leadership', icon: Flag, color: '#ef4444' },
                          { key: 'passionProjects', title: 'Passion Projects', icon: Lightbulb, color: '#c9a227', altKey: 'passion_projects' },
                        ]

                        const getItemText = (item: any): string => typeof item === 'object' ? (item.title || item.description || '') : item
                        const splitItem = (text: string) => {
                          const colonIdx = text.indexOf(':')
                          if (colonIdx > 0 && colonIdx < 80) {
                            return { heading: text.slice(0, colonIdx).trim(), detail: text.slice(colonIdx + 1).trim() }
                          }
                          if (text.length > 60) {
                            const dashIdx = text.indexOf(' \u2013 ')
                            if (dashIdx > 0 && dashIdx < 80) return { heading: text.slice(0, dashIdx).trim(), detail: text.slice(dashIdx + 3).trim() }
                            const periodIdx = text.indexOf('. ')
                            if (periodIdx > 0 && periodIdx < 80) return { heading: text.slice(0, periodIdx).trim(), detail: text.slice(periodIdx + 2).trim() }
                          }
                          return { heading: text, detail: '' }
                        }

                        return (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c9a227] via-[#1e3a5f] to-[#c9a227]" />

                            {allYears.map((yearData: any, yearIndex: number) => (
                              <div key={yearIndex} className="relative mb-8 ml-10 sm:ml-20">
                                <div className={`absolute -left-[36px] sm:-left-[52px] top-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 border-[#faf8f3] shadow-lg ${yearData.isCurrent ? 'bg-[#c9a227]' : 'bg-[#1e3a5f]'}`}>
                                  {yearData.isCurrent
                                    ? <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    : <span className="text-white text-xs sm:text-sm font-bold">{yearIndex + 1}</span>
                                  }
                                </div>
                                <Card className={yearData.isCurrent ? 'border-2 border-[#c9a227] shadow-lg' : 'border-[#e5e0d5]'}>
                                  <CardHeader className={yearData.isCurrent ? 'bg-gradient-to-r from-[#c9a227]/10 to-transparent p-4 sm:p-6' : 'p-4 sm:p-6'}>
                                    <div className="flex items-center gap-2">
                                      {yearData.isCurrent && <Badge className="bg-[#c9a227] text-white">Current Year</Badge>}
                                      <CardTitle className="text-xl sm:text-2xl text-[#1e3a5f]">{yearData.grade}</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm sm:text-base mt-1">{yearData.focus}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-3 sm:p-6">
                                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                      {timelineSections.map(({ key, title, icon: SectionIcon, color, altKey }) => {
                                        const items = yearData[key] || (altKey ? yearData[altKey] : []) || []
                                        if (!Array.isArray(items) || items.length === 0) return null
                                        return (
                                          <div key={key}>
                                            <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                              <SectionIcon className="w-4 h-4" style={{ color }} />
                                              {title}
                                              <span className="ml-auto text-[10px] font-bold text-[#5a7a9a]/40">{items.length}</span>
                                            </h4>
                                            <Accordion type="multiple" className="space-y-0.5">
                                              {items.map((item: any, i: number) => {
                                                const text = getItemText(item)
                                                const { heading, detail } = splitItem(text)
                                                return (
                                                  <AccordionItem key={i} value={`${key}-${i}`} className="border-none">
                                                    {detail ? (
                                                      <>
                                                        <AccordionTrigger className="py-1.5 hover:no-underline">
                                                          <div className="flex items-start gap-2 text-left">
                                                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                                                            <span className="text-[13px] font-medium text-[#1e3a5f] leading-snug">{heading}</span>
                                                          </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pb-1.5 pl-3.5">
                                                          <p className="text-xs text-[#5a7a9a] leading-relaxed">{detail}</p>
                                                        </AccordionContent>
                                                      </>
                                                    ) : (
                                                      <div className="flex items-start gap-2 py-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                                                        <span className="text-[13px] text-[#5a7a9a] leading-snug">{heading}</span>
                                                      </div>
                                                    )}
                                                  </AccordionItem>
                                                )
                                              })}
                                            </Accordion>
                                          </div>
                                        )
                                      })}
                                    </div>
                                    {yearData.summerPlan && (() => {
                                      const planText = String(yearData.summerPlan)
                                      const parts = planText.split(/(?:(?<=\.)\s+(?=[A-Z]))|(?=\b(?:Secondary|Tertiary|Total|Deliverables|Commitment):)/g)
                                        .map((s: string) => s.replace(/^(?:Secondary|Tertiary|Primary|Deliverables|Commitment|Total)[:\s]*/i, '').trim())
                                        .filter((s: string) => s.length > 0)
                                      return (
                                        <div className="mt-4 pt-4 border-t border-[#e5e0d5]">
                                          <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-sm">
                                            <Sun className="w-4 h-4 text-[#f59e0b]" />
                                            Summer Plan
                                          </h4>
                                          <ul className="space-y-1.5 bg-[#f0ece3] p-3 rounded-lg">
                                            {parts.map((part: string, pi: number) => (
                                              <li key={pi} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 flex-shrink-0" />
                                                <span className="text-[13px] text-[#5a7a9a] leading-snug break-words">{part}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )
                                    })()}
                                  </CardContent>
                                </Card>
                              </div>
                            ))}
                          </motion.div>
                        )
                      })()}
                    </>
                  ) : (
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="pt-6 text-center">
                        <Calendar className="w-12 h-12 text-[#5a7a9a] mx-auto mb-4" />
                        <p className="text-[#5a7a9a]">Grade-by-grade timeline not available for this assessment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

                <TabsContent value="gaps" className="mt-6">
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { title: "Missing Elements", desc: "Areas to develop for target schools", icon: AlertCircle, items: assessment.gap_analysis?.missingElements, color: "#ef4444", accent: "bg-red-50" },
                  { title: "Activities to Deepen", desc: "Existing activities needing more depth", icon: TrendingUp, items: assessment.gap_analysis?.activitiesToDeepen, color: "#f97316", accent: "bg-orange-50" },
                  { title: "Skills to Develop", desc: "Skills needed for career goals", icon: BookOpen, items: assessment.gap_analysis?.skillsToDevelop || assessment.gap_analysis?.skillsToDevelope, color: "#3b82f6", accent: "bg-blue-50" },
                  { title: "Vulnerabilities", desc: "Weak spots admissions officers may flag", icon: Target, items: (assessment.gap_analysis as any)?.vulnerabilities, color: "#8b5cf6", accent: "bg-violet-50" },
                ].filter(section => section.items && section.items.length > 0).map(({ title, desc, icon: SectionIcon, items, color, accent }) => (
                  <Card key={title} className="border-[#e5e0d5]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                          <SectionIcon className="w-5 h-5" style={{ color }} />
                          {title}
                        </CardTitle>
                        <Badge className="text-[10px] font-medium" style={{ backgroundColor: `${color}15`, color }}>{items!.length} items</Badge>
                      </div>
                      <CardDescription className="text-xs">{desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" className="space-y-1">
                        {items!.map((item: string, i: number) => {
                          const colonIdx = item.indexOf(':')
                          let heading = item
                          let detail = ''
                          if (colonIdx > 0 && colonIdx < 80) {
                            heading = item.slice(0, colonIdx).trim()
                            detail = item.slice(colonIdx + 1).trim()
                          }
                          return (
                            <AccordionItem key={i} value={`${title}-${i}`} className={`${accent} rounded-lg border-none px-3`}>
                              <AccordionTrigger className="py-2 hover:no-underline">
                                <div className="flex items-center gap-2 text-left">
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: color }}>{i + 1}</span>
                                  <span className="text-[13px] font-medium text-[#1e3a5f] leading-snug">{heading}</span>
                                </div>
                              </AccordionTrigger>
                              {detail && (
                                <AccordionContent className="pb-2 pl-7">
                                  <p className="text-[13px] text-[#5a7a9a] leading-relaxed">{detail}</p>
                                </AccordionContent>
                              )}
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

                <TabsContent value="projects" className="mt-6">
                  {!assessment.passion_projects && isPhase2Loading ? <Phase2Placeholder tabKey="projects" /> : assessment.passion_projects && assessment.passion_projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {assessment.passion_projects.map((project, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-[#e5e0d5] h-full hover:shadow-2xl transition-all duration-500 flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-white group">
                            <CardHeader className="pb-3 sm:pb-4 pt-5 sm:pt-8 px-4 sm:px-8 relative">
                              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-[#1e3a5f] font-bold leading-tight group-hover:text-[#c9a227] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                                  {project.title}
                                </CardTitle>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                                <Badge className="bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-normal h-auto text-left leading-relaxed">
                                  {project.timeCommitment}
                                </Badge>
                              </div>
                              <CardDescription className="text-[#5a7a9a] text-sm sm:text-base leading-relaxed italic">
                                {project.description}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5 sm:space-y-8 flex-1 pt-3 sm:pt-4 px-4 sm:px-8 pb-6 sm:pb-10">
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-[#c9a227]" />
                                  Skills Developed
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.skillsDeveloped?.map((skill, i) => (
                                    <span key={i} className="bg-[#f3f4f6] text-[#5a7a9a] text-xs px-4 py-2 rounded-full font-medium border border-[#e5e7eb]">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2">
                                  <Target className="w-4 h-4 text-[#c9a227]" />
                                  Application Impact
                                </h4>
                                <p className="text-sm text-[#5a7a9a] leading-relaxed">
                                  {project.applicationImpact}
                                </p>
                              </div>

                              {project.resources && (
                                <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e0d5]/50">
                                  <p className="text-xs text-[#5a7a9a]">
                                    <span className="font-bold text-[#1e3a5f] uppercase tracking-tighter mr-2">Resources:</span>
                                    {project.resources}
                                  </p>
                                </div>
                              )}

                              <div className="pt-6 border-t border-[#f0f0f0]">
                                <h4 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-[#c9a227]" />
                                  Implementation Steps
                                </h4>
                                <ol className="space-y-4">
                                  {project.implementationSteps ? (
                                    project.implementationSteps.map((step: string, i: number) => (
                                      <li key={i} className="flex items-start gap-4 text-sm text-[#5a7a9a] leading-relaxed">
                                        <span className="font-bold text-[#c9a227] min-w-[20px]">{i + 1}.</span>
                                        <span>{step}</span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-sm text-[#5a7a9a] italic">Implementation steps provided in full PDF report.</li>
                                  )}
                                </ol>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="pt-12 pb-12 text-center">
                        <div className="w-16 h-16 bg-[#f0ece3] rounded-full flex items-center justify-center mx-auto mb-6">
                          <Lightbulb className="w-8 h-8 text-[#c9a227]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Generating Passion Projects...</h3>
                        <p className="text-[#5a7a9a] max-w-md mx-auto">
                          Our AI is still processing your unique spikes. Please refresh in a moment or check the full PDF report.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Research section (merged into Projects tab) */}
                  {assessment.research_publications_recommendations ? (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2 pb-2 border-b border-[#e5e0d5]">
                        <FlaskConical className="w-5 h-5 text-[#06b6d4]" />
                        Research & Publications
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <RecommendationCard title="Research Topics" icon={FlaskConical} items={assessment.research_publications_recommendations.researchTopics} color="#06b6d4" />
                        <RecommendationCard title="Where to Publish" icon={FileText} items={assessment.research_publications_recommendations.publicationOpportunities} color="#8b5cf6" />
                        <RecommendationCard title="Finding Mentors" icon={Users} items={assessment.research_publications_recommendations.mentorshipSuggestions} color="#f59e0b" />
                      </div>
                      {assessment.research_publications_recommendations.timeline && (
                        <Card className="border-[#e5e0d5]"><CardContent className="p-4"><p className="text-sm font-semibold text-[#1e3a5f] mb-1">Research Timeline</p><p className="text-sm text-[#5a7a9a]">{assessment.research_publications_recommendations.timeline}</p></CardContent></Card>
                      )}
                    </div>
                  ) : isPhase2Loading ? <Phase2Placeholder tabKey="research" /> : null}
                </TabsContent>

            <TabsContent value="research" className="mt-6">
              {!assessment.research_publications_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="research" /> : <div className="grid md:grid-cols-2 gap-6">
                {/* Research Topics - Left Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-5 h-5 text-[#06b6d4]" />
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">Research Topics</h3>
                    <span className="text-[10px] font-bold text-[#5a7a9a]/50 uppercase tracking-widest ml-auto">
                      {(assessment.research_publications_recommendations?.researchTopics || []).length}
                    </span>
                  </div>
                  <Accordion type="multiple" className="space-y-2">
                    {(Array.isArray(assessment.research_publications_recommendations?.researchTopics) ? assessment.research_publications_recommendations.researchTopics : []).map((item: any, index: number) => {
                      const text = String(item)
                      const stripped = text.replace(/^Topic\s*\d+\s*\([^)]*\)\s*:\s*/i, '').trim()
                      const quoteMatch = stripped.match(/^['"]([^'"]+)['"]\s*[.:]?\s*([\s\S]*)$/)
                      let title: string
                      let detail: string
                      if (quoteMatch) {
                        title = quoteMatch[1].trim()
                        detail = (quoteMatch[2] || '').trim()
                      } else {
                        const colonIdx = stripped.indexOf(':')
                        const hasColon = colonIdx > 0 && colonIdx < 80
                        title = hasColon ? stripped.slice(0, colonIdx).trim() : (stripped.length > 80 ? stripped.slice(0, 80).trim() + '...' : stripped)
                        detail = hasColon ? stripped.slice(colonIdx + 1).trim() : (stripped.length > 80 ? stripped : '')
                      }
                      detail = detail.trim()
                      return (
                        <AccordionItem key={index} value={`rt-${index}`} className="border border-[#e5e0d5] rounded-lg overflow-hidden bg-white">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#faf8f3]">
                            <div className="flex items-center gap-3 text-left">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-bold shrink-0">{index + 1}</span>
                              <span className="text-sm font-semibold text-[#1e3a5f] leading-snug">{title}</span>
                            </div>
                          </AccordionTrigger>
                          {detail && (
                            <AccordionContent className="px-4 pb-4 pt-0">
                              <div className="pl-9">
                                <p className="text-[13px] text-[#5a7a9a] leading-relaxed">{detail}</p>
                              </div>
                            </AccordionContent>
                          )}
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>

                {/* Publication Opportunities - Right Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[#8b5cf6]" />
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">Where to Publish</h3>
                  </div>
                  <div className="space-y-2">
                    {(Array.isArray(assessment.research_publications_recommendations?.publicationOpportunities) ? assessment.research_publications_recommendations.publicationOpportunities : []).map((item: any, index: number) => {
                      const text = String(item)
                      const colonIdx = text.indexOf(':')
                      const name = colonIdx > 0 && colonIdx < 80 ? text.slice(0, colonIdx).replace(/^\*+|\*+$/g, '').trim() : null
                      const desc = colonIdx > 0 && colonIdx < 80 ? text.slice(colonIdx + 1).trim() : text
                      return (
                        <div key={index} className="p-3 bg-[#faf8f3] rounded-lg border border-[#e5e0d5] hover:border-[#8b5cf6]/30 transition-colors">
                          {name ? (
                            <div className="flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1e3a5f] leading-snug">{name}</p>
                                <p className="text-xs text-[#5a7a9a] leading-relaxed mt-0.5">{desc}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-[#5a7a9a] leading-relaxed">{text}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>}
            </TabsContent>

                <TabsContent value="career-future" className="mt-6">
                  {!assessment.career_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="career-future" /> : <div className="space-y-6">
                    <Card className="border-[#e5e0d5] bg-[#1e3a5f] text-white overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Linkedin className="w-24 h-24" />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Linkedin className="w-5 h-5 text-[#c9a227]" />
                          LinkedIn Bio Headline
                        </CardTitle>
                        <CardDescription className="text-white/60">Optimized for visibility and networking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 sm:p-6 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                          <p className="text-sm sm:text-lg font-medium italic text-white leading-relaxed">
                            &quot;{assessment.career_recommendations?.linkedInBioHeadline}&quot;
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-[#e5e0d5]">
                          <CardHeader>
                            <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-[#c9a227]" />
                              Job Title Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-3">
                              {assessment.career_recommendations?.jobTitles?.map((title, i) => (
                                <Badge key={i} variant="secondary" className="bg-[#f0ece3] text-[#1e3a5f] text-sm py-2 px-4 whitespace-normal h-auto text-left leading-relaxed border-[#e5e0d5]">
                                  {title}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-[#e5e0d5]">
                          <CardHeader>
                            <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-[#10b981]" />
                              Salary Potential
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-[#5a7a9a] leading-relaxed bg-[#f0ece3] p-4 rounded-lg break-words">
                              {assessment.career_recommendations?.salaryPotential}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2">
                          <Compass className="w-6 h-6 text-[#c9a227]" />
                          Blue Ocean Industries
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {assessment.career_recommendations?.blueOceanIndustries?.map((industry, i) => (
                            <Card key={i} className="border-[#e5e0d5]">
                              <CardHeader>
                                <CardTitle className="text-lg text-[#1e3a5f] break-words">{industry.industry}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-[#5a7a9a] leading-relaxed break-words">
                                  {industry.why}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                  </div>}

                  {/* Network/Mentors section (merged into Career tab) */}
                  {assessment.mentor_recommendations?.mentors?.length > 0 ? (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2 pb-2 border-b border-[#e5e0d5]">
                        <Users className="w-5 h-5 text-[#8b5cf6]" />
                        Strategic Network & Mentors
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessment.mentor_recommendations.mentors.map((mentor: { name: string; university: string; department: string; why: string }, idx: number) => (
                          <Card key={idx} className="border-[#e5e0d5]">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-[#1e3a5f]">{mentor.name}</CardTitle>
                              <CardDescription className="text-xs">{mentor.university}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <Badge className="mb-2 text-[10px]" variant="outline">{mentor.department}</Badge>
                              <p className="text-xs text-[#5a7a9a]"><strong>Why?</strong> {mentor.why}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : isPhase2Loading && !assessment.mentor_recommendations ? <Phase2Placeholder tabKey="network" /> : null}
                </TabsContent>

            <TabsContent value="academics" className="mt-6">
              {!assessment.academic_courses_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="academics" /> : <div className="grid md:grid-cols-2 gap-5">
                {[
                  { title: "AP Courses", icon: BookOpen, items: assessment.academic_courses_recommendations?.apCourses, color: "#6366f1", accent: "bg-indigo-50" },
                  { title: "IB Courses", icon: GraduationCap, items: assessment.academic_courses_recommendations?.ibCourses, color: "#8b5cf6", accent: "bg-violet-50" },
                  { title: "Honors Courses", icon: Award, items: assessment.academic_courses_recommendations?.honorsCourses, color: "#ec4899", accent: "bg-pink-50" },
                  { title: "Strategic Electives", icon: Lightbulb, items: assessment.academic_courses_recommendations?.electivesRecommended, color: "#f59e0b", accent: "bg-amber-50" },
                ].map(({ title, icon: SectionIcon, items, color, accent }) => {
                  if (!items || items.length === 0) {
                    if (title === "IB Courses") return (
                      <Card key={title} className="border-[#e5e0d5]">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                            <SectionIcon className="w-5 h-5" style={{ color }} />
                            {title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-[#5a7a9a] italic">No IB courses recommended based on your profile. Focus on AP and Honors courses instead.</p>
                        </CardContent>
                      </Card>
                    )
                    return null
                  }
                  return (
                    <Card key={title} className="border-[#e5e0d5]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                          <SectionIcon className="w-5 h-5" style={{ color }} />
                          {title}
                          <Badge className="ml-auto text-xs font-medium" style={{ backgroundColor: `${color}15`, color }}>{items.length} courses</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="space-y-2">
                          {items.map((item, i) => {
                            const colonIdx = item.indexOf(':')
                            const parenIdx = item.indexOf('(')
                            let courseName = item
                            let detail = ''
                            if (colonIdx > 0 && colonIdx < 80) {
                              courseName = item.slice(0, colonIdx).trim()
                              detail = item.slice(colonIdx + 1).trim()
                            } else if (parenIdx > 0 && parenIdx < 80) {
                              courseName = item.slice(0, parenIdx).trim()
                              detail = item.slice(parenIdx).trim()
                            }
                            return (
                              <AccordionItem key={i} value={`${title}-${i}`} className={`${accent} rounded-lg border-none px-4`}>
                                <AccordionTrigger className="py-3 hover:no-underline">
                                  <div className="flex items-center gap-3 text-left">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: color }}>{i + 1}</span>
                                    <span className="text-sm font-semibold text-[#1e3a5f]">{courseName}</span>
                                  </div>
                                </AccordionTrigger>
                                {detail && (
                                  <AccordionContent className="pb-3 pl-9">
                                    <p className="text-sm text-[#5a7a9a] leading-relaxed">{detail}</p>
                                  </AccordionContent>
                                )}
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>}
            </TabsContent>

            <TabsContent value="testing" className="mt-6">
              {!assessment.sat_act_goals && isPhase2Loading ? <Phase2Placeholder tabKey="testing" /> : <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* SAT Goals */}
                  <Card className="border-[#e5e0d5]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#3b82f6]" />
                        SAT Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-[#1e3a5f] rounded-xl">
                        <p className="text-[10px] font-medium text-[#c9a227] uppercase tracking-widest mb-0.5">Target Composite</p>
                        <p className="text-base font-bold text-white leading-snug">
                          {(() => {
                            const score = String(assessment.sat_act_goals?.targetSATScore || '')
                            const numMatch = score.match(/^[\d,\s\-\u2013]+/)
                            if (numMatch && score.length > numMatch[0].length + 5) {
                              return numMatch[0].trim()
                            }
                            return score
                          })()}
                        </p>
                      </div>
                      {(() => {
                        const score = String(assessment.sat_act_goals?.targetSATScore || '')
                        const numMatch = score.match(/^[\d,\s\-\u2013]+/)
                        if (numMatch && score.length > numMatch[0].length + 5) {
                          const detail = score.slice(numMatch[0].length).replace(/^\s*[\(\-\u2013:]\s*/, '').replace(/\)\s*$/, '').trim()
                          if (detail) return (
                            <Accordion type="single" collapsible className="-mt-1">
                              <AccordionItem value="sat-detail" className="border-0">
                                <AccordionTrigger className="py-2 px-3 text-xs text-[#5a7a9a] hover:no-underline bg-[#faf8f3] rounded-lg">
                                  Score breakdown &amp; rationale
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pt-1 pb-2 text-xs text-[#5a7a9a] leading-relaxed">
                                  {detail}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )
                        }
                        return null
                      })()}
                      <Accordion type="multiple" className="space-y-1.5">
                        {[
                          { label: "Reading", value: assessment.sat_act_goals?.satSectionGoals?.reading },
                          { label: "Writing", value: assessment.sat_act_goals?.satSectionGoals?.writing },
                          { label: "Math", value: assessment.sat_act_goals?.satSectionGoals?.math },
                        ].filter(s => s.value).map((section) => {
                          const text = String(section.value || '')
                          const scoreMatch = text.match(/^([\d,\s\-\u2013]+)/)
                          const shortLabel = scoreMatch ? scoreMatch[0].trim() : (text.length > 60 ? text.slice(0, 50) + '\u2026' : text)
                          const hasDetail = text.length > 60
                          return hasDetail ? (
                            <AccordionItem key={section.label} value={`sat-${section.label}`} className="border border-[#e5e0d5] rounded-lg overflow-hidden">
                              <AccordionTrigger className="py-2.5 px-3 hover:no-underline hover:bg-[#faf8f3]">
                                <div className="flex items-center gap-2 text-left">
                                  <span className="text-[10px] font-bold text-[#5a7a9a] uppercase tracking-widest min-w-[55px]">{section.label}</span>
                                  <span className="text-sm font-semibold text-[#1e3a5f]">{shortLabel}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3 pt-0 text-sm text-[#5a7a9a] leading-relaxed">
                                {text}
                              </AccordionContent>
                            </AccordionItem>
                          ) : (
                            <div key={section.label} className="flex items-center gap-2 py-2.5 px-3 border border-[#e5e0d5] rounded-lg">
                              <span className="text-[10px] font-bold text-[#5a7a9a] uppercase tracking-widest min-w-[55px]">{section.label}</span>
                              <span className="text-sm text-[#1e3a5f]">{text}</span>
                            </div>
                          )
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>

                  {/* ACT Goals */}
                  <Card className="border-[#e5e0d5]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#10b981]" />
                        ACT Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-[#1e3a5f] rounded-xl">
                        <p className="text-[10px] font-medium text-[#c9a227] uppercase tracking-widest mb-0.5">Target Composite</p>
                        <p className="text-base font-bold text-white leading-snug">
                          {(() => {
                            const score = String(assessment.sat_act_goals?.targetACTScore || '')
                            const numMatch = score.match(/^[\d,\s\-\u2013]+/)
                            if (numMatch && score.length > numMatch[0].length + 5) {
                              return numMatch[0].trim()
                            }
                            return score
                          })()}
                        </p>
                      </div>
                      {(() => {
                        const score = String(assessment.sat_act_goals?.targetACTScore || '')
                        const numMatch = score.match(/^[\d,\s\-\u2013]+/)
                        if (numMatch && score.length > numMatch[0].length + 5) {
                          const detail = score.slice(numMatch[0].length).replace(/^\s*[\(\-\u2013:]\s*/, '').replace(/\)\s*$/, '').trim()
                          if (detail) return (
                            <Accordion type="single" collapsible className="-mt-1">
                              <AccordionItem value="act-detail" className="border-0">
                                <AccordionTrigger className="py-2 px-3 text-xs text-[#5a7a9a] hover:no-underline bg-[#faf8f3] rounded-lg">
                                  Score breakdown &amp; rationale
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pt-1 pb-2 text-xs text-[#5a7a9a] leading-relaxed">
                                  {detail}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )
                        }
                        return null
                      })()}
                      <Accordion type="multiple" className="space-y-1.5">
                        {[
                          { label: "English", value: assessment.sat_act_goals?.actSectionGoals?.english },
                          { label: "Math", value: assessment.sat_act_goals?.actSectionGoals?.math },
                          { label: "Reading", value: assessment.sat_act_goals?.actSectionGoals?.reading },
                          { label: "Science", value: assessment.sat_act_goals?.actSectionGoals?.science },
                        ].filter(s => s.value).map((section) => {
                          const text = String(section.value || '')
                          const scoreMatch = text.match(/^([\d,\s\-\u2013]+)/)
                          const shortLabel = scoreMatch ? scoreMatch[0].trim() : (text.length > 60 ? text.slice(0, 50) + '\u2026' : text)
                          const hasDetail = text.length > 60
                          return hasDetail ? (
                            <AccordionItem key={section.label} value={`act-${section.label}`} className="border border-[#e5e0d5] rounded-lg overflow-hidden">
                              <AccordionTrigger className="py-2.5 px-3 hover:no-underline hover:bg-[#faf8f3]">
                                <div className="flex items-center gap-2 text-left">
                                  <span className="text-[10px] font-bold text-[#5a7a9a] uppercase tracking-widest min-w-[55px]">{section.label}</span>
                                  <span className="text-sm font-semibold text-[#1e3a5f]">{shortLabel}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3 pt-0 text-sm text-[#5a7a9a] leading-relaxed">
                                {text}
                              </AccordionContent>
                            </AccordionItem>
                          ) : (
                            <div key={section.label} className="flex items-center gap-2 py-2.5 px-3 border border-[#e5e0d5] rounded-lg">
                              <span className="text-[10px] font-bold text-[#5a7a9a] uppercase tracking-widest min-w-[55px]">{section.label}</span>
                              <span className="text-sm text-[#1e3a5f]">{text}</span>
                            </div>
                          )
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>

                {/* Prep Strategy & Timeline */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#1e3a5f]">Prep Strategy &amp; Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="space-y-2">
                      <AccordionItem value="prep-strategy" className="border border-[#e5e0d5] rounded-lg overflow-hidden">
                        <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-[#faf8f3]">
                          <span className="text-sm font-semibold text-[#1e3a5f]">Preparation Strategy</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1">
                          <div className="text-sm text-[#5a7a9a] leading-relaxed space-y-2">
                            {(() => {
                              const prep = String(assessment.sat_act_goals?.prepStrategy || '')
                              const sentences = prep.split(/(?:Phase\s+\d+|(?<=\.)\s+(?=[A-Z]))/g).filter((s: string) => s.trim().length > 10)
                              if (sentences.length > 1) {
                                return sentences.map((sentence: string, i: number) => (
                                  <p key={i} className="flex gap-2">
                                    <span className="text-[#c9a227] mt-0.5 shrink-0">&#8226;</span>
                                    <span>{sentence.replace(/^\s*[\d\):.\-\u2013]+\s*/, '').trim()}</span>
                                  </p>
                                ))
                              }
                              return <p>{prep}</p>
                            })()}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="timeline" className="border border-[#e5e0d5] rounded-lg overflow-hidden">
                        <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-[#faf8f3]">
                          <span className="text-sm font-semibold text-[#1e3a5f]">Recommended Timeline</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1">
                          <div className="text-sm text-[#5a7a9a] leading-relaxed space-y-2">
                            {assessment.sat_act_goals?.timeline?.split(/\.\s+/).filter(Boolean).map((sentence: string, i: number) => (
                              <p key={i} className="flex gap-2">
                                <span className="text-[#c9a227] mt-0.5 shrink-0">&#8226;</span>
                                <span>{sentence.trim().replace(/\.$/, '')}.</span>
                              </p>
                            )) || <p>{assessment.sat_act_goals?.timeline}</p>}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>}
            </TabsContent>

            <TabsContent value="scholarships" className="mt-6">
              {!assessment.scholarship_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="scholarships" /> : <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152a45] p-6 rounded-2xl text-white">
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Scholarship Opportunities
                  </h3>
                  <p className="text-white/70 text-sm">
                    Curated scholarships matched to your profile, interests, and background. Regenerate your report to get the latest personalized recommendations.
                  </p>
                </div>
                {(() => {
                  const scholarships = assessment.scholarship_recommendations?.scholarships
                  if (!Array.isArray(scholarships) || scholarships.length === 0) {
                    return (
                      <div className="text-center py-16 px-6">
                        <DollarSign className="w-10 h-10 text-[#5a7a9a]/30 mx-auto mb-3" />
                        <p className="text-[#5a7a9a] font-medium mb-1">Scholarship recommendations not yet generated</p>
                        <p className="text-sm text-[#5a7a9a]/70">Regenerate your report to receive 20 personalized scholarship matches.</p>
                      </div>
                    )
                  }
                  return (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scholarships.map((s: any, i: number) => (
                        <Card key={i} className="border-[#e5e0d5] hover:border-[#c9a227] transition-colors group flex flex-col">
                          <CardContent className="p-4 flex flex-col flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#c9a227]/10 text-[#c9a227] text-xs font-bold shrink-0">{i + 1}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1e3a5f] leading-snug">{String(s.name || '')}</p>
                                {s.organization && <p className="text-xs text-[#5a7a9a] mt-0.5">{String(s.organization)}</p>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {s.amount && (
                                <Badge className="bg-[#10b981]/10 text-[#10b981] border-0 text-xs font-semibold">{String(s.amount)}</Badge>
                              )}
                              {s.deadline && (
                                <Badge variant="outline" className="text-[#5a7a9a] border-[#e5e0d5] text-xs">{String(s.deadline)}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#5a7a9a] leading-relaxed mb-3 flex-1 line-clamp-3">{String(s.why || s.description || '')}</p>
                            {s.url && (
                              <a
                                href={String(s.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c9a227] hover:text-[#b08a1f] transition-colors mt-auto"
                              >
                                Apply Now <ArrowRight className="w-3 h-3" />
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                })()}
              </div>}
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              {!assessment.competitions_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="activities" /> : <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#f59e0b]" />
                    Summer Ivy Programs
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Pre-Freshman Programs"
                      icon={GraduationCap}
                      items={assessment.summer_ivy_programs_recommendations?.preFreshmanPrograms}
                      color="#6366f1"
                    />
                    <RecommendationCard
                      title="Competitive Programs"
                      icon={Trophy}
                      items={assessment.summer_ivy_programs_recommendations?.competitivePrograms}
                      color="#ef4444"
                    />
                    <RecommendationCard
                      title="Research Programs"
                      icon={FlaskConical}
                      items={assessment.summer_ivy_programs_recommendations?.researchPrograms}
                      color="#06b6d4"
                    />
                    <RecommendationCard
                      title="Enrichment Programs"
                      icon={BookOpen}
                      items={assessment.summer_ivy_programs_recommendations?.enrichmentPrograms}
                      color="#10b981"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#ef4444]" />
                    Sports
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Varsity Sports"
                      icon={Trophy}
                      items={assessment.sports_recommendations?.varsitySports}
                      color="#ef4444"
                    />
                    <RecommendationCard
                      title="Club Sports"
                      icon={Users}
                      items={assessment.sports_recommendations?.clubSports}
                      color="#f59e0b"
                    />
                    <RecommendationCard
                      title="Recruiting Strategy"
                      icon={Target}
                      items={assessment.sports_recommendations?.recruitingStrategy}
                      color="#3b82f6"
                    />
                    <RecommendationCard
                      title="Fitness Leadership"
                      icon={Flag}
                      items={assessment.sports_recommendations?.fitnessLeadership}
                      color="#10b981"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#c9a227]" />
                    Competitions
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Academic Competitions"
                      icon={BookOpen}
                      items={assessment.competitions_recommendations?.academicCompetitions}
                      color="#6366f1"
                    />
                    <RecommendationCard
                      title="Business Competitions"
                      icon={Briefcase}
                      items={assessment.competitions_recommendations?.businessCompetitions}
                      color="#10b981"
                    />
                    <RecommendationCard
                      title="Arts Competitions"
                      icon={Palette}
                      items={assessment.competitions_recommendations?.artsCompetitions}
                      color="#ec4899"
                    />
                    <RecommendationCard
                      title="Debate & Speech"
                      icon={Users}
                      items={assessment.competitions_recommendations?.debateSpeech}
                      color="#f59e0b"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#10b981]" />
                    Service &amp; Community
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Local Opportunities"
                      icon={Building}
                      items={assessment.service_community_recommendations?.localOpportunities}
                      color="#10b981"
                    />
                    <RecommendationCard
                      title="National Programs"
                      icon={Flag}
                      items={assessment.service_community_recommendations?.nationalPrograms}
                      color="#3b82f6"
                    />
                    <RecommendationCard
                      title="International Service"
                      icon={GraduationCap}
                      items={assessment.service_community_recommendations?.internationalService}
                      color="#8b5cf6"
                    />
                    <RecommendationCard
                      title="Sustained Commitment"
                      icon={TrendingUp}
                      items={assessment.service_community_recommendations?.sustainedCommitment}
                      color="#f59e0b"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#3b82f6]" />
                    Internships
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Industry Internships"
                      icon={Building}
                      items={assessment.internships_recommendations?.industryInternships}
                      color="#3b82f6"
                    />
                    <RecommendationCard
                      title="Research Internships"
                      icon={FlaskConical}
                      items={assessment.internships_recommendations?.researchInternships}
                      color="#06b6d4"
                    />
                    <RecommendationCard
                      title="Nonprofit Internships"
                      icon={Users}
                      items={assessment.internships_recommendations?.nonprofitInternships}
                      color="#10b981"
                    />
                    <RecommendationCard
                      title="Virtual Opportunities"
                      icon={Target}
                      items={assessment.internships_recommendations?.virtualOpportunities}
                      color="#8b5cf6"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#ec4899]" />
                    Culture &amp; Arts
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <RecommendationCard
                      title="Performing Arts"
                      icon={Users}
                      items={assessment.culture_arts_recommendations?.performingArts}
                      color="#ec4899"
                    />
                    <RecommendationCard
                      title="Visual Arts"
                      icon={Palette}
                      items={assessment.culture_arts_recommendations?.visualArts}
                      color="#f59e0b"
                    />
                    <RecommendationCard
                      title="Creative Writing"
                      icon={FileText}
                      items={assessment.culture_arts_recommendations?.creativeWriting}
                      color="#6366f1"
                    />
                    <RecommendationCard
                      title="Cultural Clubs"
                      icon={Users}
                      items={assessment.culture_arts_recommendations?.culturalClubs}
                      color="#10b981"
                    />
                  </div>
                </div>
              </div>}
            </TabsContent>

                <TabsContent value="college-match" className="mt-6">
                  {!assessment.college_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="college-match" /> : <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="border-[#e5e0d5]">
                        <CardHeader>
                          <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#ef4444]" />
                            Reach Schools
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {assessment.college_recommendations?.collegeBreakdown?.reach?.map((school, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#5a7a9a]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                                {school}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-[#e5e0d5]">
                        <CardHeader>
                          <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#3b82f6]" />
                            Target Schools
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {assessment.college_recommendations?.collegeBreakdown?.target?.map((school, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#5a7a9a]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                                {school}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-[#e5e0d5]">
                        <CardHeader>
                          <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                            Safety Schools
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {assessment.college_recommendations?.collegeBreakdown?.safety?.map((school, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#5a7a9a]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                {school}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {assessment.college_recommendations?.schoolMatches?.map((match, i) => (
                        <Card key={i} className="border-[#e5e0d5]">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                              <CardTitle className="text-[#1e3a5f]">{match.schoolName}</CardTitle>
                              <CardDescription>Compatibility Analysis</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#c9a227]">{match.matchScore}%</div>
                              <div className="text-[10px] text-[#5a7a9a] uppercase font-bold tracking-wider">Match Score</div>
                            </div>
                          </CardHeader>
                            <CardContent>
                              <div className="p-4 bg-[#f0ece3] rounded-lg border border-[#e5e0d5]">
                                <p className="text-sm text-[#5a7a9a] leading-relaxed break-words">
                                  <span className="font-bold text-[#1e3a5f]">Why?</span> {match.why}
                                </p>
                              </div>
                            </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>}
                </TabsContent>

                    <TabsContent value="network" className="mt-6">
                      {!assessment.mentor_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="network" /> : <div className="space-y-4 sm:space-y-6">
                        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152a45] p-4 sm:p-8 rounded-xl sm:rounded-2xl text-white">
                          <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Strategic Network Targets
                          </h3>
                          <p className="text-white/70 text-sm sm:text-base">
                            Connecting with the right mentors and professors is a critical differentiator for Ivy League admissions. We&apos;ve identified real professors, prioritizing those at local state schools and community colleges in your area for realistic networking opportunities.
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {(() => {
                            const validMentors = (assessment.mentor_recommendations?.mentors || []).filter((mentor: any) => {
                              const name = String(mentor?.name || '')
                              const uni = String(mentor?.university || '')
                              return !name.includes('[') && !uni.includes('[') && name.length > 3 && !name.includes('Last Name')
                            })
                            if (validMentors.length === 0) {
                              return (
                                <div className="sm:col-span-2 lg:col-span-3 text-center py-8 sm:py-12 px-4 sm:px-6">
                                  <Users className="w-10 h-10 text-[#5a7a9a]/30 mx-auto mb-3" />
                                  <p className="text-[#5a7a9a] font-medium mb-1">Mentor recommendations are being updated</p>
                                  <p className="text-sm text-[#5a7a9a]/70">Please regenerate your report to receive personalized mentor contacts with real professors near you.</p>
                                </div>
                              )
                            }
                            return validMentors.map((mentor: any, i: number) => (
                            <Card key={i} className="border-[#e5e0d5] hover:border-[#c9a227] transition-colors group">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#f0ece3] flex items-center justify-center group-hover:bg-[#c9a227]/10 transition-colors">
                                      <Users className="w-6 h-6 text-[#1e3a5f]" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-[#1e3a5f] text-base">{mentor.name}</CardTitle>
                                      <CardDescription className="text-xs">{mentor.university}</CardDescription>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5 text-xs">
                                      {mentor.department}
                                    </Badge>
                                    {(mentor as any).accessibilityTier && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${(mentor as any).accessibilityTier?.includes('Local') || (mentor as any).accessibilityTier?.includes('State')
                                          ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5'
                                          : 'text-[#8b5cf6] border-[#8b5cf6]/30 bg-[#8b5cf6]/5'}`}
                                      >
                                        {(mentor as any).accessibilityTier}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="p-3 bg-[#f0ece3] rounded-lg">
                                    <p className="text-sm text-[#5a7a9a] leading-relaxed break-words">
                                      <span className="font-bold text-[#1e3a5f]">Why?</span> {mentor.why}
                                    </p>
                                  </div>
                                </div>

                              {mentor.coldEmailTemplate && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5">
                                      <Mail className="w-4 h-4 mr-2" />
                                      View Outreach Template
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white mx-2">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#1e3a5f]">Outreach Template for {mentor.name}</DialogTitle>
                                      <DialogDescription>
                                        Use this template as a starting point. Personalize the bracketed sections [ ] with your specific details.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-3 sm:mt-4">
                                      <div className="p-3 sm:p-6 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl relative group">
                                        <pre className="text-xs sm:text-sm text-[#5a7a9a] whitespace-pre-wrap font-sans leading-relaxed">
                                          {mentor.coldEmailTemplate}
                                        </pre>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="absolute top-4 right-4 text-[#5a7a9a] hover:text-[#c9a227]"
                                          onClick={() => {
                                            navigator.clipboard.writeText(mentor.coldEmailTemplate || "")
                                            toast.success("Template copied to clipboard!")
                                          }}
                                        >
                                          <Copy className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </CardContent>
                          </Card>
                        ))
                          })()}
                      </div>
                    </div>}
                  </TabsContent>

                <TabsContent value="roadmap" className="mt-6">
                  <div className="space-y-8">
                    {/* Grade-by-Grade Timeline (from old timeline tab) */}
                    {assessment.grade_by_grade_roadmap && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] text-white rounded-xl p-4 sm:p-6">
                          <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Grade-by-Grade Timeline</h3>
                          <p className="text-white/70 text-sm">Your personalized year-by-year roadmap to college success</p>
                        </div>
                        {/* Render existing timeline content inline */}
                        {(() => {
                          const roadmap = assessment.grade_by_grade_roadmap
                          const allYears = [roadmap.currentGrade, ...(roadmap.nextYears || [])]
                          return (
                            <div className="space-y-4">
                              {allYears.map((year, idx) => (
                                <Card key={idx} className="border-[#e5e0d5]">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                                      <GraduationCap className="w-4 h-4 text-[#c9a227]" />
                                      {year.grade} {idx === 0 && <Badge className="bg-[#c9a227]/10 text-[#c9a227] text-[10px]">Current</Badge>}
                                    </CardTitle>
                                    {year.focus && <p className="text-sm text-[#5a7a9a]">{year.focus}</p>}
                                  </CardHeader>
                                  <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                                    {year.academics?.length > 0 && <div><p className="font-semibold text-[#1e3a5f] text-xs uppercase mb-1">Academics</p>{year.academics.map((a: string, i: number) => <p key={i} className="text-[#5a7a9a] text-[13px]">• {a}</p>)}</div>}
                                    {year.extracurriculars?.length > 0 && <div><p className="font-semibold text-[#1e3a5f] text-xs uppercase mb-1">Extracurriculars</p>{year.extracurriculars.map((a: string, i: number) => <p key={i} className="text-[#5a7a9a] text-[13px]">• {a}</p>)}</div>}
                                    {year.testing?.length > 0 && <div><p className="font-semibold text-[#1e3a5f] text-xs uppercase mb-1">Testing</p>{year.testing.map((a: string, i: number) => <p key={i} className="text-[#5a7a9a] text-[13px]">• {a}</p>)}</div>}
                                    {year.leadership?.length > 0 && <div><p className="font-semibold text-[#1e3a5f] text-xs uppercase mb-1">Leadership</p>{year.leadership.map((a: string, i: number) => <p key={i} className="text-[#5a7a9a] text-[13px]">• {a}</p>)}</div>}
                                    {year.summerPlan && <div className="sm:col-span-2"><p className="font-semibold text-[#1e3a5f] text-xs uppercase mb-1">Summer Plan</p><p className="text-[#5a7a9a] text-[13px]">{year.summerPlan}</p></div>}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* Action Items (immediate/short/medium/long term) */}
                    <div className="grid md:grid-cols-2 gap-5">
                      {[
                        { title: "Immediate Actions", subtitle: "Next 3 months", items: assessment.roadmap_data?.immediate, color: "#ef4444", accent: "bg-red-50" },
                        { title: "Short-term Goals", subtitle: "3-6 months", items: assessment.roadmap_data?.shortTerm, color: "#f59e0b", accent: "bg-amber-50" },
                        { title: "Medium-term", subtitle: "6-12 months", items: assessment.roadmap_data?.mediumTerm, color: "#3b82f6", accent: "bg-blue-50" },
                        { title: "Long-term", subtitle: "1+ years", items: assessment.roadmap_data?.longTerm, color: "#10b981", accent: "bg-emerald-50" }
                      ].map((phase, phaseIndex) => (
                        <motion.div
                          key={phase.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: phaseIndex * 0.1 }}
                        >
                          <Card className="border-[#e5e0d5] h-full">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                                  {phase.title}
                                </CardTitle>
                                <span className="text-[10px] text-[#5a7a9a] bg-[#f0ece3] px-2 py-0.5 rounded-full whitespace-nowrap">{phase.subtitle}</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Accordion type="multiple" className="space-y-1">
                                {phase.items?.map((item, index) => {
                                  const colonIdx = item.indexOf(':')
                                  let heading = item
                                  let detail = ''
                                  if (colonIdx > 0 && colonIdx < 80) {
                                    heading = item.slice(0, colonIdx).trim()
                                    detail = item.slice(colonIdx + 1).trim()
                                  }
                                  return (
                                    <AccordionItem key={index} value={`${phase.title}-${index}`} className={`${phase.accent} rounded-lg border-none px-3`}>
                                      <AccordionTrigger className="py-2 hover:no-underline">
                                        <div className="flex items-center gap-2 text-left">
                                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: phase.color }}>{index + 1}</span>
                                          <span className="text-[13px] font-medium text-[#1e3a5f] leading-snug">{heading}</span>
                                        </div>
                                      </AccordionTrigger>
                                      {detail && (
                                        <AccordionContent className="pb-2 pl-7">
                                          <p className="text-[13px] text-[#5a7a9a] leading-relaxed">{detail}</p>
                                        </AccordionContent>
                                      )}
                                    </AccordionItem>
                                  )
                                })}
                              </Accordion>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {assessment.waste_of_time_activities?.activities && assessment.waste_of_time_activities.activities.length > 0 && (
                      <Card className="border-red-200/60">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            Consider Dropping
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-3">
                            {assessment.waste_of_time_activities.activities.map((item, i) => (
                              <div key={i} className="p-3 bg-red-50/60 rounded-lg">
                                <p className="text-sm font-medium text-red-700 mb-1">{item.activity}</p>
                                <p className="text-[13px] text-[#5a7a9a] leading-relaxed">{item.whyQuit}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

            <TabsContent value="leadership" className="mt-6">
              {!assessment.leadership_recommendations && isPhase2Loading ? <Phase2Placeholder tabKey="leadership" /> : <div className="grid md:grid-cols-2 gap-6">
                <RecommendationCard
                  title="Club Leadership"
                  icon={Users}
                  items={assessment.leadership_recommendations?.clubLeadership}
                  color="#6366f1"
                />
                <RecommendationCard
                  title="School-Wide Roles"
                  icon={Building}
                  items={assessment.leadership_recommendations?.schoolWideRoles}
                  color="#ec4899"
                />
                <RecommendationCard
                  title="Community Leadership"
                  icon={Users}
                  items={assessment.leadership_recommendations?.communityLeadership}
                  color="#10b981"
                />
                <RecommendationCard
                  title="Leadership Development"
                  icon={TrendingUp}
                  items={assessment.leadership_recommendations?.leadershipDevelopment}
                  color="#f59e0b"
                />
                <Card className="border-[#e5e0d5] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <Flag className="w-5 h-5 text-[#8b5cf6]" />
                      Student Government
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">School Government</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.schoolGovernment?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">District/State Roles</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.districtStateRoles?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">Youth Government</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.youthGovernment?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">Advocacy Roles</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.advocacyRoles?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>}
            </TabsContent>

            <TabsContent value="essays" className="mt-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] text-white rounded-xl p-4 sm:p-6 mb-6">
                  <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Personal Essay Brainstorm
                  </h3>
                  <p className="text-white/70 text-sm">Five compelling essay concepts that weave your unique experiences into an Ivy League-worthy narrative.</p>
                </div>

                {assessment.report_data?.essayBrainstorm && Array.isArray(assessment.report_data.essayBrainstorm) ? (
                  assessment.report_data.essayBrainstorm.map((essay: { title: string; hook: string; narrative: string; connectingThreads: string[]; whyItWorks: string }, idx: number) => (
                    <Card key={idx} className="border-[#e5e0d5] shadow-sm overflow-hidden">
                      <div className="bg-[#1e3a5f] px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h4 className="text-white font-bold text-sm sm:text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {essay.title}
                        </h4>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-1">Opening Hook</p>
                          <p className="text-sm text-[#1e3a5f]/80 italic leading-relaxed">&ldquo;{essay.hook}&rdquo;</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-1">Narrative Arc</p>
                          <p className="text-sm text-[#1e3a5f]/70 leading-relaxed">{essay.narrative}</p>
                        </div>
                        {essay.connectingThreads && essay.connectingThreads.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-2">Connecting Threads</p>
                            <div className="flex flex-wrap gap-2">
                              {essay.connectingThreads.map((thread: string, tIdx: number) => (
                                <span key={tIdx} className="px-3 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-medium rounded-full border border-[#1e3a5f]/10">
                                  {thread}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-[#faf8f3] rounded-lg p-4 border border-[#e5e0d5]">
                          <p className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-1">Why This Works for Top Schools</p>
                          <p className="text-sm text-[#5a7a9a] leading-relaxed">{essay.whyItWorks}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-[#e5e0d5]">
                    <CardContent className="p-8 text-center">
                      <PenLine className="w-10 h-10 text-[#c9a227]/40 mx-auto mb-3" />
                      <p className="text-[#5a7a9a] text-sm">Essay brainstorm ideas will appear here once your report is generated.</p>
                      <p className="text-[#5a7a9a]/60 text-xs mt-1">Ask your counselor to regenerate the report to include essay ideas.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl p-8 md:p-12 text-center"
            style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Personalized Roadmap
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Download your full report to keep your roadmap handy and share with your counselor.
            </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="font-semibold border-2 border-white"
                  style={{ backgroundColor: 'white', color: primaryColor }}
                  onClick={handleDownloadPDF}
                  disabled={downloading || assessment?.status !== 'completed'}
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {assessment?.status !== 'completed' ? 'PDF available soon...' : downloading ? 'Generating PDF...' : 'Download Full Report'}
                </Button>
              </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 px-6 bg-[#0f1f30] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          &copy; 2024 The Student Blueprint. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
