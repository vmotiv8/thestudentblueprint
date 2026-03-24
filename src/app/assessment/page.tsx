"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  GraduationCap,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
  Mail,
  AlertCircle,
  Info,
  MapPin,
  Search
} from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { toast } from "sonner"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import {
    SECTION_TITLES,
    GRADE_OPTIONS,
    SUBJECT_OPTIONS,
      ARCHETYPE_OPTIONS,
      CAREER_STATEMENT_OPTIONS,
      PACE_OPTIONS,
      COUNTRY_OPTIONS,
      US_STATES,
      AP_COURSE_OPTIONS,
      COURSE_CATEGORIES,
      REGULAR_COURSE_CATEGORIES,
      CURRICULUM_OPTIONS,
      GPA_SCALE_OPTIONS,
      PHONE_COUNTRY_CODES,
      initialFormData,
      type Activity,
      type LeadershipEntry,
      type CompetitionEntry,
      type ResearchEntry,
      type SummerProgramEntry,
      type LegacyEntry
    } from "@/lib/assessment-types"


function AssessmentContent() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentSection, setCurrentSection] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [uniqueCode, setUniqueCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaid, setIsPaid] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isNewAssessment, setIsNewAssessment] = useState(true)
  const [showTestBreakdown, setShowTestBreakdown] = useState(false)
  const [currentTestType, setCurrentTestType] = useState<"sat" | "act" | "psat" | null>(null)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [tenant, setTenant] = useState<any>(null)

  const progress = (currentSection / 15) * 100

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const orgSlug = urlParams.get('org')
        const apiUrl = orgSlug
          ? `/api/platform/organizations/me?org=${encodeURIComponent(orgSlug)}`
          : '/api/platform/organizations/me'
        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          setTenant(data)
        }
      } catch (error) {
        console.error('Error fetching tenant:', error)
      }
    }
    fetchTenant()
  }, [])

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const completedSections = useMemo(() => {
    const completed = new Set<number>()
    if (formData.basicInfo.fullName && formData.basicInfo.email) completed.add(1)
    if (formData.academicProfile.gpaUnweighted || formData.academicProfile.coursesTaken) completed.add(2)
    if (formData.testingInfo.satScore || formData.testingInfo.actScore || formData.testingInfo.psatScore || formData.testingInfo.notTakenYet) completed.add(3)
    if (formData.extracurriculars.activities?.some(a => a.name)) completed.add(4)
    if (formData.leadership.entries?.some(e => e.position) || formData.leadership.noLeadershipExperience) completed.add(5)
    if (formData.competitions.entries?.some(e => e.competition) || formData.competitions.noCompetitions) completed.add(6)
    if (formData.passions.topicsYouLove || formData.passions.hobbiesSkills) completed.add(7)
    if (formData.careerAspirations.career1 || formData.careerAspirations.career2 || formData.careerAspirations.dreamJobTitle) completed.add(8)
    if (formData.researchExperience.entries?.some(e => e.organization) || formData.researchExperience.noResearchExperience) completed.add(9)
    if (formData.summerPrograms.entries?.some(e => e.name)) completed.add(10)
    if (formData.specialTalents.musicInstruments || formData.specialTalents.athletics) completed.add(11)
    if (formData.familyContext.familyProfessions) completed.add(12)
    if (formData.personality.topStrengths || formData.personality.archetypes?.length > 0) completed.add(13)
    if (formData.personalStories.lifeChallenge || formData.personalStories.proudMoment) completed.add(14)
    if (formData.timeCommitment.hoursSchoolYear || formData.timeCommitment.preferredPace) completed.add(15)
    return completed
  }, [formData])

  const filteredCourseCategories = useMemo(() => {
    const curriculum = formData.academicProfile.curriculum || formData.basicInfo.curriculum

    const getCurriculumTags = (curr: string): string[] => {
      if (!curr || curr === "Other") return []
      if (curr.includes("IB")) return ["IB"]
      if (curr.includes("AP") || curr === "US High School Diploma") return ["AP", "US", "Honors"]
      if (curr.includes("A-Levels")) return ["A-Level"]
      if (curr.includes("IGCSE")) return ["IGCSE"]
      if (curr === "CBSE") return ["CBSE"]
      if (curr.includes("ICSE")) return ["ICSE"]
      if (curr === "NIOS") return ["NIOS"]
      if (curr.includes("French")) return ["French_Bac"]
      if (curr.includes("German")) return ["German_Abitur"]
      if (curr.includes("European")) return ["European_Bac"]
      if (curr.includes("Scottish")) return ["Scottish"]
      if (curr.includes("Swiss") || curr.includes("Italian") || curr.includes("Maturit")) return ["Swiss_Matura", "Italian_Matura"]
      if (curr.includes("OSSD")) return ["OSSD"]
      if (curr.includes("BC Curriculum")) return ["BC"]
      if (curr.includes("Australian")) return ["Australian"]
      if (curr.includes("NCEA")) return ["NCEA"]
      if (curr.includes("BTEC")) return ["BTEC"]
      if (curr.includes("Gaokao")) return ["Gaokao"]
      return []
    }

    const activeTags = getCurriculumTags(curriculum || "")
    const showAll = activeTags.length === 0

    return COURSE_CATEGORIES.map(category => ({
      ...category,
      courses: category.courses
        .filter(course => showAll || course.tags.some(tag => activeTags.includes(tag)) || course.tags.includes("Universal"))
        .map(course => course.name)
    })).filter(cat => cat.courses.length > 0)
  }, [formData.academicProfile.curriculum, formData.basicInfo.curriculum])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        handleNext()
      }
      if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault()
        handleNext()
      }
      if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault()
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSection, formData])

  useEffect(() => {
    const loadAssessment = async () => {
      setIsLoading(true)

      // Check if this org offers free assessments — skip payment verification if so
      const urlParams = new URLSearchParams(window.location.search)
      const orgSlug = urlParams.get('org')
      if (orgSlug || tenant?.free_assessments) {
        try {
          const orgParam = orgSlug ? `?org=${encodeURIComponent(orgSlug)}` : ''
          const tenantRes = await fetch(`/api/platform/organizations/me${orgParam}`)
          if (tenantRes.ok) {
            const tenantData = await tenantRes.json()
            if (tenantData.free_assessments) {
              setIsPaid(true)
              setIsLoading(false)
              return
            }
          }
        } catch (e) {
          console.error('Error checking org free_assessments:', e)
        }
      }

      const resumeId = searchParams.get("resume")
      const sessionId = searchParams.get("session_id")
      const resumeCode = searchParams.get("code")
      const couponUsed = localStorage.getItem("studentblueprint_coupon")

      let verified = false

      if (sessionId) {
        const response = await fetch(`/api/payment/verify?session_id=${sessionId}`)
        const data = await response.json()
        if (data.paid) {
          setIsPaid(true)
          verified = true
          localStorage.setItem("studentblueprint_paid_email", data.email || "")
        }
      }
      
      if (couponUsed) {
        setIsPaid(true)
        verified = true
      }
      
      if (resumeCode) {
        try {
          const response = await fetch("/api/assessment/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: resumeCode })
          })
          const data = await response.json()
          if (data.success && data.assessment) {
            setIsPaid(true)
            verified = true
            setUniqueCode(data.student.uniqueCode)
            loadAssessmentData(data.assessment)
            setIsLoading(false)
            return
          }
        } catch (e) {
          console.error("Error loading by code:", e)
        }
      }
      
      const savedEmail = localStorage.getItem("studentblueprint_paid_email")
      if (savedEmail) {
        try {
          const response = await fetch("/api/assessment/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: savedEmail })
          })
          const data = await response.json()
          if (data.success && data.assessment) {
            setIsPaid(true)
            verified = true
            loadAssessmentData(data.assessment)
          } else if (!verified) {
            const verifyResponse = await fetch(`/api/payment/verify?email=${encodeURIComponent(savedEmail)}`)
            const verifyData = await verifyResponse.json()
            if (verifyData.paid) {
              setIsPaid(true)
              verified = true
            }
          }
        } catch (e) {
          console.error("Error checking payment status:", e)
        }
      }
      
      if (resumeId) {
        const resumeData = sessionStorage.getItem("resumeAssessment")
        if (resumeData) {
          try {
            const data = JSON.parse(resumeData)
            if (data.assessment) {
              setIsPaid(true)
              verified = true
              loadAssessmentData(data.assessment)
            }
            sessionStorage.removeItem("resumeAssessment")
          } catch (e) {
            console.error("Error loading resume data:", e)
          }
        }
      }
      
      if (!verified) {
        const orgParam = orgSlug ? `?org=${encodeURIComponent(orgSlug)}` : ''
        router.replace(`/checkout${orgParam}`)
        return
      }
      
      setIsLoading(false)
    }
    
    loadAssessment()
  }, [searchParams, router])
  
  const loadAssessmentData = (assessment: Record<string, unknown>) => {
    setAssessmentId(assessment.id as string)
    setCurrentSection((assessment.current_section as number) || 1)
    setIsNewAssessment(false)
    
    const mergeWithDefaults = <T extends object>(data: unknown, defaults: T): T => {
      if (!data || typeof data !== 'object') return defaults
      return { ...defaults, ...(data as Partial<T>) }
    }
    
    const academicProfileData = mergeWithDefaults(assessment.academic_profile, initialFormData.academicProfile)
    
    // Handle migration from string to array for courses
    const coursesTaken = Array.isArray(academicProfileData.coursesTaken) 
      ? academicProfileData.coursesTaken 
      : (typeof academicProfileData.coursesTaken === 'string' && academicProfileData.coursesTaken 
          ? (academicProfileData.coursesTaken as string).split(',').map(s => s.trim()).filter(Boolean)
          : [])
          
    const coursesPlanned = Array.isArray(academicProfileData.coursesPlanned) 
      ? academicProfileData.coursesPlanned 
      : (typeof academicProfileData.coursesPlanned === 'string' && academicProfileData.coursesPlanned 
          ? (academicProfileData.coursesPlanned as string).split(',').map(s => s.trim()).filter(Boolean)
          : [])

    const leadershipData = mergeWithDefaults(assessment.leadership, initialFormData.leadership)
    const leadershipEntries = Array.isArray(leadershipData.entries) && leadershipData.entries.length > 0
      ? leadershipData.entries
      : (leadershipData.positions || leadershipData.organizations 
          ? [{ position: leadershipData.positions || "", organization: leadershipData.organizations || "", awards: leadershipData.awards || "", scale: leadershipData.scale || "" }]
          : [{ position: "", organization: "", awards: "", scale: "" }])

    const competitionsData = mergeWithDefaults(assessment.competitions, initialFormData.competitions)
    const competitionEntries = Array.isArray(competitionsData.entries) && competitionsData.entries.length > 0
      ? competitionsData.entries
      : (competitionsData.competitions || competitionsData.recognitions
          ? [{ competition: competitionsData.competitions || "", recognition: competitionsData.recognitions || "" }]
          : [{ competition: "", recognition: "" }])

    const researchData = mergeWithDefaults(assessment.research_experience, initialFormData.researchExperience)
    const researchEntries = Array.isArray(researchData.entries) && researchData.entries.length > 0
      ? researchData.entries
      : (researchData.researchExperience || researchData.shadowingExperience || researchData.internships
          ? [
              ...(researchData.researchExperience ? [{ type: "Research" as const, organization: "", role: "", description: researchData.researchExperience as string, duration: "" }] : []),
              ...(researchData.shadowingExperience ? [{ type: "Shadowing" as const, organization: "", role: "", description: researchData.shadowingExperience as string, duration: "" }] : []),
              ...(researchData.internships ? [{ type: "Internship" as const, organization: "", role: "", description: researchData.internships as string, duration: "" }] : [])
            ]
          : [{ type: "Research" as const, organization: "", role: "", description: "", duration: "" }])

    const summerProgramsData = mergeWithDefaults(assessment.summer_programs, initialFormData.summerPrograms)
    const summerProgramEntries = Array.isArray(summerProgramsData.entries) && summerProgramsData.entries.length > 0
      ? summerProgramsData.entries
      : (summerProgramsData.programs
          ? [{ name: "", organization: "", description: summerProgramsData.programs as string, year: "" }]
          : [{ name: "", organization: "", description: "", year: "" }])

    const basicInfoData = mergeWithDefaults(assessment.basic_info, initialFormData.basicInfo)
    const dreamSchools = Array.isArray(basicInfoData.dreamSchools)
      ? basicInfoData.dreamSchools
      : (typeof basicInfoData.dreamSchools === 'string' && basicInfoData.dreamSchools
          ? (basicInfoData.dreamSchools as string).split(',').map(s => s.trim()).filter(Boolean)
          : ["", "", ""])

    setFormData({
      basicInfo: {
        ...basicInfoData,
        dreamSchools: dreamSchools.length > 0 ? dreamSchools : ["", "", ""],
        parentPhone: basicInfoData.parentPhone || ""
      } as typeof initialFormData.basicInfo,
      academicProfile: {
        ...academicProfileData,
        coursesTaken,
        coursesPlanned,
        regularCoursesTaken: Array.isArray(academicProfileData.regularCoursesTaken) ? academicProfileData.regularCoursesTaken : [],
        regularCoursesPlanned: Array.isArray(academicProfileData.regularCoursesPlanned) ? academicProfileData.regularCoursesPlanned : [],
        gpaScale: academicProfileData.gpaScale || "",
        curriculum: academicProfileData.curriculum || ""
      } as typeof initialFormData.academicProfile,
      testingInfo: mergeWithDefaults(assessment.testing_info, initialFormData.testingInfo),
      extracurriculars: {
        activities: Array.isArray((assessment.extracurriculars as Record<string, unknown>)?.activities)
          ? (assessment.extracurriculars as typeof initialFormData.extracurriculars).activities
          : initialFormData.extracurriculars.activities
      },
      leadership: {
        ...leadershipData,
        entries: leadershipEntries
      } as typeof initialFormData.leadership,
      competitions: {
        ...competitionsData,
        entries: competitionEntries
      } as typeof initialFormData.competitions,
      passions: mergeWithDefaults(assessment.passions, initialFormData.passions),
      careerAspirations: mergeWithDefaults(assessment.career_aspirations, initialFormData.careerAspirations),
      researchExperience: {
        ...researchData,
        entries: researchEntries
      } as typeof initialFormData.researchExperience,
      summerPrograms: {
        ...summerProgramsData,
        entries: summerProgramEntries
      } as typeof initialFormData.summerPrograms,
      specialTalents: mergeWithDefaults(assessment.special_talents, initialFormData.specialTalents),
      familyContext: mergeWithDefaults(assessment.family_context, initialFormData.familyContext),
      personality: mergeWithDefaults(assessment.personality, initialFormData.personality),
      personalStories: mergeWithDefaults(assessment.personal_stories, initialFormData.personalStories),
      timeCommitment: mergeWithDefaults(assessment.time_commitment, initialFormData.timeCommitment)
    })
  }

  const autoSave = useCallback(async () => {
    if (!formData.basicInfo.fullName || !formData.basicInfo.email) return
    
    setIsSaving(true)
    const couponCode = localStorage.getItem("studentblueprint_coupon")
    try {
      const response = await fetch("/api/assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          currentSection,
          formData,
          couponCode,
          organization_slug: tenant?.slug
        })
      })
      
      if (!response.ok) {
        console.error("Auto-save failed:", response.status)
        toast.error("Auto-save failed. Your progress may not be saved.", { id: "auto-save-error" })
        return
      }
      const data = await response.json()
      if (data.assessmentId) {
        setAssessmentId(data.assessmentId)
        setUniqueCode(data.uniqueCode)
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
      toast.error("Auto-save failed. Check your connection.", { id: "auto-save-error" })
    } finally {
      setIsSaving(false)
    }
  }, [assessmentId, currentSection, formData])

  useEffect(() => {
    const timer = setTimeout(autoSave, 30000)
    return () => clearTimeout(timer)
  }, [formData, autoSave])

  const validateSection = (section: number): boolean => {
    const errors: Record<string, string> = {}
    
    if (section === 1) {
      if (!formData.basicInfo.fullName?.trim()) {
        errors.fullName = "Name is required"
      }
      if (!formData.basicInfo.email?.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.basicInfo.email)) {
        errors.email = "Please enter a valid email address"
      }
      if (!formData.basicInfo.parentName?.trim()) {
        errors.parentName = "Parent name is required"
      }
      if (!formData.basicInfo.parentEmail?.trim()) {
        errors.parentEmail = "Parent email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.basicInfo.parentEmail)) {
        errors.parentEmail = "Please enter a valid email address"
      }
      if (!formData.basicInfo.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required"
      }
      if (!formData.basicInfo.currentGrade) {
        errors.currentGrade = "Grade level is required"
      }
      if (!formData.basicInfo.schoolName?.trim()) {
        errors.schoolName = "School name is required"
      }
      if (!formData.basicInfo.address?.trim()) {
        errors.address = "Address is required"
      }
      if (!formData.basicInfo.city?.trim()) {
        errors.city = "City is required"
      }
      if (!formData.basicInfo.state?.trim()) {
        errors.state = "State is required"
      }
      if (!formData.basicInfo.country) {
        errors.country = "Country is required"
      }
        if (!formData.basicInfo.targetCollegeYear) {
          errors.targetCollegeYear = "Target entry year is required"
        }
        if (!formData.basicInfo.curriculum) {
          errors.curriculum = "Curriculum is required"
        }
      }

    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProgress = async () => {
    if (!formData.basicInfo.fullName || !formData.basicInfo.email) {
      toast.error("Please fill in your name and email to save progress")
      return
    }
    
    if (!validateSection(1)) {
      toast.error("Please fix the errors before saving")
      return
    }
    
    setIsSaving(true)
    const couponCode = localStorage.getItem("studentblueprint_coupon")
    try {
      const response = await fetch("/api/assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          currentSection,
          formData,
          couponCode,
          organization_slug: tenant?.slug
        })
      })
      
      const data = await response.json()
      if (data.assessmentId) {
        setAssessmentId(data.assessmentId)
        setUniqueCode(data.uniqueCode)
        setShowSaveModal(true)
        
        if (isNewAssessment) {
          toast.success(
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Resume code sent to {formData.basicInfo.email}</span>
            </div>,
            { duration: 5000 }
          )
          setIsNewAssessment(false)
        }
      }
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save progress")
    } finally {
      setIsSaving(false)
    }
  }

  const copyCode = async () => {
    if (uniqueCode) {
      await navigator.clipboard.writeText(uniqueCode)
      setCodeCopied(true)
      toast.success("Code copied to clipboard!")
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleNext = async () => {
    if (currentSection === 1) {
      if (!validateSection(1)) {
        toast.error("Please fill in required fields")
        return
      }
    }
    
    await autoSave()
    
    if (currentSection < 15) {
      setCurrentSection(currentSection + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

    const handleSubmit = async () => {
      setIsSubmitting(true)
      setShowLoadingScreen(true)
      try {
        await autoSave()
        
        const response = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            formData,
            organization_slug: tenant?.slug
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          router.push(`/results/${data.assessmentId}`)
        } else {
          toast.error(data.error || "Failed to submit assessment")
          setShowLoadingScreen(false)
        }
      } catch (error) {
        toast.error("Failed to submit assessment")
        setShowLoadingScreen(false)
      } finally {
        setIsSubmitting(false)
      }
    }

  const updateFormData = (section: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as unknown as Record<string, Record<string, unknown>>)[section],
        [field]: value
      }
    }))
  }

  const toggleArrayItem = (section: string, field: string, item: string) => {
    const sectionData = (formData as unknown as Record<string, Record<string, unknown>>)[section]
    const currentArray = (sectionData[field] as string[]) || []
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updateFormData(section, field, newArray)
  }

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: {
        activities: [...prev.extracurriculars.activities, { name: "", role: "", yearsInvolved: "", hoursPerWeek: "", achievements: "" }]
      }
    }))
  }

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: {
        activities: prev.extracurriculars.activities.filter((_, i) => i !== index)
      }
    }))
  }

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: {
        activities: prev.extracurriculars.activities.map((activity, i) => 
          i === index ? { ...activity, [field]: value } : activity
        )
      }
    }))
  }

  const addLeadershipEntry = () => {
    setFormData(prev => ({
      ...prev,
      leadership: {
        ...prev.leadership,
        entries: [...(prev.leadership.entries || []), { position: "", organization: "", awards: "", scale: "" }]
      }
    }))
  }

  const removeLeadershipEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      leadership: {
        ...prev.leadership,
        entries: (prev.leadership.entries || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updateLeadershipEntry = (index: number, field: keyof LeadershipEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      leadership: {
        ...prev.leadership,
        entries: (prev.leadership.entries || []).map((entry, i) => 
          i === index ? { ...entry, [field]: value } : entry
        )
      }
    }))
  }

  const addCompetitionEntry = () => {
    setFormData(prev => ({
      ...prev,
      competitions: {
        ...prev.competitions,
        entries: [...(prev.competitions.entries || []), { competition: "", recognition: "" }]
      }
    }))
  }

  const removeCompetitionEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitions: {
        ...prev.competitions,
        entries: (prev.competitions.entries || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updateCompetitionEntry = (index: number, field: keyof CompetitionEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      competitions: {
        ...prev.competitions,
        entries: (prev.competitions.entries || []).map((entry, i) => 
          i === index ? { ...entry, [field]: value } : entry
        )
      }
    }))
  }

  const addResearchEntry = () => {
    setFormData(prev => ({
      ...prev,
      researchExperience: {
        ...prev.researchExperience,
        entries: [...(prev.researchExperience.entries || []), { type: "Research", organization: "", role: "", description: "", duration: "" }]
      }
    }))
  }

  const removeResearchEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      researchExperience: {
        ...prev.researchExperience,
        entries: (prev.researchExperience.entries || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updateResearchEntry = (index: number, field: keyof ResearchEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      researchExperience: {
        ...prev.researchExperience,
        entries: (prev.researchExperience.entries || []).map((entry, i) => 
          i === index ? { ...entry, [field]: value } : entry
        )
      }
    }))
  }

  const addSummerProgramEntry = () => {
    setFormData(prev => ({
      ...prev,
      summerPrograms: {
        ...prev.summerPrograms,
        entries: [...(prev.summerPrograms.entries || []), { name: "", organization: "", description: "", year: "" }]
      }
    }))
  }

  const removeSummerProgramEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      summerPrograms: {
        ...prev.summerPrograms,
        entries: (prev.summerPrograms.entries || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updateSummerProgramEntry = (index: number, field: keyof SummerProgramEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      summerPrograms: {
        ...prev.summerPrograms,
        entries: (prev.summerPrograms.entries || []).map((entry, i) => 
          i === index ? { ...entry, [field]: value } : entry
        )
      }
    }))
  }

  const addLegacyEntry = () => {
    const current = formData.familyContext.legacyEntries || []
    if (current.length < 5) {
      setFormData(prev => ({
        ...prev,
        familyContext: {
          ...prev.familyContext,
          legacyEntries: [...current, { college: "", relation: "" }]
        }
      }))
    }
  }

  const removeLegacyEntry = (index: number) => {
    const current = formData.familyContext.legacyEntries || []
    setFormData(prev => ({
      ...prev,
      familyContext: {
        ...prev.familyContext,
        legacyEntries: current.filter((_, i) => i !== index)
      }
    }))
  }

  const updateLegacyEntry = (index: number, field: keyof LegacyEntry, value: string) => {
    const current = formData.familyContext.legacyEntries || []
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      familyContext: {
        ...prev.familyContext,
        legacyEntries: updated
      }
    }))
  }

  const addDreamSchool = () => {
    updateFormData("basicInfo", "dreamSchools", [...(formData.basicInfo.dreamSchools as string[] || []), ""])
  }

  const removeDreamSchool = (index: number) => {
    const schools = [...(formData.basicInfo.dreamSchools as string[] || [])]
    schools.splice(index, 1)
    updateFormData("basicInfo", "dreamSchools", schools)
  }

  const updateDreamSchool = (index: number, value: string) => {
    const schools = [...(formData.basicInfo.dreamSchools as string[] || [])]
    schools[index] = value
    updateFormData("basicInfo", "dreamSchools", schools)
  }

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-1">
                  Student Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.basicInfo.fullName}
                  onChange={(e) => {
                    updateFormData("basicInfo", "fullName", e.target.value)
                    if (validationErrors.fullName) {
                      setValidationErrors(prev => ({ ...prev, fullName: "" }))
                    }
                  }}
                  placeholder="Enter your full name"
                  className={validationErrors.fullName ? "border-red-500" : ""}
                />
                {validationErrors.fullName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.fullName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Student Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.basicInfo.email}
                  onChange={(e) => {
                    updateFormData("basicInfo", "email", e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: "" }))
                    }
                  }}
                  placeholder="your.email@example.com"
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="parentName" className="flex items-center gap-1">
                  Parent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentName"
                  value={formData.basicInfo.parentName}
                  onChange={(e) => {
                    updateFormData("basicInfo", "parentName", e.target.value)
                    if (validationErrors.parentName) {
                      setValidationErrors(prev => ({ ...prev, parentName: "" }))
                    }
                  }}
                  placeholder="Enter parent's name"
                  className={validationErrors.parentName ? "border-red-500" : ""}
                />
                {validationErrors.parentName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.parentName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="flex items-center gap-1">
                  Parent Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.basicInfo.parentEmail}
                  onChange={(e) => {
                    updateFormData("basicInfo", "parentEmail", e.target.value)
                    if (validationErrors.parentEmail) {
                      setValidationErrors(prev => ({ ...prev, parentEmail: "" }))
                    }
                  }}
                  placeholder="parent.email@example.com"
                  className={validationErrors.parentEmail ? "border-red-500" : ""}
                />
                {validationErrors.parentEmail && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.parentEmail}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.basicInfo.parentPhone?.split(' ')[0] || "+1"}
                  onValueChange={(code) => {
                    const currentNumber = formData.basicInfo.parentPhone?.split(' ').slice(1).join(' ') || ''
                    updateFormData("basicInfo", "parentPhone", `${code} ${currentNumber}`)
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_COUNTRY_CODES.map((item) => (
                      <SelectItem key={`${item.country}-${item.code}`} value={item.code}>
                        {item.flag} {item.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.basicInfo.parentPhone?.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => {
                    const code = formData.basicInfo.parentPhone?.split(' ')[0] || "+1"
                    updateFormData("basicInfo", "parentPhone", `${code} ${e.target.value}`)
                  }}
                  className="flex-1"
                />
              </div>
            </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.basicInfo.dateOfBirth}
                  onChange={(e) => {
                    updateFormData("basicInfo", "dateOfBirth", e.target.value)
                    if (validationErrors.dateOfBirth) {
                      setValidationErrors(prev => ({ ...prev, dateOfBirth: "" }))
                    }
                  }}
                  className={validationErrors.dateOfBirth ? "border-red-500" : ""}
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Current Grade Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.basicInfo.currentGrade}
                  onValueChange={(value) => {
                    updateFormData("basicInfo", "currentGrade", value)
                    if (validationErrors.currentGrade) {
                      setValidationErrors(prev => ({ ...prev, currentGrade: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={validationErrors.currentGrade ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.currentGrade && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.currentGrade}
                  </p>
                )}
              </div>
            </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="schoolName" className="flex items-center gap-1">
                  Current School Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="schoolName"
                  value={formData.basicInfo.schoolName}
                  onChange={(e) => {
                    updateFormData("basicInfo", "schoolName", e.target.value)
                    if (validationErrors.schoolName) {
                      setValidationErrors(prev => ({ ...prev, schoolName: "" }))
                    }
                  }}
                  placeholder="Enter your school name"
                  className={validationErrors.schoolName ? "border-red-500" : ""}
                />
                {validationErrors.schoolName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.schoolName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetYear" className="flex items-center gap-1">
                  Target College Entry Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={(formData.basicInfo.targetCollegeYear || "").toString()}
                  onValueChange={(value) => {
                    updateFormData("basicInfo", "targetCollegeYear", parseInt(value))
                    if (validationErrors.targetCollegeYear) {
                      setValidationErrors(prev => ({ ...prev, targetCollegeYear: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={validationErrors.targetCollegeYear ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(6)].map((_, i) => {
                      const year = new Date().getFullYear() + i + 1
                      return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
                {validationErrors.targetCollegeYear && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.targetCollegeYear}
                  </p>
                )}
              </div>
            </div>
                  <div className="space-y-4">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      Home Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.basicInfo.address || ""}
                      onChange={(e) => {
                        updateFormData("basicInfo", "address", e.target.value)
                        if (validationErrors.address) {
                          setValidationErrors(prev => ({ ...prev, address: "" }))
                        }
                      }}
                      placeholder="Enter your home address"
                      className={validationErrors.address ? "border-red-500" : ""}
                    />
                    {validationErrors.address && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.address}
                      </p>
                    )}
                  </div>


                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-1">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.basicInfo.city}
                    onChange={(e) => {
                      updateFormData("basicInfo", "city", e.target.value)
                      if (validationErrors.city) {
                        setValidationErrors(prev => ({ ...prev, city: "" }))
                      }
                    }}
                    placeholder="City"
                    className={validationErrors.city ? "border-red-500" : ""}
                  />
                  {validationErrors.city && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.city}
                    </p>
                  )}
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="flex items-center gap-1">
                      State <span className="text-red-500">*</span>
                    </Label>
                    {formData.basicInfo.country === "United States" ? (
                      <Select
                        value={formData.basicInfo.state}
                        onValueChange={(value) => {
                          updateFormData("basicInfo", "state", value)
                          if (validationErrors.state) {
                            setValidationErrors(prev => ({ ...prev, state: "" }))
                          }
                        }}
                      >
                        <SelectTrigger id="state" className={validationErrors.state ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="state"
                        value={formData.basicInfo.state}
                        onChange={(e) => {
                          updateFormData("basicInfo", "state", e.target.value)
                          if (validationErrors.state) {
                            setValidationErrors(prev => ({ ...prev, state: "" }))
                          }
                        }}
                        placeholder="State/Province"
                        className={validationErrors.state ? "border-red-500" : ""}
                      />
                    )}
                    {validationErrors.state && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.state}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-1">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.basicInfo.country}
                      onValueChange={(value) => {
                        updateFormData("basicInfo", "country", value)
                        if (validationErrors.country) {
                          setValidationErrors(prev => ({ ...prev, country: "" }))
                        }
                      }}
                    >
                      <SelectTrigger id="country" className={validationErrors.country ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.country && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.country}
                      </p>
                    )}
                  </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select
                  value={formData.basicInfo.gender}
                  onValueChange={(value) => updateFormData("basicInfo", "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ethnicity">Ethnicity (Optional)</Label>
                <Input
                  id="ethnicity"
                  value={formData.basicInfo.ethnicity}
                  onChange={(e) => updateFormData("basicInfo", "ethnicity", e.target.value)}
                  placeholder="e.g., Asian, Hispanic, African American, etc."
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center">
                Dream Schools
                <InfoTooltip content="List the colleges/universities you dream of attending. This helps us tailor recommendations." />
              </Label>
              <div className="grid gap-3">
                {(formData.basicInfo.dreamSchools as string[] || []).map((school, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={school}
                      onChange={(e) => updateDreamSchool(index, e.target.value)}
                      placeholder={`School ${index + 1} (e.g., Harvard)`}
                    />
                    {(formData.basicInfo.dreamSchools as string[]).length > 3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDreamSchool(index)}
                        className="text-[#5a7a9a] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDreamSchool}
                className="text-[#c9a227] border-[#c9a227] hover:bg-[#c9a227]/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="gpaUnweighted">GPA (Unweighted)</Label>
                <Input
                  id="gpaUnweighted"
                  value={formData.academicProfile.gpaUnweighted}
                  onChange={(e) => updateFormData("academicProfile", "gpaUnweighted", e.target.value)}
                  placeholder="e.g., 3.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpaWeighted">GPA (Weighted)</Label>
                <Input
                  id="gpaWeighted"
                  value={formData.academicProfile.gpaWeighted}
                  onChange={(e) => updateFormData("academicProfile", "gpaWeighted", e.target.value)}
                  placeholder="e.g., 4.2"
                />
              </div>
            </div>
              <div className="space-y-3">
                <Label>Honors/AP/IB Courses Taken (Select all that apply)</Label>
                <div className="p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg max-h-[400px] overflow-y-auto space-y-6">
                  {filteredCourseCategories.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <h4 className="text-sm font-bold text-[#1e3a5f] border-b border-[#e5e0d5] pb-1">
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.courses.map((course) => (
                          <div key={course} className="flex items-start space-x-2">
                            <Checkbox
                              id={`taken-${course}`}
                              checked={(formData.academicProfile.coursesTaken || []).includes(course)}
                              onCheckedChange={() => toggleArrayItem("academicProfile", "coursesTaken", course)}
                            />
                            <Label htmlFor={`taken-${course}`} className="text-sm font-normal cursor-pointer leading-tight">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Advanced Courses Planned (Select all that apply)</Label>
                <div className="p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg max-h-[400px] overflow-y-auto space-y-6">
                  {filteredCourseCategories.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <h4 className="text-sm font-bold text-[#1e3a5f] border-b border-[#e5e0d5] pb-1">
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.courses.map((course) => (
                          <div key={course} className="flex items-start space-x-2">
                            <Checkbox
                              id={`planned-${course}`}
                              checked={(formData.academicProfile.coursesPlanned || []).includes(course)}
                              onCheckedChange={() => toggleArrayItem("academicProfile", "coursesPlanned", course)}
                            />
                            <Label htmlFor={`planned-${course}`} className="text-sm font-normal cursor-pointer leading-tight">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Divider */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Regular Courses</h3>

              <div className="space-y-4">
                <Label>Regular Courses Taken</Label>
                <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                  {REGULAR_COURSE_CATEGORIES.map((category) => (
                    <div key={category.category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{category.category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.courses.map((course) => (
                          <div key={course} className="flex items-center space-x-2">
                            <Checkbox
                              id={`regular-taken-${course}`}
                              checked={formData.academicProfile.regularCoursesTaken?.includes(course)}
                              onCheckedChange={(checked) => {
                                const current = formData.academicProfile.regularCoursesTaken || []
                                updateFormData(
                                  "academicProfile",
                                  "regularCoursesTaken",
                                  checked ? [...current, course] : current.filter((c: string) => c !== course)
                                )
                              }}
                            />
                            <Label htmlFor={`regular-taken-${course}`} className="text-sm font-normal cursor-pointer">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <Label>Regular Courses Planned</Label>
                <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                  {REGULAR_COURSE_CATEGORIES.map((category) => (
                    <div key={category.category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{category.category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.courses.map((course) => (
                          <div key={course} className="flex items-center space-x-2">
                            <Checkbox
                              id={`regular-planned-${course}`}
                              checked={formData.academicProfile.regularCoursesPlanned?.includes(course)}
                              onCheckedChange={(checked) => {
                                const current = formData.academicProfile.regularCoursesPlanned || []
                                updateFormData(
                                  "academicProfile",
                                  "regularCoursesPlanned",
                                  checked ? [...current, course] : current.filter((c: string) => c !== course)
                                )
                              }}
                            />
                            <Label htmlFor={`regular-planned-${course}`} className="text-sm font-normal cursor-pointer">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classRank">Class Rank (if available)</Label>
              <Input
                id="classRank"
                value={formData.academicProfile.classRank}
                onChange={(e) => updateFormData("academicProfile", "classRank", e.target.value)}
                placeholder="e.g., 15 out of 450"
              />
            </div>
              <div className="space-y-3">
                <Label>Favorite Academic Subjects (Select all that apply)</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fav-${subject}`}
                        checked={(formData.academicProfile.favoriteSubjects || []).includes(subject)}
                        onCheckedChange={() => toggleArrayItem("academicProfile", "favoriteSubjects", subject)}
                      />
                      <Label htmlFor={`fav-${subject}`} className="text-sm font-normal cursor-pointer">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Current Curriculum <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.basicInfo.curriculum}
                    onValueChange={(value) => {
                      updateFormData("academicProfile", "curriculum", value)
                      updateFormData("basicInfo", "curriculum", value)
                      if (validationErrors.curriculum) {
                        setValidationErrors(prev => ({ ...prev, curriculum: "" }))
                      }
                    }}
                  >
                    <SelectTrigger className={validationErrors.curriculum ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRICULUM_OPTIONS.map((group) => (
                        <SelectGroup key={group.category}>
                          <SelectLabel className="font-semibold text-xs text-muted-foreground">{group.category}</SelectLabel>
                          {group.curriculums.map((curr) => (
                            <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.curriculum && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.curriculum}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select GPA Scale</Label>
                <Select
                  value={formData.academicProfile.gpaScale || ""}
                  onValueChange={(value) => updateFormData("academicProfile", "gpaScale", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your school's GPA scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {GPA_SCALE_OPTIONS.map((scale) => (
                      <SelectItem key={scale.value} value={scale.value}>{scale.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-4 p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="studyAbroad"
                      checked={formData.basicInfo.studyAbroad}
                      onCheckedChange={(checked) => updateFormData("basicInfo", "studyAbroad", checked)}
                    />
                    <Label htmlFor="studyAbroad" className="cursor-pointer font-semibold">
                      Are you planning to study abroad?
                    </Label>
                  </div>
                  
                  <AnimatePresence>
                    {formData.basicInfo.studyAbroad && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2"
                      >
                        <Label>Target Countries for Study Abroad (Select all that apply)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {COUNTRY_OPTIONS.map((country) => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox
                                id={`target-${country}`}
                                checked={(formData.basicInfo.targetCountries || []).includes(country)}
                                onCheckedChange={() => toggleArrayItem("basicInfo", "targetCountries", country)}
                              />
                              <Label htmlFor={`target-${country}`} className="text-sm font-normal cursor-pointer">
                                {country}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              <div className="space-y-3">
                <Label>Least Favorite Subjects (Select all that apply)</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`least-${subject}`}
                        checked={(formData.academicProfile.leastFavoriteSubjects || []).includes(subject)}
                        onCheckedChange={() => toggleArrayItem("academicProfile", "leastFavoriteSubjects", subject)}
                      />
                      <Label htmlFor={`least-${subject}`} className="text-sm font-normal cursor-pointer">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            <div className="space-y-2">
              <Label htmlFor="academicAwards">Academic Awards & Honors</Label>
              <Textarea
                id="academicAwards"
                value={formData.academicProfile.academicAwards}
                onChange={(e) => updateFormData("academicProfile", "academicAwards", e.target.value)}
                placeholder="List any academic awards, honors, or recognitions..."
                rows={3}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 bg-[#faf8f3] p-3 rounded-lg border border-[#e5e0d5]">
              <Checkbox
                id="notTakenYet"
                checked={formData.testingInfo.notTakenYet}
                onCheckedChange={(checked) => {
                  updateFormData("testingInfo", "notTakenYet", checked)
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      testingInfo: {
                        ...prev.testingInfo,
                        psatScore: "",
                        psatMath: "",
                        psatReading: "",
                        satScore: "",
                        satMath: "",
                        satReading: "",
                        actScore: "",
                        actEnglish: "",
                        actMath: "",
                        actReading: "",
                        actScience: "",
                        notTakenYet: true
                      }
                    }))
                  }
                }}
              />
              <Label htmlFor="notTakenYet" className="cursor-pointer font-medium">
                I have not taken any standardized tests yet
              </Label>
            </div>

            <div className={`grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 ${formData.testingInfo.notTakenYet ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="psatScore" className="flex items-center">
                  PSAT Score
                  <InfoTooltip content="Enter your total PSAT score. Breakdown fields will appear automatically." />
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="psatScore"
                    value={formData.testingInfo.psatScore}
                    onChange={(e) => updateFormData("testingInfo", "psatScore", e.target.value)}
                    placeholder="e.g., 1400"
                    disabled={formData.testingInfo.notTakenYet}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={formData.testingInfo.notTakenYet}
                    onClick={() => {
                      setCurrentTestType("psat")
                      setShowTestBreakdown(true)
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="satScore" className="flex items-center">
                  SAT Score
                  <InfoTooltip content="Enter your total SAT score. Breakdown fields will appear automatically." />
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="satScore"
                    value={formData.testingInfo.satScore}
                    onChange={(e) => updateFormData("testingInfo", "satScore", e.target.value)}
                    placeholder="e.g., 1520"
                    disabled={formData.testingInfo.notTakenYet}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={formData.testingInfo.notTakenYet}
                    onClick={() => {
                      setCurrentTestType("sat")
                      setShowTestBreakdown(true)
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actScore" className="flex items-center">
                  ACT Score
                  <InfoTooltip content="Enter your composite ACT score. Breakdown fields will appear automatically." />
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="actScore"
                    value={formData.testingInfo.actScore}
                    onChange={(e) => updateFormData("testingInfo", "actScore", e.target.value)}
                    placeholder="e.g., 34"
                    disabled={formData.testingInfo.notTakenYet}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={formData.testingInfo.notTakenYet}
                    onClick={() => {
                      setCurrentTestType("act")
                      setShowTestBreakdown(true)
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {!formData.testingInfo.notTakenYet && (
                <>
                  {formData.testingInfo.psatScore && formData.testingInfo.psatScore.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg"
                    >
                      <h3 className="text-sm font-semibold text-[#1e3a5f]">PSAT Score Breakdown</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="psatMath-inline">Math Score</Label>
                          <Input
                            id="psatMath-inline"
                            type="number"
                            max="760"
                            value={formData.testingInfo.psatMath}
                            onChange={(e) => updateFormData("testingInfo", "psatMath", e.target.value)}
                            placeholder="e.g., 700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="psatReading-inline">Reading & Writing</Label>
                          <Input
                            id="psatReading-inline"
                            type="number"
                            max="760"
                            value={formData.testingInfo.psatReading}
                            onChange={(e) => updateFormData("testingInfo", "psatReading", e.target.value)}
                            placeholder="e.g., 700"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.testingInfo.satScore && formData.testingInfo.satScore.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg"
                    >
                      <h3 className="text-sm font-semibold text-[#1e3a5f]">SAT Score Breakdown</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="satMath-inline">Math Score</Label>
                          <Input
                            id="satMath-inline"
                            type="number"
                            max="800"
                            value={formData.testingInfo.satMath}
                            onChange={(e) => updateFormData("testingInfo", "satMath", e.target.value)}
                            placeholder="e.g., 760"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="satReading-inline">Reading & Writing</Label>
                          <Input
                            id="satReading-inline"
                            type="number"
                            max="800"
                            value={formData.testingInfo.satReading}
                            onChange={(e) => updateFormData("testingInfo", "satReading", e.target.value)}
                            placeholder="e.g., 760"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.testingInfo.actScore && formData.testingInfo.actScore.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-[#faf8f3] border border-[#e5e0d5] rounded-lg"
                    >
                      <h3 className="text-sm font-semibold text-[#1e3a5f]">ACT Score Breakdown</h3>
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="actEnglish-inline">English</Label>
                          <Input
                            id="actEnglish-inline"
                            type="number"
                            max="36"
                            value={formData.testingInfo.actEnglish}
                            onChange={(e) => updateFormData("testingInfo", "actEnglish", e.target.value)}
                            placeholder="e.g., 35"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actMath-inline">Math</Label>
                          <Input
                            id="actMath-inline"
                            type="number"
                            max="36"
                            value={formData.testingInfo.actMath}
                            onChange={(e) => updateFormData("testingInfo", "actMath", e.target.value)}
                            placeholder="e.g., 34"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actReading-inline">Reading</Label>
                          <Input
                            id="actReading-inline"
                            type="number"
                            max="36"
                            value={formData.testingInfo.actReading}
                            onChange={(e) => updateFormData("testingInfo", "actReading", e.target.value)}
                            placeholder="e.g., 33"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actScience-inline">Science</Label>
                          <Input
                            id="actScience-inline"
                            type="number"
                            max="36"
                            value={formData.testingInfo.actScience}
                            onChange={(e) => updateFormData("testingInfo", "actScience", e.target.value)}
                            placeholder="e.g., 32"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="testingTimeline">Planned Testing Timeline</Label>
              <Textarea
                id="testingTimeline"
                value={formData.testingInfo.testingTimeline}
                onChange={(e) => updateFormData("testingInfo", "testingTimeline", e.target.value)}
                placeholder="When do you plan to take SAT/ACT? Any retakes planned?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apScores">AP/IB Scores (if available)</Label>
              <Textarea
                id="apScores"
                value={formData.testingInfo.apScores}
                onChange={(e) => updateFormData("testingInfo", "apScores", e.target.value)}
                placeholder="e.g., AP Calculus BC: 5, AP Physics: 4..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Test Format</Label>
              <RadioGroup
                value={formData.testingInfo.preferredTestFormat}
                onValueChange={(value) => updateFormData("testingInfo", "preferredTestFormat", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SAT" id="sat" />
                  <Label htmlFor="sat" className="font-normal cursor-pointer">SAT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ACT" id="act" />
                  <Label htmlFor="act" className="font-normal cursor-pointer">ACT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both" />
                  <Label htmlFor="both" className="font-normal cursor-pointer">Both / Undecided</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-[#5a7a9a] text-sm">List up to 10 extracurricular activities with details about your involvement.</p>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="noExtracurriculars"
                checked={formData.extracurriculars.noExtracurriculars}
                onCheckedChange={(checked) => updateFormData("extracurriculars", "noExtracurriculars", checked)}
              />
              <Label htmlFor="noExtracurriculars" className="text-sm font-normal cursor-pointer">
                I don&apos;t have any extracurricular activities yet
              </Label>
            </div>
            {!formData.extracurriculars.noExtracurriculars && (
            <>
            {formData.extracurriculars.activities.map((activity, index) => (
              <Card key={index} className="border-[#e5e0d5]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#1e3a5f]">Activity {index + 1}</CardTitle>
                    {formData.extracurriculars.activities.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Name</Label>
                      <Input
                        value={activity.name}
                        onChange={(e) => updateActivity(index, "name", e.target.value)}
                        placeholder="e.g., Debate Club"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role/Title</Label>
                      <Input
                        value={activity.role}
                        onChange={(e) => updateActivity(index, "role", e.target.value)}
                        placeholder="e.g., President"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Years Involved</Label>
                      <Input
                        value={activity.yearsInvolved}
                        onChange={(e) => updateActivity(index, "yearsInvolved", e.target.value)}
                        placeholder="e.g., 3 years"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours per Week</Label>
                      <Input
                        value={activity.hoursPerWeek}
                        onChange={(e) => updateActivity(index, "hoursPerWeek", e.target.value)}
                        placeholder="e.g., 5 hours"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notable Achievements</Label>
                    <Textarea
                      value={activity.achievements}
                      onChange={(e) => updateActivity(index, "achievements", e.target.value)}
                      placeholder="Describe any notable achievements or impact..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {formData.extracurriculars.activities.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addActivity}
                className="w-full border-dashed border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Activity
              </Button>
            )}
            </>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 bg-[#faf8f3] p-3 rounded-lg border border-[#e5e0d5]">
              <Checkbox
                id="noLeadership"
                checked={formData.leadership.noLeadershipExperience}
                onCheckedChange={(checked) => {
                  updateFormData("leadership", "noLeadershipExperience", checked)
                  if (checked) {
                    updateFormData("leadership", "entries", [])
                  } else if (!formData.leadership.entries || formData.leadership.entries.length === 0) {
                    updateFormData("leadership", "entries", [{ position: "", organization: "", awards: "", scale: "" }])
                  }
                }}
              />
              <Label htmlFor="noLeadership" className="cursor-pointer font-medium">
                I don't have leadership experience yet
              </Label>
            </div>
            {!formData.leadership.noLeadershipExperience && (
              <>
                <p className="text-[#5a7a9a] text-sm">Add your leadership positions and experiences.</p>
                {(formData.leadership.entries || []).map((entry, index) => (
                  <Card key={index} className="border-[#e5e0d5]">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#1e3a5f]">Leadership Experience {index + 1}</CardTitle>
                        {(formData.leadership.entries || []).length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLeadershipEntry(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Leadership Position Held</Label>
                          <Input
                            value={entry.position}
                            onChange={(e) => updateLeadershipEntry(index, "position", e.target.value)}
                            placeholder="e.g., TSA Member, Club President"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Organization</Label>
                          <Input
                            value={entry.organization}
                            onChange={(e) => updateLeadershipEntry(index, "organization", e.target.value)}
                            placeholder="e.g., TSA, Student Council"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Leadership Awards</Label>
                        <Textarea
                          value={entry.awards}
                          onChange={(e) => updateLeadershipEntry(index, "awards", e.target.value)}
                          placeholder="e.g., 1st Regionals in On Demand Video and VEX Robotics"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Scale of Impact</Label>
                        <Select
                          value={entry.scale}
                          onValueChange={(value) => updateLeadershipEntry(index, "scale", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select scale" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Local">Local (school/community)</SelectItem>
                            <SelectItem value="Regional">Regional (district/city)</SelectItem>
                            <SelectItem value="State">State</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="International">International</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(formData.leadership.entries || []).length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLeadershipEntry}
                    className="w-full border-dashed border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Leadership Experience
                  </Button>
                )}
              </>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 bg-[#faf8f3] p-3 rounded-lg border border-[#e5e0d5]">
              <Checkbox
                id="noCompetitions"
                checked={formData.competitions.noCompetitions}
                onCheckedChange={(checked) => {
                  updateFormData("competitions", "noCompetitions", checked)
                  if (checked) {
                    updateFormData("competitions", "entries", [])
                  } else if (!formData.competitions.entries || formData.competitions.entries.length === 0) {
                    updateFormData("competitions", "entries", [{ competition: "", recognition: "" }])
                  }
                }}
              />
              <Label htmlFor="noCompetitions" className="cursor-pointer font-medium">
                I haven't gotten any yet
              </Label>
            </div>
            {!formData.competitions.noCompetitions && (
              <>
                <p className="text-[#5a7a9a] text-sm">Add your competitions and recognitions.</p>
                {(formData.competitions.entries || []).map((entry, index) => (
                  <Card key={index} className="border-[#e5e0d5]">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#1e3a5f]">Competition {index + 1}</CardTitle>
                        {(formData.competitions.entries || []).length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompetitionEntry(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Competitions Participated In</Label>
                        <Textarea
                          value={entry.competition}
                          onChange={(e) => updateCompetitionEntry(index, "competition", e.target.value)}
                          placeholder="e.g., TSA Regionals, Math Olympiad, DECA, Science Fair, MUN, Debate..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Awards & Recognitions</Label>
                        <Textarea
                          value={entry.recognition}
                          onChange={(e) => updateCompetitionEntry(index, "recognition", e.target.value)}
                          placeholder="e.g., 1st Place in On Demand Video, VEX Robotics"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(formData.competitions.entries || []).length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCompetitionEntry}
                    className="w-full border-dashed border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Competition
                  </Button>
                )}
              </>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>5 Topics/Fields You LOVE Learning About</Label>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic1" className="text-sm text-[#5a7a9a]">Topic #1</Label>
                  <Input
                    id="topic1"
                    value={formData.passions.topic1 || ""}
                    onChange={(e) => updateFormData("passions", "topic1", e.target.value)}
                    placeholder="e.g., AI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic2" className="text-sm text-[#5a7a9a]">Topic #2</Label>
                  <Input
                    id="topic2"
                    value={formData.passions.topic2 || ""}
                    onChange={(e) => updateFormData("passions", "topic2", e.target.value)}
                    placeholder="e.g., Climate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic3" className="text-sm text-[#5a7a9a]">Topic #3</Label>
                  <Input
                    id="topic3"
                    value={formData.passions.topic3 || ""}
                    onChange={(e) => updateFormData("passions", "topic3", e.target.value)}
                    placeholder="e.g., Economics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic4" className="text-sm text-[#5a7a9a]">Topic #4</Label>
                  <Input
                    id="topic4"
                    value={formData.passions.topic4 || ""}
                    onChange={(e) => updateFormData("passions", "topic4", e.target.value)}
                    placeholder="e.g., Art"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic5" className="text-sm text-[#5a7a9a]">Topic #5</Label>
                  <Input
                    id="topic5"
                    value={formData.passions.topic5 || ""}
                    onChange={(e) => updateFormData("passions", "topic5", e.target.value)}
                    placeholder="e.g., Space"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Top 3 Industries or Careers You're Curious About</Label>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry1" className="text-sm text-[#5a7a9a]">Industry #1</Label>
                  <Input
                    id="industry1"
                    value={formData.passions.industry1 || ""}
                    onChange={(e) => updateFormData("passions", "industry1", e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry2" className="text-sm text-[#5a7a9a]">Industry #2</Label>
                  <Input
                    id="industry2"
                    value={formData.passions.industry2 || ""}
                    onChange={(e) => updateFormData("passions", "industry2", e.target.value)}
                    placeholder="e.g., Healthcare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry3" className="text-sm text-[#5a7a9a]">Industry #3</Label>
                  <Input
                    id="industry3"
                    value={formData.passions.industry3 || ""}
                    onChange={(e) => updateFormData("passions", "industry3", e.target.value)}
                    placeholder="e.g., Finance"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hobbiesSkills">Hobbies & Skills</Label>
              <Textarea
                id="hobbiesSkills"
                value={formData.passions.hobbiesSkills}
                onChange={(e) => updateFormData("passions", "hobbiesSkills", e.target.value)}
                placeholder="Coding, art, writing, entrepreneurship, sports, music, etc..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worldProblem">If you could solve any problem in the world, what would it be?</Label>
              <Textarea
                id="worldProblem"
                value={formData.passions.worldProblem}
                onChange={(e) => updateFormData("passions", "worldProblem", e.target.value)}
                placeholder="Describe a problem you're passionate about solving..."
                rows={3}
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <p className="text-[#5a7a9a] text-sm">Tell us about your top 3 career interests</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="career1">Career #1</Label>
                <Input
                  id="career1"
                  value={formData.careerAspirations.career1}
                  onChange={(e) => updateFormData("careerAspirations", "career1", e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career2">Career #2</Label>
                <Input
                  id="career2"
                  value={formData.careerAspirations.career2}
                  onChange={(e) => updateFormData("careerAspirations", "career2", e.target.value)}
                  placeholder="e.g., Physician"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career3">Career #3</Label>
                <Input
                  id="career3"
                  value={formData.careerAspirations.career3}
                  onChange={(e) => updateFormData("careerAspirations", "career3", e.target.value)}
                  placeholder="e.g., Investment Banker"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dreamJobTitle">Dream Job Title</Label>
              <Input
                id="dreamJobTitle"
                value={formData.careerAspirations.dreamJobTitle}
                onChange={(e) => updateFormData("careerAspirations", "dreamJobTitle", e.target.value)}
                placeholder="e.g., CEO of a Tech Startup, Neurosurgeon, Film Director"
              />
            </div>
            <div className="space-y-3">
              <Label>Which statement fits you best?</Label>
              <RadioGroup
                value={formData.careerAspirations.bestFitStatement}
                onValueChange={(value) => updateFormData("careerAspirations", "bestFitStatement", value)}
              >
                {CAREER_STATEMENT_OPTIONS.map((statement) => (
                  <div key={statement} className="flex items-center space-x-2">
                    <RadioGroupItem value={statement} id={statement} />
                    <Label htmlFor={statement} className="font-normal cursor-pointer">{statement}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 bg-[#faf8f3] p-3 rounded-lg border border-[#e5e0d5]">
              <Checkbox
                id="noResearch"
                checked={formData.researchExperience.noResearchExperience}
                onCheckedChange={(checked) => {
                  updateFormData("researchExperience", "noResearchExperience", checked)
                  if (checked) {
                    updateFormData("researchExperience", "entries", [])
                  } else if (!formData.researchExperience.entries || formData.researchExperience.entries.length === 0) {
                    updateFormData("researchExperience", "entries", [{ type: "Research", organization: "", role: "", description: "", duration: "" }])
                  }
                }}
              />
              <Label htmlFor="noResearch" className="cursor-pointer font-medium">
                N/A - I don't have research or professional experience yet
              </Label>
            </div>
            {!formData.researchExperience.noResearchExperience && (
              <>
                <p className="text-[#5a7a9a] text-sm">Add your research projects, shadowing, internships, or professional experiences.</p>
                {(formData.researchExperience.entries || []).map((entry, index) => (
                  <Card key={index} className="border-[#e5e0d5]">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#1e3a5f]">Experience {index + 1}</CardTitle>
                        {(formData.researchExperience.entries || []).length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResearchEntry(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type of Experience</Label>
                          <Select
                            value={entry.type}
                            onValueChange={(value) => updateResearchEntry(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Research">Research Project</SelectItem>
                              <SelectItem value="Shadowing">Job Shadowing</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                              <SelectItem value="Job">Part-time Job</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Organization/Lab</Label>
                          <Input
                            value={entry.organization}
                            onChange={(e) => updateResearchEntry(index, "organization", e.target.value)}
                            placeholder="e.g., Stanford BioLab, Google, City Hospital"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role/Title</Label>
                          <Input
                            value={entry.role}
                            onChange={(e) => updateResearchEntry(index, "role", e.target.value)}
                            placeholder="e.g., Research Assistant, Software Intern"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration/Timeline</Label>
                          <Input
                            value={entry.duration}
                            onChange={(e) => updateResearchEntry(index, "duration", e.target.value)}
                            placeholder="e.g., Summer 2024, 6 months"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Key Responsibilities & Impact</Label>
                        <Textarea
                          value={entry.description}
                          onChange={(e) => updateResearchEntry(index, "description", e.target.value)}
                          placeholder="Describe what you did and any notable outcomes or learnings..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(formData.researchExperience.entries || []).length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addResearchEntry}
                    className="w-full border-dashed border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Experience
                  </Button>
                )}
              </>
            )}
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <p className="text-[#5a7a9a] text-sm">Add any summer programs (academic, leadership, pre-college, etc.) you have attended or plan to attend.</p>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="noSummerPrograms"
                checked={formData.summerPrograms.noSummerPrograms}
                onCheckedChange={(checked) => updateFormData("summerPrograms", "noSummerPrograms", checked)}
              />
              <Label htmlFor="noSummerPrograms" className="text-sm font-normal cursor-pointer">
                I haven&apos;t done or planned any summer programs yet
              </Label>
            </div>
            {!formData.summerPrograms.noSummerPrograms && (
            <>
            {(formData.summerPrograms.entries || []).map((entry, index) => (
              <Card key={index} className="border-[#e5e0d5]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#1e3a5f]">Summer Program {index + 1}</CardTitle>
                    {(formData.summerPrograms.entries || []).length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSummerProgramEntry(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Program Name</Label>
                      <Input
                        value={entry.name}
                        onChange={(e) => updateSummerProgramEntry(index, "name", e.target.value)}
                        placeholder="e.g., LaunchX, Summer Humanities Institute"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization/University</Label>
                      <Input
                        value={entry.organization}
                        onChange={(e) => updateSummerProgramEntry(index, "organization", e.target.value)}
                        placeholder="e.g., MIT, Stanford"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={entry.year}
                      onChange={(e) => updateSummerProgramEntry(index, "year", e.target.value)}
                      placeholder="e.g., 2024 or Planned 2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program Description & Impact</Label>
                    <Textarea
                      value={entry.description}
                      onChange={(e) => updateSummerProgramEntry(index, "description", e.target.value)}
                      placeholder="Describe what you learned and any projects or achievements during the program..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {(formData.summerPrograms.entries || []).length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addSummerProgramEntry}
                className="w-full border-dashed border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Summer Program
              </Button>
            )}
            </>
            )}
          </div>
        )

      case 11:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="musicInstruments">Music Instruments (level and recognitions)</Label>
              <Textarea
                id="musicInstruments"
                value={formData.specialTalents.musicInstruments}
                onChange={(e) => updateFormData("specialTalents", "musicInstruments", e.target.value)}
                placeholder="e.g., Piano - 10 years, ABRSM Grade 8 Distinction; Violin - Regional Orchestra"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visualArts">Visual Arts (painting, photography, film)</Label>
              <Textarea
                id="visualArts"
                value={formData.specialTalents.visualArts}
                onChange={(e) => updateFormData("specialTalents", "visualArts", e.target.value)}
                placeholder="Describe your visual arts experience and any exhibitions or awards..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performanceArts">Performance Arts (theater, dance, public speaking)</Label>
              <Textarea
                id="performanceArts"
                value={formData.specialTalents.performanceArts}
                onChange={(e) => updateFormData("specialTalents", "performanceArts", e.target.value)}
                placeholder="Describe your performance experience and any notable roles or achievements..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="athletics">Athletics (sports and achievements)</Label>
              <Textarea
                id="athletics"
                value={formData.specialTalents.athletics}
                onChange={(e) => updateFormData("specialTalents", "athletics", e.target.value)}
                placeholder="List sports played, positions, teams, and notable achievements..."
                rows={2}
              />
            </div>
          </div>
        )

      case 12:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherProfession">Father&apos;s Profession</Label>
                <Input
                  id="fatherProfession"
                  placeholder="e.g., Software Engineer at Google"
                  value={formData.familyContext.fatherProfession || ""}
                  onChange={(e) => updateFormData("familyContext", "fatherProfession", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherProfession">Mother&apos;s Profession</Label>
                <Input
                  id="motherProfession"
                  placeholder="e.g., Doctor at Mayo Clinic"
                  value={formData.familyContext.motherProfession || ""}
                  onChange={(e) => updateFormData("familyContext", "motherProfession", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siblingProfessions">Sibling Professions (if any)</Label>
              <Input
                id="siblingProfessions"
                placeholder="e.g., Sister - MIT student, Brother - Investment Banking at Goldman Sachs"
                value={formData.familyContext.siblingProfessions || ""}
                onChange={(e) => updateFormData("familyContext", "siblingProfessions", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Legacy College Connections</Label>
                {(formData.familyContext.legacyEntries || []).length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={addLegacyEntry}>
                    <Plus className="h-4 w-4 mr-1" /> Add Connection
                  </Button>
                )}
              </div>
              {(formData.familyContext.legacyEntries || []).map((entry, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="College name (e.g., Harvard University)"
                      value={entry.college}
                      onChange={(e) => updateLegacyEntry(index, "college", e.target.value)}
                    />
                  </div>
                  <div className="w-[200px]">
                    <Select
                      value={entry.relation}
                      onValueChange={(value) => updateLegacyEntry(index, "relation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent (Alumnus/Alumna)">Parent (Alumnus/Alumna)</SelectItem>
                        <SelectItem value="Grandparent">Grandparent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Aunt / Uncle">Aunt / Uncle</SelectItem>
                        <SelectItem value="Cousin">Cousin</SelectItem>
                        <SelectItem value="Other Family">Other Family</SelectItem>
                        <SelectItem value="Family Donor">Family Donor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.familyContext.legacyEntries || []).length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLegacyEntry(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financialAid"
                  checked={formData.familyContext.financialAidNeeded}
                  onCheckedChange={(checked) => updateFormData("familyContext", "financialAidNeeded", checked === true)}
                />
                <Label htmlFor="financialAid" className="text-sm font-normal cursor-pointer">
                  We will need financial aid for college
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meritScholarship"
                  checked={formData.familyContext.meritScholarshipInterest}
                  onCheckedChange={(checked) => updateFormData("familyContext", "meritScholarshipInterest", checked === true)}
                />
                <Label htmlFor="meritScholarship" className="text-sm font-normal cursor-pointer">
                  Interested in merit-based scholarships
                </Label>
              </div>
            </div>
          </div>
        )

      case 13:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Top 3 Strengths (self-described)</Label>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strength1" className="text-sm text-[#5a7a9a]">Strength #1</Label>
                  <Input
                    id="strength1"
                    value={formData.personality.strength1 || ""}
                    onChange={(e) => updateFormData("personality", "strength1", e.target.value)}
                    placeholder="e.g., Problem-solving"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strength2" className="text-sm text-[#5a7a9a]">Strength #2</Label>
                  <Input
                    id="strength2"
                    value={formData.personality.strength2 || ""}
                    onChange={(e) => updateFormData("personality", "strength2", e.target.value)}
                    placeholder="e.g., Communication"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strength3" className="text-sm text-[#5a7a9a]">Strength #3</Label>
                  <Input
                    id="strength3"
                    value={formData.personality.strength3 || ""}
                    onChange={(e) => updateFormData("personality", "strength3", e.target.value)}
                    placeholder="e.g., Creativity"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Top 3 Weaknesses (self-described)</Label>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weakness1" className="text-sm text-[#5a7a9a]">Weakness #1</Label>
                  <Input
                    id="weakness1"
                    value={formData.personality.weakness1 || ""}
                    onChange={(e) => updateFormData("personality", "weakness1", e.target.value)}
                    placeholder="e.g., Perfectionism"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weakness2" className="text-sm text-[#5a7a9a]">Weakness #2</Label>
                  <Input
                    id="weakness2"
                    value={formData.personality.weakness2 || ""}
                    onChange={(e) => updateFormData("personality", "weakness2", e.target.value)}
                    placeholder="e.g., Public speaking"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weakness3" className="text-sm text-[#5a7a9a]">Weakness #3</Label>
                  <Input
                    id="weakness3"
                    value={formData.personality.weakness3 || ""}
                    onChange={(e) => updateFormData("personality", "weakness3", e.target.value)}
                    placeholder="e.g., Time management"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Personality Archetypes (Select up to 2)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ARCHETYPE_OPTIONS.map((archetype) => (
                  <div key={archetype} className="flex items-center space-x-2">
                    <Checkbox
                      id={archetype}
                      checked={(formData.personality.archetypes || []).includes(archetype)}
                      onCheckedChange={() => {
                        const archetypes = formData.personality.archetypes || []
                        if (archetypes.includes(archetype)) {
                          toggleArrayItem("personality", "archetypes", archetype)
                        } else if (archetypes.length < 2) {
                          toggleArrayItem("personality", "archetypes", archetype)
                        }
                      }}
                      disabled={!(formData.personality.archetypes || []).includes(archetype) && (formData.personality.archetypes || []).length >= 2}
                    />
                    <Label htmlFor={archetype} className="text-sm font-normal cursor-pointer">
                      {archetype}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Introvert or Extrovert?</Label>
              <RadioGroup
                value={formData.personality.introvertExtrovert}
                onValueChange={(value) => updateFormData("personality", "introvertExtrovert", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Introvert" id="introvert" />
                  <Label htmlFor="introvert" className="font-normal cursor-pointer">Introvert</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Extrovert" id="extrovert" />
                  <Label htmlFor="extrovert" className="font-normal cursor-pointer">Extrovert</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ambivert" id="ambivert" />
                  <Label htmlFor="ambivert" className="font-normal cursor-pointer">Ambivert (both)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 14:
        return (
          <div className="space-y-6">
            <p className="text-[#5a7a9a] text-sm">These stories help us understand your unique journey and can inspire powerful college essay topics.</p>
            <div className="space-y-2">
              <Label htmlFor="lifeChallenge">A life challenge you have overcome</Label>
              <Textarea
                id="lifeChallenge"
                value={formData.personalStories.lifeChallenge}
                onChange={(e) => updateFormData("personalStories", "lifeChallenge", e.target.value)}
                placeholder="Describe a significant challenge and how you overcame it..."
                rows={4}
              />
              <p className="text-xs text-[#5a7a9a]">
                {countWords(formData.personalStories.lifeChallenge)}/500 words
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadershipMoment">A time you showed leadership or initiative</Label>
              <Textarea
                id="leadershipMoment"
                value={formData.personalStories.leadershipMoment}
                onChange={(e) => updateFormData("personalStories", "leadershipMoment", e.target.value)}
                placeholder="Describe a moment when you took charge or initiated something meaningful..."
                rows={4}
              />
              <p className="text-xs text-[#5a7a9a]">
                {countWords(formData.personalStories.leadershipMoment)}/500 words
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="failureLesson">A time you failed and learned an important lesson</Label>
              <Textarea
                id="failureLesson"
                value={formData.personalStories.failureLesson}
                onChange={(e) => updateFormData("personalStories", "failureLesson", e.target.value)}
                placeholder="Describe a failure and what you learned from it..."
                rows={4}
              />
              <p className="text-xs text-[#5a7a9a]">
                {countWords(formData.personalStories.failureLesson)}/500 words
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proudMoment">Something you're insanely proud of that most people don't know</Label>
              <Textarea
                id="proudMoment"
                value={formData.personalStories.proudMoment}
                onChange={(e) => updateFormData("personalStories", "proudMoment", e.target.value)}
                placeholder="Share a hidden accomplishment or moment of pride..."
                rows={4}
              />
              <p className="text-xs text-[#5a7a9a]">
                {countWords(formData.personalStories.proudMoment)}/500 words
              </p>
            </div>
          </div>
        )

      case 15:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hoursSchoolYear">Hours available per week during school year</Label>
              <Select
                value={formData.timeCommitment.hoursSchoolYear}
                onValueChange={(value) => updateFormData("timeCommitment", "hoursSchoolYear", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5 hours">1-5 hours</SelectItem>
                  <SelectItem value="5-10 hours">5-10 hours</SelectItem>
                  <SelectItem value="10-15 hours">10-15 hours</SelectItem>
                  <SelectItem value="15-20 hours">15-20 hours</SelectItem>
                  <SelectItem value="20+ hours">20+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursSummer">Hours available per week during summer</Label>
              <Select
                value={formData.timeCommitment.hoursSummer}
                onValueChange={(value) => updateFormData("timeCommitment", "hoursSummer", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-20 hours">10-20 hours</SelectItem>
                  <SelectItem value="20-30 hours">20-30 hours</SelectItem>
                  <SelectItem value="30-40 hours">30-40 hours</SelectItem>
                  <SelectItem value="40+ hours">40+ hours (full-time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Preferred Pace of Building Projects</Label>
              <RadioGroup
                value={formData.timeCommitment.preferredPace}
                onValueChange={(value) => updateFormData("timeCommitment", "preferredPace", value)}
              >
                {PACE_OPTIONS.map((pace) => (
                  <div key={pace} className="flex items-center space-x-2">
                    <RadioGroupItem value={pace} id={pace} />
                    <Label htmlFor={pace} className="font-normal cursor-pointer">{pace}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-[#5a7a9a]">Loading your assessment...</p>
        </div>
      </div>
    )
  }

    if (showLoadingScreen) {
      return (
        <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-[#e5e0d5] shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-6">
                <Loader2 className="w-16 h-16 animate-spin text-[#c9a227] mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Generating Your Report
              </h2>
              <p className="text-[#5a7a9a] mb-2">
                Please stay on this page, your report will be ready in &lt;2 min
              </p>
              <p className="text-sm text-[#5a7a9a]/70">
                Our AI is analyzing your profile and creating your personalized roadmap...
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#faf8f3]">
          <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f3]/95 backdrop-blur-md border-b border-[#e5e0d5]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image 
                    src={tenant?.logo_url || "/logo.png"} 
                    alt={`${tenant?.name || "TheStudentBlueprint"} Logo`}
                    fill
                    className="object-contain" 
                  />
                </div>
                <span className="font-bold text-lg sm:text-xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif", color: tenant?.primary_color || "#1e3a5f" }}>
                  {tenant?.name || "TheStudentBlueprint"}
                </span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                {isSaving && (
                  <div className="flex items-center gap-1 sm:gap-2 text-[#5a7a9a] text-[10px] sm:text-sm">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden xs:inline">Saving...</span>
                  </div>
                )}
                {uniqueCode && (
                  <div className="text-[10px] sm:text-xs text-[#5a7a9a] bg-[#f0ece3] px-2 py-1 rounded border border-[#e5e0d5]">
                    <span className="hidden sm:inline">Code: </span><span className="font-mono font-bold text-[#1e3a5f]">{uniqueCode}</span>
                  </div>
                )}
              </div>
            </div>
          </nav>

        <main className="pt-20 sm:pt-24 pb-28 sm:pb-32 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-[#5a7a9a]">
                  Section {currentSection} of 15
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#5a7a9a]">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-[#e5e0d5]" />
            </div>

            <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {SECTION_TITLES.map((title, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index + 1)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    currentSection === index + 1
                      ? "bg-[#1e3a5f] text-white"
                      : completedSections.has(index + 1)
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-[#e5e0d5] text-[#5a7a9a] hover:bg-[#d5d0c5]"
                  }`}
                >
                  {completedSections.has(index + 1) && currentSection !== index + 1 && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {title}
                </button>
              ))}
            </div>

            <div className="text-center mb-4 hidden sm:block">
              <p className="text-xs text-[#5a7a9a]">
                Press <kbd className="px-1.5 py-0.5 bg-[#e5e0d5] rounded text-xs font-mono">Enter</kbd> to continue or{" "}
                <kbd className="px-1.5 py-0.5 bg-[#e5e0d5] rounded text-xs font-mono">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-[#e5e0d5] rounded text-xs font-mono">←/→</kbd> to navigate
              </p>
            </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
                <Card className="border-[#e5e0d5] bg-white shadow-sm">
                  <CardHeader className="border-b border-[#e5e0d5] bg-[#faf8f3]/50 p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {SECTION_TITLES[currentSection - 1]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    {renderSection()}
                  </CardContent>
                </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e0d5] py-3 sm:py-4 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 1}
              className="border-[#e5e0d5] text-[#5a7a9a] px-3 sm:px-4 text-sm"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveProgress}
              disabled={isSaving}
              className="border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/5 px-3 sm:px-4 text-sm"
              size="sm"
            >
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            {currentSection < 15 ? (
              <Button
                onClick={handleNext}
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-3 sm:px-4 text-sm"
                size="sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#c9a227] hover:bg-[#b8921f] text-[#1e3a5f] font-semibold px-3 sm:px-4 text-sm"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Submit</span>
                    <span className="sm:hidden">Submit</span>
                    <CheckCircle2 className="w-4 h-4 sm:ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      <Dialog open={showTestBreakdown} onOpenChange={setShowTestBreakdown}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentTestType === "psat" ? "PSAT Score Breakdown" : currentTestType === "sat" ? "SAT Score Breakdown" : "ACT Score Breakdown"}
            </DialogTitle>
            <DialogDescription>
              Enter individual section scores (optional but helpful for analysis)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentTestType === "psat" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="psatMath">Math Score</Label>
                  <Input
                    id="psatMath"
                    type="number"
                    max="760"
                    value={formData.testingInfo.psatMath}
                    onChange={(e) => updateFormData("testingInfo", "psatMath", e.target.value)}
                    placeholder="e.g., 700 (out of 760)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="psatReading">Reading & Writing Score</Label>
                  <Input
                    id="psatReading"
                    type="number"
                    max="760"
                    value={formData.testingInfo.psatReading}
                    onChange={(e) => updateFormData("testingInfo", "psatReading", e.target.value)}
                    placeholder="e.g., 700 (out of 760)"
                  />
                </div>
              </>
            ) : currentTestType === "sat" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="satMath">Math Score</Label>
                  <Input
                    id="satMath"
                    type="number"
                    max="800"
                    value={formData.testingInfo.satMath}
                    onChange={(e) => updateFormData("testingInfo", "satMath", e.target.value)}
                    placeholder="e.g., 760 (out of 800)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satReading">Reading & Writing Score</Label>
                  <Input
                    id="satReading"
                    type="number"
                    max="800"
                    value={formData.testingInfo.satReading}
                    onChange={(e) => updateFormData("testingInfo", "satReading", e.target.value)}
                    placeholder="e.g., 760 (out of 800)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="actEnglish">English Score</Label>
                  <Input
                    id="actEnglish"
                    type="number"
                    max="36"
                    value={formData.testingInfo.actEnglish}
                    onChange={(e) => updateFormData("testingInfo", "actEnglish", e.target.value)}
                    placeholder="e.g., 35 (out of 36)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actMath">Math Score</Label>
                  <Input
                    id="actMath"
                    type="number"
                    max="36"
                    value={formData.testingInfo.actMath}
                    onChange={(e) => updateFormData("testingInfo", "actMath", e.target.value)}
                    placeholder="e.g., 34 (out of 36)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actReading">Reading Score</Label>
                  <Input
                    id="actReading"
                    type="number"
                    max="36"
                    value={formData.testingInfo.actReading}
                    onChange={(e) => updateFormData("testingInfo", "actReading", e.target.value)}
                    placeholder="e.g., 33 (out of 36)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actScience">Science Score</Label>
                  <Input
                    id="actScience"
                    type="number"
                    max="36"
                    value={formData.testingInfo.actScience}
                    onChange={(e) => updateFormData("testingInfo", "actScience", e.target.value)}
                    placeholder="e.g., 32 (out of 36)"
                  />
                </div>
              </>
            )}
            <Button
              onClick={() => setShowTestBreakdown(false)}
              className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Progress Saved!
            </DialogTitle>
            <DialogDescription>
              Your assessment has been saved. Use this unique code to resume anytime - no account needed!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-[#faf8f3] border border-[#e5e0d5] rounded-lg p-4">
              <p className="text-xs text-[#5a7a9a] mb-2">Your Resume Code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-2xl font-mono font-bold text-[#1e3a5f] tracking-wider text-center">
                  {uniqueCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                  className="border-[#c9a227] text-[#c9a227]"
                >
                  {codeCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-[#5a7a9a]">
              To continue later, go to{" "}
              <Link href="/resume" className="text-[#c9a227] font-medium hover:underline">
                studentblueprint.com/resume
              </Link>{" "}
              and enter this code.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowSaveModal(false)}
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
            >
              Continue Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoTooltip({ content, wide }: { content: string, wide?: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-[#5a7a9a] cursor-help ml-1.5 inline-block" />
        </TooltipTrigger>
        <TooltipContent className={`${wide ? "max-w-sm" : "max-w-xs"} bg-[#1e3a5f] text-white border-none p-3 shadow-xl`}>
          <p className="text-xs font-normal leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-[#5a7a9a]">Loading...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}