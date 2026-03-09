"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  FileText,
  DollarSign,
  LogOut,
  Loader2,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Send,
  Mail,
  BarChart3,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  History,
  GraduationCap,
  Calendar,
  UserPlus,
  Settings,
  Building2,
  Ticket,
  PieChart,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Package,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner"
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

interface Admin {
  id: string
  email: string
  fullName: string
  first_name: string
  last_name: string
  role: string
  organization_id: string
  organization: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    plan_type: string
  }
}

interface Assessment {
  id: string
  organization_id: string
  student_id: string
  status: string
  payment_status: string
  amount_paid: number
  started_at: string | null
  completed_at: string | null
  created_at: string
  student: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string | null
    grade_level: string | null
    school_name: string | null
  } | null
  coupon_code?: string
  scores: any
  report_data: any
}

interface AtRiskStudent {
  id: string
  name: string
  email: string
  grade: string
  currentSection: string
  daysStuck: number
  competitivenessScore: number | null
  majorGaps: number
  risks: string[]
  lastUpdated: string
}

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  used_count: number
  max_uses: number | null
  is_active: boolean
  valid_until: string | null
  created_at: string
}

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  actor_email: string
  metadata: any
  created_at: string
}

const COLORS = ['#1e3a5f', '#c9a227', '#5a7a9a', '#10b981', '#8b5cf6']

export default function AgencyDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [showAdminInviteDialog, setShowAdminInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [adminInvite, setAdminInvite] = useState({ email: "", fullName: "", role: "admin" as string })
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "free",
    discount_value: 0,
    max_uses: "",
    valid_until: ""
  })
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false)
  
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/me")
      const data = await response.json()

      if (data.admin) {
        if (data.admin.role === 'super_admin') {
          router.push("/admin")
          return
        }

        // Check if onboarding is completed
        const org = data.admin.organization
        if (org && !org.onboarding_completed) {
          router.push("/agency/onboarding")
          return
        }

        setAdmin(data.admin)
        fetchData()
      } else {
        router.push("/admin/login")
      }
    } catch {
      router.push("/admin/login")
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [assessmentsRes, atRiskRes, couponsRes, auditLogsRes, adminsRes] = await Promise.all([
        fetch("/api/admin/assessments"),
        fetch("/api/admin/at-risk"),
        fetch("/api/admin/coupons"),
        fetch("/api/admin/audit-logs"),
        fetch("/api/admin/manage-admins"),
      ])

      const [assessmentsData, atRiskData, couponsData, auditLogsData, adminsData] = await Promise.all([
        assessmentsRes.json(),
        atRiskRes.json(),
        couponsRes.json(),
        auditLogsRes.json(),
        adminsRes.json(),
      ])

      if (assessmentsData.assessments) setAssessments(assessmentsData.assessments)
      if (atRiskData.atRiskStudents) setAtRiskStudents(atRiskData.atRiskStudents)
      if (couponsData.coupons) setCoupons(couponsData.coupons)
      if (auditLogsData.logs) setAuditLogs(auditLogsData.logs)
      if (adminsData.admins) setAdmins(adminsData.admins)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      toast.success("Logged out successfully")
      router.push("/admin/login")
    } catch {
      toast.error("Failed to logout")
    }
  }

  const handleInviteStudent = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setIsInviting(true)
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Invitation sent successfully!")
        setShowInviteDialog(false)
        setInviteEmail("")
        fetchData()
      } else {
        toast.error(data.error || "Failed to send invitation")
      }
    } catch {
      toast.error("Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleInviteAdmin = async () => {
    if (!adminInvite.email.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setIsInvitingAdmin(true)
    try {
      const response = await fetch("/api/admin/invite-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminInvite.email,
          fullName: adminInvite.fullName || undefined,
          role: adminInvite.role,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Admin invitation sent successfully!")
        setShowAdminInviteDialog(false)
        setAdminInvite({ email: "", fullName: "", role: "admin" })
        fetchData()
      } else {
        toast.error(data.error || "Failed to invite admin")
      }
    } catch {
      toast.error("Failed to invite admin")
    } finally {
      setIsInvitingAdmin(false)
    }
  }

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error("Coupon code is required")
      return
    }

    setIsCreatingCoupon(true)
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCoupon,
          max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Coupon created successfully")
        setShowCouponDialog(false)
        setNewCoupon({ code: "", discount_type: "free", discount_value: 0, max_uses: "", valid_until: "" })
        fetchData()
      } else {
        toast.error(data.error || "Failed to create coupon")
      }
    } catch {
      toast.error("Failed to create coupon")
    } finally {
      setIsCreatingCoupon(false)
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: couponId, is_active: !currentStatus }),
      })

      if (response.ok) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchData()
      }
    } catch {
      toast.error("Failed to update coupon")
    }
  }

  const handleChangePassword = async () => {
    if (!passwordChange.newPassword || !passwordChange.currentPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordChange.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }
    setIsChangingPassword(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password updated successfully")
        setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowPasswordDialog(false)
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const filteredAssessments = assessments.filter(a => {
    const studentName = `${a.student?.first_name || ''} ${a.student?.last_name || ''}`.toLowerCase()
    const studentEmail = (a.student?.email || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    return studentName.includes(search) || studentEmail.includes(search)
  })

  const stats = useMemo(() => {
    const completed = assessments.filter(a => a.status === 'completed').length
    const total = assessments.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const activeCoupons = coupons.filter(c => c.is_active).length
    const avgScore = assessments
      .filter(a => a.status === 'completed' && a.scores?.overall_score)
      .reduce((acc, a) => acc + (a.scores.overall_score || 0), 0) / (completed || 1)

    return {
      totalAssessments: total,
      completedAssessments: completed,
      completionRate,
      activeCoupons,
      avgScore: Math.round(avgScore),
      atRiskCount: atRiskStudents.length,
      totalRevenue: assessments.filter(a => a.payment_status === 'paid').reduce((sum, a) => sum + (a.amount_paid || 0), 0),
    }
  }, [assessments, coupons, atRiskStudents])

  const activityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return {
        name: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        started: 0,
        completed: 0
      }
    })

    assessments.forEach(a => {
      const startedDate = a.created_at.split('T')[0]
      const completedDate = a.completed_at?.split('T')[0]
      
      const startedDay = last7Days.find(d => d.date === startedDate)
      if (startedDay) startedDay.started++
      
      const completedDay = last7Days.find(d => d.date === completedDate)
      if (completedDay) completedDay.completed++
    })

    return last7Days
  }, [assessments])

  const paymentDistribution = [
    { name: 'Paid', value: assessments.filter(a => a.payment_status === 'paid').length },
    { name: 'Unpaid', value: assessments.filter(a => a.payment_status !== 'paid').length },
    { name: 'Coupon Used', value: assessments.filter(a => a.coupon_code).length },
  ].filter(d => d.value > 0)

  const archetypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    assessments.forEach(a => {
      const archetype = a.report_data?.studentArchetype
      if (archetype && archetype !== 'Pending') {
        counts[archetype] = (counts[archetype] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [assessments])

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { name: '0-20', value: 0 },
      { name: '21-40', value: 0 },
      { name: '41-60', value: 0 },
      { name: '61-80', value: 0 },
      { name: '81-100', value: 0 },
    ]
    assessments.forEach(a => {
      const score = a.scores?.competitivenessScore ?? a.report_data?.competitivenessScore
      if (typeof score === 'number') {
        const idx = Math.min(Math.floor(score / 20), 4)
        buckets[idx].value++
      }
    })
    return buckets
  }, [assessments])

  const primaryColor = admin?.organization?.primary_color || '#1e3a5f'
  const secondaryColor = admin?.organization?.secondary_color || '#c9a227'

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Impersonation Banner */}
      <ImpersonationBanner />

      {/* Agency Header - Branded */}
      <nav className="text-white sticky top-0 z-50 shadow-xl border-b border-white/5" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {admin.organization?.logo_url ? (
                <Image src={admin.organization.logo_url} alt="Logo" width={42} height={42} className="w-9 h-9 object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                  {admin.organization?.name?.[0] || 'A'}
                </div>
              )}
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {admin.organization?.name || 'Dashboard'}
              </span>
              <Badge className="bg-white/10 text-white border-0 text-[10px] uppercase tracking-widest font-bold px-2 py-0 h-5">BETA</Badge>
            </Link>
            <div className="hidden md:flex items-center ml-4">
              <Badge className="bg-white/20 text-white border-0 px-3 py-1 text-[10px] font-bold tracking-wider">Admin Dashboard</Badge>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-sm hidden lg:block font-bold text-white tracking-wide">
                  {admin.fullName || admin.email}
                </span>
                <Badge className="hover:opacity-90 border-0 rounded-full px-3 py-0 h-5 text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                  Agency Admin
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group outline-none">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-[#faf8f3] transition-all duration-300 group-hover:scale-105 shadow-lg" style={{ borderColor: `${secondaryColor}80` }}>
                      <span className="font-bold text-lg uppercase" style={{ color: primaryColor }}>
                        {(admin.fullName || admin.email || "A")[0]}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 rounded-full" style={{ borderColor: primaryColor }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-white border-[#e5e0d5] shadow-2xl rounded-xl p-2">
                  <DropdownMenuLabel className="font-display px-2 py-1.5" style={{ color: primaryColor }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: secondaryColor }}>Account</p>
                    <p className="text-sm truncate">{admin.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#e5e0d5]" />
                  <DropdownMenuItem
                    onClick={() => router.push("/agency/settings")}
                    className="flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-lg hover:bg-[#faf8f3] transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#c9a227]">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Agency Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowPasswordDialog(true)}
                    className="flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-lg hover:bg-[#faf8f3] transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#e5e0d5]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-bold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 p-8 bg-white rounded-3xl border border-[#e5e0d5] shadow-sm">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif", color: primaryColor }}>
                Admin Dashboard
              </h1>
              <p className="text-[#5a7a9a] text-lg font-medium">Manage assessments, students, coupons, and system-wide upgrades</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="h-12 px-6 rounded-2xl border-[#e5e0d5] font-bold text-[#5a7a9a] hover:bg-[#faf8f3]" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowInviteDialog(true)} 
                className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-black/5" 
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invites
              </Button>
            </div>
          </div>

            {/* Navigation Tabs - Horizontal Scroll */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="overflow-x-auto pb-2 -mx-6 px-6">
                <TabsList className="bg-white border border-[#e5e0d5] p-1.5 h-auto inline-flex gap-1 rounded-2xl shadow-sm w-max">
                  <TabsTrigger value="overview" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="students" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger value="coupons" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <Ticket className="w-4 h-4 mr-2" />
                    Coupons
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="at-risk" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    At-Risk
                  </TabsTrigger>
                  <TabsTrigger value="manage-admins" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Manage Admins
                  </TabsTrigger>
                  <TabsTrigger value="changelog" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <History className="w-4 h-4 mr-2" />
                    Changelog
                  </TabsTrigger>
                  <TabsTrigger value="audit-logs" className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Audit Logs
                  </TabsTrigger>
                    <button 
                      onClick={() => router.push("/agency/knowledge-hub")}
                      className="rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap hover:bg-[#faf8f3] flex items-center text-[#5a7a9a]"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Knowledge Hub
                    </button>
                  </TabsList>

              </div>

            <TabsContent value="overview" className="space-y-8">
              {/* Stat Cards - Matching Image Style */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#5a7a9a] mb-2 uppercase tracking-widest">Total Assessments</p>
                        <p className="text-5xl font-black text-[#0a192f] mb-2">{stats.totalAssessments}</p>
                        <p className="text-sm font-bold text-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stats.completedAssessments} completed
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
                        <FileText className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#5a7a9a] mb-2 uppercase tracking-widest">Completion Rate</p>
                        <p className="text-5xl font-black text-[#0a192f] mb-4">{stats.completionRate}%</p>
                        <div className="w-32">
                          <Progress value={stats.completionRate} className="h-2 bg-blue-50" />
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-50 text-green-600 border border-green-100">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#5a7a9a] mb-2 uppercase tracking-widest">Active Coupons</p>
                        <p className="text-5xl font-black text-[#0a192f] mb-2">{stats.activeCoupons}</p>
                        <p className="text-sm font-bold text-[#5a7a9a]">{coupons.reduce((acc, c) => acc + c.used_count, 0)} total uses</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
                        <Ticket className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#5a7a9a] mb-2 uppercase tracking-widest">Avg Score</p>
                        <p className="text-5xl font-black text-[#0a192f] mb-2">{stats.avgScore}</p>
                        <p className="text-sm font-bold text-purple-600">competitiveness</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600">
                        <Award className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Charts - Matching Image Style */}
              <div className="grid lg:grid-cols-7 gap-8">
                <Card className="lg:col-span-4 border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                  <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-2xl font-black text-[#0a192f]">Assessment Activity (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="h-[350px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#5a7a9a', fontSize: 12, fontWeight: 'bold' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#5a7a9a', fontSize: 12, fontWeight: 'bold' }}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#faf8f3' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Bar name="Started" dataKey="started" fill="#1e3a5f" radius={[4, 4, 0, 0]} barSize={24} />
                          <Bar name="Completed" dataKey="completed" fill="#c9a227" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                  <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-2xl font-black text-[#0a192f]">Payment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="h-[350px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={paymentDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {paymentDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assessments Footer - Matching Image Style */}
              <div className="flex items-center justify-between px-8">
                <div>
                  <h3 className="text-xl font-bold text-[#0a192f]">Recent Assessments</h3>
                  <p className="text-sm text-[#5a7a9a]">Latest student submissions</p>
                </div>
                <Button variant="ghost" className="text-[#c9a227] font-bold text-sm hover:bg-amber-50" onClick={() => setActiveTab("students")}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-[#0a192f]">Student Assessments</CardTitle>
                      <CardDescription className="text-[#5a7a9a]">Manage and track all student progress</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-[#e5e0d5] bg-[#faf8f3]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[#faf8f3]">
                      <TableRow className="border-[#e5e0d5]">
                        <TableHead className="px-8 font-bold text-[#0a192f]">Student</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Status</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Score</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Payment</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Completed</TableHead>
                        <TableHead className="px-8 text-right font-bold text-[#0a192f]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center text-[#5a7a9a]">
                              <Users className="w-12 h-12 mb-4 opacity-20" />
                              <p className="text-lg font-medium">No students found</p>
                              <Button variant="link" className="text-[#c9a227]" onClick={() => setSearchTerm("")}>Clear search</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssessments.map((a) => (
                          <TableRow key={a.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50 transition-colors">
                            <TableCell className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a5f] font-bold">
                                  {(a.student?.first_name || 'S')[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-[#0a192f]">{a.student?.first_name} {a.student?.last_name}</p>
                                  <p className="text-xs text-[#5a7a9a]">{a.student?.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${
                                a.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                a.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-gray-50 text-gray-700 border border-gray-100'
                              }`}>
                                {a.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-[#0a192f]">
                                {a.scores?.overall_score || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${
                                a.payment_status === 'paid' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-700'
                              }`}>
                                {a.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a] font-medium">
                                {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                              <div className="flex justify-end gap-2">
                                {a.status === 'completed' && (
                                  <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 text-[#1e3a5f] hover:bg-blue-50" onClick={() => router.push(`/results/${a.id}`)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 text-[#5a7a9a] hover:bg-gray-100" onClick={() => copyToClipboard(a.student?.email || '')}>
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coupons">
              <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-[#0a192f]">Coupon Codes</CardTitle>
                      <CardDescription>Create and manage discounts for your assessments</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setShowCouponDialog(true)}
                      className="rounded-2xl h-12 px-6 font-black"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Coupon
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative p-6 rounded-[24px] border-2 transition-all ${
                          coupon.is_active ? 'border-[#e5e0d5] bg-white' : 'border-gray-100 bg-gray-50/50 grayscale'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-2xl bg-amber-50 text-[#c9a227]">
                            <Ticket className="w-6 h-6" />
                          </div>
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                          />
                        </div>
                        <h3 className="text-2xl font-black text-[#0a192f] mb-1">{coupon.code}</h3>
                        <p className="text-[#5a7a9a] font-bold text-sm mb-6">
                          {coupon.discount_type === 'free' ? '100% OFF (Free)' : 
                           coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : 
                           `$${coupon.discount_value} OFF`}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#5a7a9a] font-bold">Usage</span>
                            <span className="text-[#0a192f] font-black">{coupon.used_count} / {coupon.max_uses || '∞'}</span>
                          </div>
                          <Progress value={coupon.max_uses ? (coupon.used_count / coupon.max_uses) * 100 : 0} className="h-1.5" />
                          
                          {coupon.valid_until && (
                            <div className="flex items-center gap-2 text-xs text-[#5a7a9a] mt-4 pt-4 border-t border-[#e5e0d5]">
                              <Calendar className="w-3 h-3" />
                              Expires {new Date(coupon.valid_until).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {coupons.length === 0 && (
                      <div className="col-span-full py-20 text-center text-[#5a7a9a] border-2 border-dashed border-[#e5e0d5] rounded-[32px]">
                        <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">No coupons created yet</p>
                        <Button variant="link" className="text-[#c9a227]" onClick={() => setShowCouponDialog(true)}>Create your first coupon</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-2xl font-black text-[#0a192f]">Assessment Volume</CardTitle>
                    <CardDescription>Daily assessment starts vs completions</CardDescription>
                  </CardHeader>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5a7a9a', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5a7a9a', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="top" height={36} align="right" />
                        <Line type="monotone" dataKey="started" stroke="#1e3a5f" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: 'white' }} />
                        <Line type="monotone" dataKey="completed" stroke="#c9a227" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: 'white' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-2xl font-black text-[#0a192f]">Score Distribution</CardTitle>
                    <CardDescription>Competitiveness scores across all students</CardDescription>
                  </CardHeader>
                  <div className="h-[350px]">
                    {scoreDistribution.some(b => b.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5a7a9a', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5a7a9a', fontSize: 12 }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="value" name="Students" fill="#1e3a5f" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#5a7a9a]">
                        <p className="font-bold">No completed assessments yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="mt-8">
                <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-2xl font-black text-[#0a192f]">Student Archetypes</CardTitle>
                    <CardDescription>Distribution of student profiles across your cohort</CardDescription>
                  </CardHeader>
                  <div className="h-[350px]">
                    {archetypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={archetypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={130}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {archetypeData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#5a7a9a]">
                        <p className="font-bold">No completed assessments yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="at-risk">
              <Card className="border-red-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-8 bg-red-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-red-700">At-Risk Students</CardTitle>
                      <CardDescription className="text-red-600/70 font-medium">Identify students who haven't progressed in 3+ days</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {atRiskStudents.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-black text-[#0a192f] mb-2">Everything's on track!</h3>
                      <p className="text-[#5a7a9a]">No students are currently marked as at-risk.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {atRiskStudents.map((student) => (
                        <motion.div
                          key={student.id}
                          className="group p-6 rounded-[24px] border border-red-100 bg-white hover:bg-red-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 text-xl font-black">
                              {student.name[0]}
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-[#0a192f]">{student.name}</h4>
                              <p className="text-sm text-[#5a7a9a] font-medium">{student.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 max-w-xl">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#5a7a9a] mb-1">Stuck On</p>
                              <p className="font-bold text-[#0a192f]">{student.currentSection}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#5a7a9a] mb-1">Days Inactive</p>
                              <p className="font-bold text-red-600">{student.daysStuck} days</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#5a7a9a] mb-1">Grade Level</p>
                              <p className="font-bold text-[#0a192f]">{student.grade || 'N/A'}</p>
                            </div>
                          </div>

                          <Button 
                            className="rounded-xl h-12 px-6 font-bold bg-[#0a192f] text-white shadow-lg shadow-black/10 group-hover:scale-105 transition-transform"
                            onClick={() => window.location.href = `mailto:${student.email}?subject=Follow Up: Your Assessment Progress`}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Reach Out
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage-admins">
              <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-[#0a192f]">Internal Team</CardTitle>
                      <CardDescription>Manage staff access to your agency dashboard</CardDescription>
                    </div>
                    <Button
                      className="rounded-2xl h-12 px-6 font-black"
                      onClick={() => setShowAdminInviteDialog(true)}
                      style={{ backgroundColor: primaryColor }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {admins.map((teamMember) => (
                      <div key={teamMember.id} className="flex items-center justify-between p-6 bg-[#faf8f3] rounded-[24px] border border-[#e5e0d5]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1e3a5f] font-black shadow-sm">
                            {teamMember.first_name?.[0] || teamMember.email[0]}
                          </div>
                          <div>
                            <p className="font-black text-[#0a192f]">{teamMember.first_name} {teamMember.last_name}</p>
                            <p className="text-sm text-[#5a7a9a] font-medium">{teamMember.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="rounded-lg bg-white border-[#e5e0d5] text-[#1e3a5f] font-bold uppercase text-[10px] tracking-widest px-3 py-1">
                            {teamMember.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changelog">
              <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm p-8">
                <div className="max-w-3xl mx-auto space-y-12 py-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-amber-50 flex items-center justify-center">
                      <History className="w-8 h-8 text-[#c9a227]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-[#0a192f]">Platform Evolution</h2>
                      <p className="text-[#5a7a9a]">Tracking every milestone for your agency dashboard.</p>
                    </div>
                  </div>

                  <div className="relative pl-10 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-[#faf8f3] before:rounded-full">
                    <div className="relative">
                      <div className="absolute left-[-29px] top-1.5 w-5 h-5 rounded-full bg-[#c9a227] border-4 border-white shadow-sm" />
                      <div className="bg-[#faf8f3] p-6 rounded-[28px] border border-[#e5e0d5]">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#c9a227] text-white">v2.2.0</Badge>
                          <span className="text-xs font-bold text-[#c9a227] uppercase tracking-widest">Feb 14, 2026</span>
                        </div>
                        <h4 className="text-xl font-black text-[#0a192f] mb-4">Production Readiness & Polish</h4>
                        <ul className="space-y-3 text-sm text-[#5a7a9a] font-medium">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Comprehensive platform cleanup and production hardening
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Streamlined dashboard with refined navigation
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Improved error handling and validation
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[-29px] top-1.5 w-5 h-5 rounded-full bg-[#e5e0d5] border-4 border-white shadow-sm" />
                      <div className="bg-[#faf8f3] p-6 rounded-[28px] border border-[#e5e0d5]">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#1e3a5f] text-white">v2.1.0</Badge>
                          <span className="text-xs font-bold text-[#c9a227] uppercase tracking-widest">Jan 05, 2026</span>
                        </div>
                        <h4 className="text-xl font-black text-[#0a192f] mb-4">Agency White-labeling Launch</h4>
                        <ul className="space-y-3 text-sm text-[#5a7a9a] font-medium">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Custom primary and secondary color themes
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Agency logo integration across all student touchpoints
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                            Partner-specific coupon code management
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audit-logs">
              <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-black text-[#0a192f]">Audit Logs</CardTitle>
                  <CardDescription>Security trail of all administrative actions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[#faf8f3]">
                      <TableRow className="border-[#e5e0d5]">
                        <TableHead className="px-8 font-bold text-[#0a192f]">Action</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Admin</TableHead>
                        <TableHead className="font-bold text-[#0a192f]">Details</TableHead>
                        <TableHead className="px-8 text-right font-bold text-[#0a192f]">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center text-[#5a7a9a]">
                            No security events logged yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        auditLogs.map((log) => (
                          <TableRow key={log.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50 transition-colors">
                            <TableCell className="px-8 py-4">
                              <Badge variant="outline" className="font-bold uppercase text-[10px] tracking-widest">{log.action}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-[#0a192f] text-sm">{log.actor_email}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-[#5a7a9a] font-medium">{JSON.stringify(log.metadata).slice(0, 50)}...</span>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                              <span className="text-xs text-[#5a7a9a] font-bold uppercase">{new Date(log.created_at).toLocaleString()}</span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </motion.div>
      </main>

      {/* Dialogs */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#0a192f]">Invite Student</DialogTitle>
            <DialogDescription className="text-lg font-medium">Send a branded assessment invitation to a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="font-bold text-[#0a192f]">Student Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="student@example.com"
                className="h-14 rounded-2xl border-[#e5e0d5] bg-[#faf8f3] text-lg px-6"
              />
            </div>
            <Button
              onClick={handleInviteStudent}
              disabled={isInviting || !inviteEmail}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Branded Invitation
            </Button>
            <p className="text-center text-xs text-[#5a7a9a] font-medium leading-relaxed">
              This will send a white-labeled email with your agency's logo and colors.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminInviteDialog} onOpenChange={setShowAdminInviteDialog}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#0a192f]">Invite Team Member</DialogTitle>
            <DialogDescription className="text-lg font-medium">Add a new admin to your agency dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="font-bold text-[#0a192f]">Email</Label>
              <Input
                type="email"
                value={adminInvite.email}
                onChange={(e) => setAdminInvite({ ...adminInvite, email: e.target.value })}
                placeholder="admin@example.com"
                className="h-14 rounded-2xl border-[#e5e0d5] bg-[#faf8f3] text-lg px-6"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-[#0a192f]">Full Name (optional)</Label>
              <Input
                value={adminInvite.fullName}
                onChange={(e) => setAdminInvite({ ...adminInvite, fullName: e.target.value })}
                placeholder="Jane Smith"
                className="h-14 rounded-2xl border-[#e5e0d5] bg-[#faf8f3] text-lg px-6"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-[#0a192f]">Role</Label>
              <Select value={adminInvite.role} onValueChange={(v) => setAdminInvite({ ...adminInvite, role: v })}>
                <SelectTrigger className="h-14 rounded-2xl border-[#e5e0d5] bg-[#faf8f3] text-lg px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInviteAdmin}
              disabled={isInvitingAdmin || !adminInvite.email}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {isInvitingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
            <p className="text-center text-xs text-[#5a7a9a] font-medium leading-relaxed">
              They will receive an email with temporary login credentials.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent className="sm:max-w-lg rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#0a192f]">Create Coupon</DialogTitle>
            <DialogDescription className="text-lg font-medium">Configure a new discount code for your students</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="font-bold">Code</Label>
                <Input
                  placeholder="SAVE50"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold">Max Uses</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={newCoupon.max_uses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="font-bold">Discount Type</Label>
              <Select value={newCoupon.discount_type} onValueChange={(v) => setNewCoupon({ ...newCoupon, discount_type: v })}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">100% OFF (Free Assessment)</SelectItem>
                  <SelectItem value="percentage">Percentage OFF</SelectItem>
                  <SelectItem value="fixed">Fixed Amount OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newCoupon.discount_type !== 'free' && (
              <div className="space-y-3">
                <Label className="font-bold">Value ({newCoupon.discount_type === 'percentage' ? '%' : '$'})</Label>
                <Input
                  type="number"
                  value={newCoupon.discount_value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            <Button
              onClick={handleCreateCoupon}
              disabled={isCreatingCoupon || !newCoupon.code}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {isCreatingCoupon ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ticket className="w-4 h-4 mr-2" />}
              Create Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#0a192f]">Security</DialogTitle>
            <DialogDescription className="text-lg font-medium">Update your account password</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="font-bold">Current Password</Label>
              <Input
                type="password"
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-bold">New Password</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                placeholder="••••••••"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-bold">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordChange.newPassword}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
