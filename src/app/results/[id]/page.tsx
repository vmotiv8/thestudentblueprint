"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    Linkedin,
    Link2,
    XCircle,
    Mail,
    Copy
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

interface Assessment {
  id: string
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
      extracurriculars: string[]
      testing: string[]
      leadership: string[]
      summerPlan: string
    }
    nextYears: Array<{
      grade: string
      focus: string
      academics: string[]
      extracurriculars: string[]
      testing: string[]
      leadership: string[]
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
    skillsToDevelope: string[]
  }
  passion_projects: Array<{
    title: string
    description: string
    timeCommitment: string
    skillsDeveloped: string[]
    applicationImpact: string
    resources: string
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
        }>
      }
    waste_of_time_activities: {
      activities: Array<{ activity: string; whyQuit: string }>
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

  // Organization branding colors (with defaults)
  const primaryColor = tenant?.primary_color || "#1e3a5f"
  const secondaryColor = tenant?.secondary_color || "#c9a227"
  const orgName = tenant?.name || "Student Blueprint"
  const logoUrl = tenant?.logo_url

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessment and tenant info in parallel
        const [assessmentRes, tenantRes] = await Promise.all([
          fetch(`/api/assessment/${resolvedParams.id}`),
          fetch('/api/platform/organizations/me')
        ])

        const [assessmentData, tenantData] = await Promise.all([
          assessmentRes.json(),
          tenantRes.json()
        ])

        if (assessmentData.assessment) {
          setAssessment(assessmentData.assessment)

          const scores = assessmentData.assessment.archetype_scores
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
  }, [resolvedParams.id])

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
          title: `${assessment?.students?.full_name}'s Student Blueprint Results`,
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
  const archetype = assessment.student_archetype || "Strategic Thinker"

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
      if (!items || items.length === 0) return null
      
      return (
        <Card className="border-[#e5e0d5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color }} />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )
    }

  return (
    <div className="min-h-screen bg-[#faf8f3] overflow-x-hidden">
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
                style={{ backgroundColor: secondaryColor, color: primaryColor, boxShadow: `0 4px 14px ${secondaryColor}40` }}
                onClick={handleDownloadPDF}
                disabled={downloading}
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
                      Your personalized college roadmap is ready. Based on your profile, we've identified your unique strengths and created a customized action plan.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                      <div className="text-center">
                        <p className="text-white/60 text-xs sm:text-sm mb-1 uppercase tracking-wider">Comp. Score</p>
                        <div className="text-4xl sm:text-5xl font-bold" style={{ color: secondaryColor }}>{assessment.competitiveness_score ?? '--'}</div>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-1">out of 100</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <Card className="border-[#e5e0d5] h-full">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2" style={{ color: primaryColor }}>
                      <Target className="w-5 h-5" style={{ color: secondaryColor }} />
                      Archetype Analysis
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your profile across 8 key dimensions</CardDescription>
                  </CardHeader>
                    <CardContent className="p-2 sm:p-6 overflow-hidden">
                      <div className="h-[280px] sm:h-[350px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">

                        <RadarChart data={archetypeScores} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                          <PolarGrid stroke="#e5e0d5" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#5a7a9a", fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#5a7a9a", fontSize: 10 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#1e3a5f"
                            fill="#c9a227"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-[#e5e0d5] h-full">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl text-[#1e3a5f] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#c9a227]" />
                      Top Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                      {assessment.strengths_analysis?.competitiveAdvantages?.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[#5a7a9a] text-sm break-words leading-relaxed">{strength}</p>
                        </div>
                      ))}
                    <div className="pt-4 border-t border-[#e5e0d5]">
                      <p className="text-[10px] sm:text-xs text-[#5a7a9a] font-bold uppercase tracking-widest mb-3">Unique Differentiators</p>
                      {assessment.strengths_analysis?.uniqueDifferentiators?.map((diff, index) => (
                        <div key={index} className="flex items-start gap-2 mb-3">
                          <Award className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
                            <p className="text-[#5a7a9a] text-xs leading-relaxed break-words">{diff}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

                <Tabs defaultValue="timeline" className="mb-12 w-full">
                  <div className="max-w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabsList className="bg-white/40 backdrop-blur-2xl border border-white/20 p-1 sm:p-2 flex flex-nowrap sm:grid sm:grid-cols-6 h-auto gap-1 sm:gap-2 shadow-2xl shadow-[#1e3a5f]/5 rounded-xl sm:rounded-[2.5rem] min-w-max sm:min-w-full w-auto sm:w-full scrollbar-hide mb-2">
                      <TabsTrigger value="timeline" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-4 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0 min-w-[80px] sm:min-w-0">

                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Timeline</span>
                    </TabsTrigger>
                    <TabsTrigger value="college-match" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Colleges</span>
                    </TabsTrigger>
                    <TabsTrigger value="career-future" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Career</span>
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Action</span>
                    </TabsTrigger>
                    <TabsTrigger value="academics" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Academics</span>
                    </TabsTrigger>
                    <TabsTrigger value="testing" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Testing</span>
                    </TabsTrigger>
                    <TabsTrigger value="research" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Research</span>
                    </TabsTrigger>
                    <TabsTrigger value="leadership" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Leadership</span>
                    </TabsTrigger>
                    <TabsTrigger value="network" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Network</span>
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Activities</span>
                    </TabsTrigger>
                    <TabsTrigger value="gaps" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Gaps</span>
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-[#c9a227] px-3 sm:px-2 py-3 sm:py-5 rounded-lg sm:rounded-[2rem] transition-all duration-300 font-bold text-[#1e3a5f]/50 flex flex-col items-center gap-1 sm:gap-1.5 h-full shrink-0">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-tight">Projects</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="college-match" className="mt-6">
                  <div className="space-y-6">
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
                              <p className="text-sm text-[#5a7a9a] leading-relaxed">
                                <span className="font-bold text-[#1e3a5f]">Why?</span> {match.why}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="career-future" className="mt-6">
                  <div className="space-y-6">
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
                        <div className="p-6 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                          <p className="text-lg font-medium italic text-white leading-relaxed">
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
                          <div className="flex flex-wrap gap-2">
                            {assessment.career_recommendations?.jobTitles?.map((title, i) => (
                              <Badge key={i} variant="secondary" className="bg-[#f0ece3] text-[#1e3a5f] text-sm py-1 px-3">
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
                          <p className="text-sm text-[#5a7a9a] leading-relaxed bg-[#f0ece3] p-4 rounded-lg">
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
                              <CardTitle className="text-lg text-[#1e3a5f]">{industry.industry}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-[#5a7a9a] leading-relaxed">
                                {industry.why}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                  <TabsContent value="network" className="mt-6">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152a45] p-8 rounded-2xl text-white">
                        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Strategic Network Targets
                        </h3>
                        <p className="text-white/70">
                          Connecting with the right mentors and professors is a critical differentiator for Ivy League admissions. We've identified real professors, prioritizing those in your local area for realistic networking.
                        </p>
                      </div>
  
                      <div className="grid md:grid-cols-2 gap-6">
                        {assessment.mentor_recommendations?.mentors?.map((mentor, i) => (
                          <Card key={i} className="border-[#e5e0d5] hover:border-[#c9a227] transition-colors group">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-[#f0ece3] flex items-center justify-center group-hover:bg-[#c9a227]/10 transition-colors">
                                    <Users className="w-6 h-6 text-[#1e3a5f]" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-[#1e3a5f]">{mentor.name}</CardTitle>
                                    <CardDescription>{mentor.university}</CardDescription>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <Badge variant="outline" className="text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5">
                                  {mentor.department}
                                </Badge>
                                <div className="p-4 bg-[#f0ece3] rounded-lg">
                                  <p className="text-sm text-[#5a7a9a] leading-relaxed">
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
                                  <DialogContent className="max-w-2xl bg-white">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#1e3a5f]">Outreach Template for {mentor.name}</DialogTitle>
                                      <DialogDescription>
                                        Use this template as a starting point. Personalize the bracketed sections [ ] with your specific details.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4">
                                      <div className="p-6 bg-[#faf8f3] border border-[#e5e0d5] rounded-xl relative group">
                                        <pre className="text-sm text-[#5a7a9a] whitespace-pre-wrap font-sans leading-relaxed">
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
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                <div className="space-y-6">
                  {assessment.grade_by_grade_roadmap ? (
                    <>
                      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] text-white rounded-xl p-6 mb-8">
                        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Your Multi-Year Roadmap
                        </h3>
                        <p className="text-white/90">
                          A comprehensive plan from {assessment.grade_by_grade_roadmap.currentGrade.grade} through graduation. Each year builds on the last to maximize your college application strength.
                        </p>
                      </div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c9a227] via-[#1e3a5f] to-[#c9a227]" />
                          
                          {/* Current Grade */}
                          <div className="relative mb-8 ml-10 sm:ml-20">
                            <div className="absolute -left-[36px] sm:-left-[52px] top-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#c9a227] flex items-center justify-center border-4 border-[#faf8f3] shadow-lg">
                              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <Card className="border-2 border-[#c9a227] shadow-lg">
                              <CardHeader className="bg-gradient-to-r from-[#c9a227]/10 to-transparent p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <Badge className="bg-[#c9a227] text-white mb-2">Current Year</Badge>
                                    <CardTitle className="text-xl sm:text-2xl text-[#1e3a5f]">
                                      {assessment.grade_by_grade_roadmap.currentGrade.grade}
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base mt-1">
                                      {assessment.grade_by_grade_roadmap.currentGrade.focus}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 sm:p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2 text-sm sm:text-base">
                                      <BookOpen className="w-4 h-4 text-[#6366f1]" />
                                      Academic Goals
                                    </h4>
                                      <ul className="space-y-2">
                                        {(assessment.grade_by_grade_roadmap.currentGrade.academics || []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                      <h4 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2 text-sm sm:text-base">
                                        <Trophy className="w-4 h-4 text-[#c9a227]" />
                                        Extracurriculars
                                      </h4>
                                      <ul className="space-y-2">
                                        {(assessment.grade_by_grade_roadmap.currentGrade.extracurriculars || []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                  </div>
                                  <div>
                                      <h4 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2 text-sm sm:text-base">
                                        <Target className="w-4 h-4 text-[#3b82f6]" />
                                        Testing Milestones
                                      </h4>
                                      <ul className="space-y-2">
                                        {(assessment.grade_by_grade_roadmap.currentGrade.testing || []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2 text-sm sm:text-base">
                                        <Flag className="w-4 h-4 text-[#ef4444]" />
                                        Leadership Focus
                                      </h4>
                                      <ul className="space-y-2">
                                        {(assessment.grade_by_grade_roadmap.currentGrade.leadership || []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                  </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-[#e5e0d5]">
                                  <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-sm sm:text-base">
                                    <Sun className="w-4 h-4 text-[#f59e0b]" />
                                    Summer Plan
                                  </h4>
                                    <p className="text-sm text-[#5a7a9a] bg-[#f0ece3] p-4 rounded-lg break-words leading-relaxed">
                                      {assessment.grade_by_grade_roadmap.currentGrade.summerPlan}
                                    </p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
  
                          {/* Future Years */}
                          {(assessment.grade_by_grade_roadmap.nextYears || []).map((yearData, index) => (
                            <motion.div
                              key={yearData.grade}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index + 1) * 0.1 }}
                              className="relative mb-8 ml-10 sm:ml-20"
                            >
                              <div className="absolute -left-[36px] sm:-left-[52px] top-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center border-4 border-[#faf8f3] shadow-lg">
                                <span className="text-white text-xs sm:text-sm font-bold">{index + 2}</span>
                              </div>
                              <Card className="border-[#e5e0d5]">
                                <CardHeader className="p-4 sm:p-6">
                                  <CardTitle className="text-lg sm:text-xl text-[#1e3a5f]">{yearData.grade}</CardTitle>
                                  <CardDescription className="text-xs sm:text-sm">{yearData.focus}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                  <div className="grid md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                          <BookOpen className="w-4 h-4 text-[#6366f1]" />
                                          Academics
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {(yearData.academics || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-1.5 flex-shrink-0" />
                                                <span className="break-words">{item}</span>
                                              </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                          <Trophy className="w-4 h-4 text-[#c9a227]" />
                                          Activities
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {(yearData.extracurriculars || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                          <Target className="w-4 h-4 text-[#3b82f6]" />
                                          Testing
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {(yearData.testing || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                              <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                          <Flag className="w-4 h-4 text-[#ef4444]" />
                                          Leadership
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {(yearData.leadership || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#5a7a9a]">
                                              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mt-1.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-[#e5e0d5]">
                                    <h4 className="font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider">
                                      <Sun className="w-4 h-4 text-[#f59e0b]" />
                                      Summer Plan
                                    </h4>
                                      <p className="text-sm text-[#5a7a9a] bg-[#faf8f3] p-3 rounded-lg break-words leading-relaxed">
                                        {yearData.summerPlan}
                                      </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
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

                <TabsContent value="roadmap" className="mt-6">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { title: "Immediate Actions", subtitle: "Next 3 months", items: assessment.roadmap_data?.immediate, color: "#ef4444" },
                        { title: "Short-term Goals", subtitle: "3-6 months", items: assessment.roadmap_data?.shortTerm, color: "#f59e0b" },
                        { title: "Medium-term", subtitle: "6-12 months", items: assessment.roadmap_data?.mediumTerm, color: "#3b82f6" },
                        { title: "Long-term", subtitle: "1+ years", items: assessment.roadmap_data?.longTerm, color: "#10b981" }
                      ].map((phase, phaseIndex) => (
                        <motion.div
                          key={phase.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: phaseIndex * 0.1 }}
                        >
                          <Card className="border-[#e5e0d5] h-full">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                                <CardTitle className="text-lg text-[#1e3a5f]">{phase.title}</CardTitle>
                              </div>
                              <CardDescription className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {phase.subtitle}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-3">
                                {phase.items?.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {assessment.waste_of_time_activities?.activities && assessment.waste_of_time_activities.activities.length > 0 && (
                      <Card className="border-red-100 bg-red-50/30">
                        <CardHeader>
                          <CardTitle className="text-xl text-[#1e3a5f] flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-red-500" />
                            Waste of Time Activities (What to Quit)
                          </CardTitle>
                          <CardDescription>
                            Explicitly list activities you should stop because they don&apos;t align with your pattern/archetype.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            {assessment.waste_of_time_activities.activities.map((item, i) => (
                              <div key={i} className="p-4 bg-white border border-red-100 rounded-xl shadow-sm">
                                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Stop: {item.activity}
                                </h4>
                                <p className="text-sm text-[#5a7a9a] leading-relaxed italic">
                                  &quot;{item.whyQuit}&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

            <TabsContent value="academics" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <RecommendationCard
                  title="AP Courses"
                  icon={BookOpen}
                  items={assessment.academic_courses_recommendations?.apCourses}
                  color="#6366f1"
                />
                {assessment.academic_courses_recommendations?.ibCourses && assessment.academic_courses_recommendations.ibCourses.length > 0 ? (
                  <RecommendationCard
                    title="IB Courses"
                    icon={GraduationCap}
                    items={assessment.academic_courses_recommendations.ibCourses}
                    color="#8b5cf6"
                  />
                ) : (
                  <Card className="border-[#e5e0d5]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                        IB Courses
                      </CardTitle>
                    </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[#5a7a9a] italic break-words">No IB courses recommended based on your profile. Focus on AP and Honors courses instead.</p>
                      </CardContent>
                  </Card>
                )}
                <RecommendationCard
                  title="Honors Courses"
                  icon={Award}
                  items={assessment.academic_courses_recommendations?.honorsCourses}
                  color="#ec4899"
                />
                <RecommendationCard
                  title="Strategic Electives"
                  icon={Lightbulb}
                  items={assessment.academic_courses_recommendations?.electivesRecommended}
                  color="#f59e0b"
                />
              </div>
            </TabsContent>

            <TabsContent value="testing" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#3b82f6]" />
                      SAT Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-[#f0ece3] rounded-xl">
                      <p className="text-sm text-[#5a7a9a]">Target Composite</p>
                      <p className="text-3xl font-bold text-[#1e3a5f]">{assessment.sat_act_goals?.targetSATScore}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Reading</p>
                        <p className="font-semibold text-[#1e3a5f]">{assessment.sat_act_goals?.satSectionGoals?.reading}</p>
                      </div>
                      <div className="text-center p-3 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Writing</p>
                        <p className="font-semibold text-[#1e3a5f]">{assessment.sat_act_goals?.satSectionGoals?.writing}</p>
                      </div>
                      <div className="text-center p-3 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Math</p>
                        <p className="font-semibold text-[#1e3a5f]">{assessment.sat_act_goals?.satSectionGoals?.math}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#10b981]" />
                      ACT Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-[#f0ece3] rounded-xl">
                      <p className="text-sm text-[#5a7a9a]">Target Composite</p>
                      <p className="text-3xl font-bold text-[#1e3a5f]">{assessment.sat_act_goals?.targetACTScore}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">English</p>
                        <p className="font-semibold text-[#1e3a5f] text-sm">{assessment.sat_act_goals?.actSectionGoals?.english}</p>
                      </div>
                      <div className="text-center p-2 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Math</p>
                        <p className="font-semibold text-[#1e3a5f] text-sm">{assessment.sat_act_goals?.actSectionGoals?.math}</p>
                      </div>
                      <div className="text-center p-2 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Reading</p>
                        <p className="font-semibold text-[#1e3a5f] text-sm">{assessment.sat_act_goals?.actSectionGoals?.reading}</p>
                      </div>
                      <div className="text-center p-2 bg-[#faf8f3] rounded-lg">
                        <p className="text-xs text-[#5a7a9a]">Science</p>
                        <p className="font-semibold text-[#1e3a5f] text-sm">{assessment.sat_act_goals?.actSectionGoals?.science}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-[#e5e0d5] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f]">Prep Strategy & Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#1e3a5f] mb-1">Preparation Strategy</p>
                        <p className="text-sm text-[#5a7a9a] break-words">{assessment.sat_act_goals?.prepStrategy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1e3a5f] mb-1">Recommended Timeline</p>
                        <p className="text-sm text-[#5a7a9a] break-words">{assessment.sat_act_goals?.timeline}</p>
                      </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" style={{ color: "#06b6d4" }} />
                      Research Topics
                    </CardTitle>
                    <CardDescription>Suggested research areas aligned with your interests and career goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ul className="space-y-3">
                        {assessment.research_publications_recommendations?.researchTopics?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#06b6d4" }} />
                            <div className="space-y-1">
                              <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                              {index === 0 && (
                                <p className="text-xs text-[#5a7a9a]/70 italic break-words">Consider starting with independent research or reaching out to professors in this field</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                  </CardContent>
                </Card>
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                      Publication Opportunities
                    </CardTitle>
                    <CardDescription>Where to submit your research findings for maximum impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ul className="space-y-2">
                        {assessment.research_publications_recommendations?.publicationOpportunities?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#8b5cf6" }} />
                            <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                  </CardContent>
                </Card>
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color: "#f59e0b" }} />
                      Finding Mentors
                    </CardTitle>
                    <CardDescription>Strategies for connecting with research mentors and advisors</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ul className="space-y-2">
                        {assessment.research_publications_recommendations?.mentorshipSuggestions?.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                            <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                  </CardContent>
                </Card>
                <Card className="border-[#e5e0d5]">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#10b981]" />
                        Research Timeline
                      </CardTitle>
                      <CardDescription>Recommended progression for research activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                          <div className="space-y-2">
                            {(assessment.research_publications_recommendations?.timeline?.split('. ') || []).filter((item: string) => item.trim()).map((item: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
                              <p className="text-sm text-[#5a7a9a] leading-relaxed break-words">{item.trim()}{item.endsWith('.') ? '' : '.'}</p>
                            </div>
                          ))}
                        </div>
                    </CardContent>
                  </Card>
              </div>
            </TabsContent>

            <TabsContent value="leadership" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                              <span className="text-[#8b5cf6]">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">District/State Roles</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.districtStateRoles?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">Youth Government</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.youthGovernment?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#5a7a9a] mb-2">Advocacy Roles</p>
                        <ul className="space-y-1">
                          {assessment.student_government_recommendations?.advocacyRoles?.map((item, i) => (
                            <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-1">
                              <span className="text-[#8b5cf6]">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#f59e0b]" />
                    Summer Ivy Programs
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Service & Community
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Culture & Arts
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Missing Elements
                    </CardTitle>
                    <CardDescription>Areas to develop for target schools</CardDescription>
                  </CardHeader>
                  <CardContent>
                          <ul className="space-y-3">
                            {assessment.gap_analysis?.missingElements?.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Activities to Deepen
                    </CardTitle>
                    <CardDescription>Existing activities needing more depth</CardDescription>
                  </CardHeader>
                  <CardContent>
                          <ul className="space-y-3">
                            {assessment.gap_analysis?.activitiesToDeepen?.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Skills to Develop
                    </CardTitle>
                    <CardDescription>Skills needed for career goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                          <ul className="space-y-3">
                            {assessment.gap_analysis?.skillsToDevelope?.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                <span className="text-sm text-[#5a7a9a] break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

                <TabsContent value="projects" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

                  {assessment.passion_projects?.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-[#e5e0d5] h-full hover:shadow-2xl transition-all duration-500 flex flex-col rounded-3xl overflow-hidden bg-white group">
                        <CardHeader className="pb-4 pt-8 px-8 relative">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <CardTitle className="text-2xl md:text-3xl text-[#1e3a5f] font-bold leading-tight group-hover:text-[#c9a227] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {project.title}
                            </CardTitle>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-6">
                            <Badge className="bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-normal h-auto text-left leading-relaxed">
                              {project.timeCommitment}
                            </Badge>
                          </div>
                          <CardDescription className="text-[#5a7a9a] text-base leading-relaxed italic">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-8 flex-1 pt-4 px-8 pb-10">
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
                              {(project as any).implementationSteps ? (
                                (project as any).implementationSteps.map((step: string, i: number) => (
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
              </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Connect with our expert tutors and counselors to put your personalized roadmap into action.
            </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="https://thestudentblueprint.com/schedule" target="_blank">
                  <Button size="lg" className="bg-[#c9a227] hover:bg-[#b8921f] text-[#1e3a5f] font-semibold">
                    Schedule Consultation
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  className="bg-white text-[#1e3a5f] hover:bg-gray-100 font-semibold border-2 border-white"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {downloading ? 'Generating PDF...' : 'Download Full Report'}
                </Button>
              </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 px-6 bg-[#0f1f30] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          © 2024 Student Blueprint. All rights reserved.
        </div>
      </footer>
    </div>
  )
}