"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
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
  Building2,
  Users,
  Ticket,
  DollarSign,
  Plus,
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
  Calendar,
  Target,
  Award,
  ChevronRight,
  RefreshCw,
  Filter,
  FileText,
  ArrowUpRight,
  PieChart,
  KeyRound,
  Shield,
  Trash2,
  Sparkles,
  History,
  Settings,
  ShieldCheck,
  Globe,
  CreditCard,
  Zap,
  Crown,
  LayoutDashboard,
  Activity,
  Package,
  Pencil,
  Play,
  ExternalLink,
  UserPlus,
  ClipboardList,
  Link2,
  ChevronLeft,
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
import { SECTION_TITLES } from "@/lib/assessment-types"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface Admin {
  id: string
  email: string
  fullName: string
  role: string
  organization_id: string
}

interface Organization {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  billing_email: string | null
  subscription_status: string
  plan_type: string
  max_students: number
  max_admins: number
  assessment_price: number
  plan_price: number | null
  billing_type: 'subscription' | 'one_time'
  settings: Record<string, any>
  created_at: string
  trial_ends_at?: string | null
  student_count?: number
  admin_count?: number
}

const changelogData = [
  {
    version: "2.2.0",
    date: "Feb 14, 2026",
    title: "Production Readiness & Polish",
    changes: [
      "Comprehensive platform cleanup and production hardening",
      "Improved error handling and validation across all endpoints",
      "Enhanced super admin dashboard with refined UI",
      "Streamlined agency dashboard by removing incomplete features",
    ],
    type: "major"
  },
  {
    version: "2.1.0",
    date: "Jan 05, 2026",
    title: "Agency White-labeling Launch",
    changes: [
      "Custom primary and secondary color themes for agencies",
      "Agency logo integration across all student touchpoints",
      "Partner-specific coupon code management",
      "Custom domain support with DNS verification",
    ],
    type: "feature"
  },
  {
    version: "2.0.0",
    date: "Dec 30, 2025",
    title: "B2B Platform Launch",
    changes: [
      "Transformed platform to B2B agency management system",
      "New Super Admin dashboard for managing agencies",
      "Agency license management and white-label configuration",
      "Role-based dashboard routing (Super Admin vs Agency Admin)",
    ],
    type: "major"
  },
  {
    version: "1.6.0",
    date: "Dec 20, 2025",
    title: "CMS & Security Overhaul",
    changes: [
      "Launched full Content Management System (CMS) for landing page content",
      "Strictly restricted CMS access to Super Admin roles for enhanced security",
      "Implemented comprehensive audit logging for all CMS actions",
    ],
    type: "feature"
  },
]

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [newOrg, setNewOrg] = useState({
    name: "",
    slug: "",
    billingEmail: "",
    planType: "starter",
    maxStudents: "100",
    maxAdmins: "5",
    planPrice: "99",
    trialDays: "14",
    billingType: "subscription",
  })
    const [showEditOrgDialog, setShowEditOrgDialog] = useState(false)
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
    const [invoicingOrg, setInvoicingOrg] = useState<Organization | null>(null)
    const [invoiceData, setInvoiceData] = useState({
      amount: "499",
      description: "10 Additional Student Licenses",
      quantity: "1"
    })
    const [isSendingInvoice, setIsSendingInvoice] = useState(false)
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false)
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [platformStatus, setPlatformStatus] = useState<{
    status: string;
    message: string;
    issues?: Array<{
      type: string;
      severity: string;
      agency: string;
      message: string;
    }>;
    services?: {
      database: string;
      email: string;
    };
    timestamp?: string;
  }>({
    status: "loading",
    message: "Checking platform status..."
  })
  const [isDeletingOrg, setIsDeletingOrg] = useState<string | null>(null)
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)
  const [showDemoDialog, setShowDemoDialog] = useState(false)
  const [demoOrgId, setDemoOrgId] = useState<string>("")
  const [demoType, setDemoType] = useState<string>("healthcare")

  // Co-Super Admin management
  const [superAdmins, setSuperAdmins] = useState<Array<{
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    role: string
    is_active: boolean
    created_at: string
  }>>([])
  const [showInviteSuperAdminDialog, setShowInviteSuperAdminDialog] = useState(false)
  const [isInvitingSuperAdmin, setIsInvitingSuperAdmin] = useState(false)
  const [superAdminInvite, setSuperAdminInvite] = useState({ email: "", fullName: "" })
  const [isDeletingSuperAdmin, setIsDeletingSuperAdmin] = useState<string | null>(null)

  // All Students tab state
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null)

  // Coupons tab state
  const [coupons, setCoupons] = useState<any[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    maxUses: "",
    expiresAt: "",
    organization: "",
    notes: "",
    discountType: "free",
    discountValue: ""
  })

  // Analytics/Demographics state
  const [demographics, setDemographics] = useState<{ locations: any[]; genders: any[]; countries: any[] } | null>(null)

  // Referrals tab state
  const [referralTiers, setReferralTiers] = useState<any[]>([])
  const [referralPartners, setReferralPartners] = useState<any[]>([])
  const [referralStats, setReferralStats] = useState({ totalActivePartners: 0, totalStudents: 0, totalCompleted: 0, totalRevenue: 0 })
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [showAddTierForm, setShowAddTierForm] = useState(false)
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false)
  const [isCreatingTier, setIsCreatingTier] = useState(false)
  const [isCreatingPartner, setIsCreatingPartner] = useState(false)
  const [newTier, setNewTier] = useState({ label: "", discount_percent: "" })
  const [newPartner, setNewPartner] = useState({ name: "", email: "", organization: "", referral_code: "" })

  const isSuperAdmin = admin?.role === 'super_admin'

  useEffect(() => {
    checkAuth()
    fetchPlatformStatus()
    const interval = setInterval(fetchPlatformStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchPlatformStatus = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setPlatformStatus({
        status: data.status || (response.ok ? "up" : "down"),
        message: data.message || (response.ok ? "All systems operational" : "Platform issues detected"),
        issues: data.issues,
        services: data.services,
        timestamp: data.timestamp,
      })
    } catch {
      setPlatformStatus({ status: "down", message: "Connectivity issue — unable to reach health endpoint" })
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/me")
      const data = await response.json()

      if (data.admin) {
        setAdmin(data.admin)
        if (data.admin.role !== 'super_admin') {
          router.push("/agency")
          return
        }
        fetchData()
        fetchAnalytics()
      } else {
        router.push("/admin/login")
      }
    } catch {
      router.push("/admin/login")
    }
  }

  const fetchSuperAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage-admins")
      const data = await response.json()
      if (data.success && data.admins) {
        setSuperAdmins(data.admins.filter((a: any) => a.role === "super_admin"))
      }
    } catch (error) {
      console.error("Error fetching super admins:", error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const orgsRes = await fetch("/api/admin/organizations")
      const orgsData = await orgsRes.json()

      if (Array.isArray(orgsData.organizations)) setOrganizations(orgsData.organizations)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
    // Also fetch super admins in parallel
    fetchSuperAdmins()
  }

  const fetchAnalytics = async () => {
    try {
      const [assessRes, demoRes, couponsRes] = await Promise.all([
        fetch("/api/admin/assessments?limit=100&include_demos=false"),
        fetch("/api/admin/demographics"),
        fetch("/api/admin/coupons"),
      ])
      const assessData = await assessRes.json()
      const demoData = await demoRes.json()
      const couponsData = await couponsRes.json()
      if (Array.isArray(assessData.assessments) && allStudents.length === 0) setAllStudents(assessData.assessments)
      if (demoData.data) setDemographics(demoData.data)
      if (Array.isArray(couponsData.coupons) && coupons.length === 0) setCoupons(couponsData.coupons)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchAllStudents = async () => {
    setStudentsLoading(true)
    try {
      const response = await fetch("/api/admin/assessments?limit=100&include_demos=true")
      const data = await response.json()
      if (Array.isArray(data.assessments)) setAllStudents(data.assessments)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const res = await fetch("/api/admin/delete-assessment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      })
      if (res.ok) {
        setAllStudents(prev => prev.filter(a => a.id !== assessmentId))
        toast.success("Assessment deleted")
      } else {
        toast.error("Failed to delete assessment")
      }
    } catch {
      toast.error("Failed to delete assessment")
    } finally {
      setDeletingAssessmentId(null)
    }
  }

  const fetchCoupons = async () => {
    setCouponsLoading(true)
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      if (Array.isArray(data.coupons)) setCoupons(data.coupons)
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setCouponsLoading(false)
    }
  }

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error("Coupon code is required")
      return
    }
    setIsCreatingCoupon(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCoupon.code,
          discount_type: newCoupon.discountType,
          discount_value: newCoupon.discountType === "free" ? 100 : parseFloat(newCoupon.discountValue) || 0,
          max_uses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
          valid_until: newCoupon.expiresAt || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Coupon created successfully")
        setShowCouponDialog(false)
        setNewCoupon({ code: "", description: "", maxUses: "", expiresAt: "", organization: "", notes: "", discountType: "free", discountValue: "" })
        fetchCoupons()
      } else {
        toast.error(data.error || "Failed to create coupon")
      }
    } catch {
      toast.error("Failed to create coupon")
    } finally {
      setIsCreatingCoupon(false)
    }
  }

  const toggleCouponStatus = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: isActive }),
      })
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c))
    } catch {
      toast.error("Failed to update coupon")
    }
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCoupon(prev => ({ ...prev, code }))
  }

  useEffect(() => {
    if (activeTab === "all-students" && allStudents.length === 0) fetchAllStudents()
    if (activeTab === "coupons" && coupons.length === 0) fetchCoupons()
    if (activeTab === "referrals" && referralTiers.length === 0 && referralPartners.length === 0) fetchReferralData()
  }, [activeTab])

  const fetchReferralData = async () => {
    setReferralsLoading(true)
    try {
      const [tiersRes, partnersRes] = await Promise.all([
        fetch("/api/admin/referral-tiers"),
        fetch("/api/admin/referral-partners"),
      ])
      const tiersData = await tiersRes.json()
      const partnersData = await partnersRes.json()
      if (Array.isArray(tiersData.tiers)) setReferralTiers(tiersData.tiers)
      if (Array.isArray(partnersData.partners)) setReferralPartners(partnersData.partners)
      if (partnersData.stats) setReferralStats(partnersData.stats)
    } catch (error) {
      console.error("Error fetching referral data:", error)
    } finally {
      setReferralsLoading(false)
    }
  }

  const handleCreateTier = async () => {
    if (!newTier.label || !newTier.discount_percent) { toast.error("Label and discount % required"); return }
    setIsCreatingTier(true)
    try {
      const res = await fetch("/api/admin/referral-tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newTier.label.toUpperCase(), discount_percent: parseInt(newTier.discount_percent) }),
      })
      if (res.ok) {
        toast.success("Tier created")
        setNewTier({ label: "", discount_percent: "" })
        setShowAddTierForm(false)
        fetchReferralData()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to create tier")
      }
    } catch { toast.error("Failed to create tier") }
    finally { setIsCreatingTier(false) }
  }

  const handleToggleTierActive = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/referral-tiers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: isActive }),
      })
      setReferralTiers(prev => prev.map(t => t.id === id ? { ...t, is_active: isActive } : t))
    } catch { toast.error("Failed to update tier") }
  }

  const handleDeleteTier = async (id: string) => {
    try {
      const res = await fetch("/api/admin/referral-tiers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setReferralTiers(prev => prev.filter(t => t.id !== id))
        toast.success("Tier deleted")
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to delete tier")
      }
    } catch { toast.error("Failed to delete tier") }
  }

  const handleCreatePartner = async () => {
    if (!newPartner.name || !newPartner.email) { toast.error("Name and email required"); return }
    setIsCreatingPartner(true)
    try {
      const res = await fetch("/api/admin/referral-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartner.name,
          email: newPartner.email,
          organization: newPartner.organization || null,
          discount_tier_id: referralTiers.length > 0 ? referralTiers[0].id : null,
          referral_code: newPartner.referral_code || undefined,
        }),
      })
      if (res.ok) {
        toast.success("Partner created")
        setNewPartner({ name: "", email: "", organization: "", referral_code: "" })
        setShowAddPartnerForm(false)
        fetchReferralData()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to create partner")
      }
    } catch { toast.error("Failed to create partner") }
    finally { setIsCreatingPartner(false) }
  }

  const handleDeletePartner = async (id: string) => {
    try {
      const res = await fetch("/api/admin/referral-partners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setReferralPartners(prev => prev.filter(p => p.id !== id))
        toast.success("Partner deleted")
      } else { toast.error("Failed to delete partner") }
    } catch { toast.error("Failed to delete partner") }
  }

  const handleToggleResultsAccess = async (id: string, canView: boolean) => {
    try {
      await fetch("/api/admin/referral-partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, can_view_results: canView }),
      })
      setReferralPartners(prev => prev.map(p => p.id === id ? { ...p, can_view_results: canView } : p))
    } catch { toast.error("Failed to update") }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      toast.success("Logged out successfully")
      router.push("/admin/login")
    } catch {
      toast.error("Failed to logout")
    }
  }

  const handleChangePassword = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordChange.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Password changed successfully!")
        setShowPasswordDialog(false)
        setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCreateOrganization = async () => {
    if (!newOrg.name.trim() || !newOrg.slug.trim()) {
      toast.error("Organization name and slug are required")
      return
    }

    setIsCreatingOrg(true)
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrg.name,
          slug: newOrg.slug.toLowerCase().replace(/\s+/g, '-'),
          billingEmail: newOrg.billingEmail,
          planType: newOrg.planType,
          maxStudents: parseInt(newOrg.maxStudents),
          maxAdmins: parseInt(newOrg.maxAdmins),
          planPrice: parseFloat(newOrg.planPrice),
          trialDays: parseInt(newOrg.trialDays) || 14,
          billingType: newOrg.billingType,
        }),
      })

      const data = await response.json()

      if (data.success) {
          toast.success(`Agency created! Welcome email sent to ${newOrg.billingEmail}`)
          setShowCreateOrgDialog(false)
          setNewOrg({ name: "", slug: "", billingEmail: "", planType: "starter", maxStudents: "100", maxAdmins: "5", planPrice: "99", trialDays: "14", billingType: "subscription" })
          fetchData()
        } else {
        toast.error(data.error || "Failed to create organization")
      }
    } catch {
      toast.error("Failed to create organization")
    } finally {
      setIsCreatingOrg(false)
    }
  }

  const toggleOrgStatus = async (orgId: string, currentStatus: string) => {
    // Only toggle between active and suspended — preserve other statuses like 'trial'
    if (currentStatus !== 'active' && currentStatus !== 'suspended') {
      toast.error(`Cannot toggle status while organization is on "${currentStatus}"`)
      return
    }
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orgId, subscription_status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Organization ${newStatus === 'active' ? 'activated' : 'suspended'}`)
        fetchData()
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || "Failed to update organization status")
      }
    } catch {
      toast.error("Failed to update organization")
    }
  }

  const handleDeleteOrganization = async (orgId: string) => {
    setIsDeletingOrg(orgId)
    try {
      const response = await fetch(`/api/admin/organizations?id=${orgId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Organization deleted successfully")
        fetchData()
      } else {
        toast.error(data.error || "Failed to delete organization")
      }
    } catch {
      toast.error("Failed to delete organization")
    } finally {
      setIsDeletingOrg(null)
    }
  }

  const handleImpersonateOrg = async (orgId: string, orgName: string) => {
    try {
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Now viewing as ${orgName}`)
        router.push("/agency")
      } else {
        toast.error(data.error || "Failed to impersonate")
      }
    } catch {
      toast.error("Failed to impersonate organization")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

    const handleEditOrg = (org: Organization) => {
      setEditingOrg(org)
      setShowEditOrgDialog(true)
    }

    const handleSendInvoice = async () => {
      if (!invoicingOrg) return

      setIsSendingInvoice(true)
      try {
        const response = await fetch(`/api/admin/organizations/${invoicingOrg.id}/invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(invoiceData.amount),
            description: invoiceData.description,
            quantity: parseInt(invoiceData.quantity)
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.success(`Invoice sent! URL: ${data.invoiceUrl}`)
          setShowInvoiceDialog(false)
          setInvoicingOrg(null)
        } else {
          toast.error(data.error || "Failed to send invoice")
        }
      } catch {
        toast.error("Failed to send invoice")
      } finally {
        setIsSendingInvoice(false)
      }
    }


  const handleUpdateOrg = async () => {
    if (!editingOrg) return

    setIsUpdatingOrg(true)
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingOrg.id,
          name: editingOrg.name,
          slug: editingOrg.slug,
          billing_email: editingOrg.billing_email,
          plan_type: editingOrg.plan_type,
          max_students: editingOrg.max_students,
          max_admins: editingOrg.max_admins,
          plan_price: editingOrg.plan_price,
          subscription_status: editingOrg.subscription_status,
          billing_type: editingOrg.billing_type,
        }),
      })

      const data = await response.json()

      if (data.success || response.ok) {
        toast.success("Organization updated successfully")
        setShowEditOrgDialog(false)
        setEditingOrg(null)
        fetchData()
      } else {
        toast.error(data.error || "Failed to update organization")
      }
    } catch {
      toast.error("Failed to update organization")
    } finally {
      setIsUpdatingOrg(false)
    }
  }

  const handleExtendTrial = async (orgId: string, days: number) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/extend-trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, reason: "Manual extension via dashboard" }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchData()
      } else {
        toast.error(data.error || "Failed to extend trial")
      }
    } catch {
      toast.error("Failed to extend trial")
    }
  }

  const handleCreateDemo = async () => {
    setIsCreatingDemo(true)
    try {
      const response = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: demoOrgId || undefined, demoType }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Demo created successfully!")
        setShowDemoDialog(false)
        // Open results page in new tab
        window.open(data.resultsUrl, "_blank")
      } else {
        toast.error(data.error || "Failed to create demo")
      }
    } catch {
      toast.error("Failed to create demo")
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const handleInviteSuperAdmin = async () => {
    if (!superAdminInvite.email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsInvitingSuperAdmin(true)
    try {
      const response = await fetch("/api/admin/invite-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: superAdminInvite.email,
          fullName: superAdminInvite.fullName || undefined,
          role: "super_admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Co-Super Admin invitation sent to ${superAdminInvite.email}`)
        setShowInviteSuperAdminDialog(false)
        setSuperAdminInvite({ email: "", fullName: "" })
        fetchSuperAdmins()
      } else {
        toast.error(data.error || "Failed to invite co-super admin")
      }
    } catch {
      toast.error("Failed to invite co-super admin")
    } finally {
      setIsInvitingSuperAdmin(false)
    }
  }

  const handleDeleteSuperAdmin = async (adminId: string) => {
    setIsDeletingSuperAdmin(adminId)
    try {
      const response = await fetch(`/api/admin/manage-admins?id=${adminId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Co-Super Admin removed")
        fetchSuperAdmins()
      } else {
        toast.error(data.error || "Failed to remove admin")
      }
    } catch {
      toast.error("Failed to remove admin")
    } finally {
      setIsDeletingSuperAdmin(null)
    }
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalOrganizations: organizations.filter(o => !o.settings?.platformOwner).length,
    activeOrganizations: organizations.filter(o => o.subscription_status === 'active' && !o.settings?.platformOwner).length,
    totalStudents: organizations.reduce((sum, o) => sum + (o.student_count || 0), 0),
    totalRevenue: organizations.filter(o => !o.settings?.platformOwner).reduce((sum, o) => sum + (o.plan_price || 0), 0),
  }

  const planDistribution = organizations.filter(o => !o.settings?.platformOwner).reduce((acc, org) => {
    acc[org.plan_type] = (acc[org.plan_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const planChartData = Object.entries(planDistribution).map(([name, value]) => ({ name, value }))
  const COLORS = ['#c9a227', '#1e3a5f', '#5a7a9a', '#10b981', '#8b5cf6']

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <nav className="bg-[#0a192f] text-white sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="The Student Blueprint Logo" width={42} height={42} className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                The Student Blueprint
              </span>
            </Link>
            <Badge className="bg-[#c9a227] text-[#0a192f] border-0 rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Platform Owner
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-sm hidden lg:block font-bold text-white tracking-wide">
                  {admin.fullName || admin.email}
                </span>
                <Badge className="bg-[#c9a227] text-[#0a192f] hover:bg-[#b8921f] border-0 rounded-full px-3 py-0 h-5 text-[10px] font-black uppercase tracking-wider">
                  Super Admin
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group outline-none">
                    <div className="w-10 h-10 rounded-full border-2 border-[#c9a227]/50 flex items-center justify-center bg-[#faf8f3] transition-all duration-300 group-hover:border-[#c9a227] group-hover:scale-105 shadow-lg">
                      <span className="text-[#0a192f] font-bold text-lg uppercase">
                        {(admin.fullName || admin.email || "A")[0]}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a192f] rounded-full" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-white border-[#e5e0d5] shadow-2xl rounded-xl p-2">
                  <DropdownMenuLabel className="font-display text-[#1e3a5f] px-2 py-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#c9a227] mb-1">Account</p>
                    <p className="text-sm truncate">{admin.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#e5e0d5]" />
                  <DropdownMenuItem
                    onClick={() => setShowPasswordDialog(true)}
                    className="flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-lg hover:bg-[#faf8f3] text-[#1e3a5f] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("changelog")}
                    className="flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-lg hover:bg-[#faf8f3] text-[#1e3a5f] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#c9a227]">
                      <History className="w-4 h-4" />
                    </div>
                    <span className="font-medium">What's New?</span>
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

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0a192f] flex items-center gap-3" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                <LayoutDashboard className="w-8 h-8 text-[#c9a227]" />
                Platform Command Center
              </h1>
              <p className="text-[#5a7a9a]">Manage agencies, licenses, and platform operations</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-[#e5e0d5]" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agency
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Agency</DialogTitle>
                    <DialogDescription>
                      Set up a new agency with white-label access
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Agency Name *</Label>
                        <Input
                          placeholder="Elite Prep Academy"
                          value={newOrg.name}
                          onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Slug *</Label>
                        <Input
                          placeholder="elite-prep"
                          value={newOrg.slug}
                          onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Email *</Label>
                      <Input
                        type="email"
                        placeholder="admin@agency.com"
                        value={newOrg.billingEmail}
                        onChange={(e) => setNewOrg({ ...newOrg, billingEmail: e.target.value })}
                      />
                      <p className="text-xs text-[#5a7a9a]">This email will receive a welcome email to set up their password</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Plan Type</Label>
                      <Select value={newOrg.planType} onValueChange={(v) => setNewOrg({ ...newOrg, planType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter (Up to 100 students)</SelectItem>
                          <SelectItem value="professional">Professional (Up to 500 students)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Type</Label>
                      <Select value={newOrg.billingType} onValueChange={(v) => setNewOrg({ ...newOrg, billingType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subscription">Subscription (Monthly)</SelectItem>
                          <SelectItem value="one_time">One-Time License</SelectItem>
                        </SelectContent>
                      </Select>
                      {newOrg.billingType === 'one_time' && (
                        <p className="text-xs text-amber-600">One-time orgs are set to Active immediately. Use &quot;Send Invoice&quot; to collect payment.</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Max Students</Label>
                        <Input
                          type="number"
                          value={newOrg.maxStudents}
                          onChange={(e) => setNewOrg({ ...newOrg, maxStudents: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Admins</Label>
                        <Input
                          type="number"
                          value={newOrg.maxAdmins}
                          onChange={(e) => setNewOrg({ ...newOrg, maxAdmins: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{newOrg.billingType === 'one_time' ? 'License Price ($)' : 'Plan Price ($/mo)'}</Label>
                        <Input
                          type="number"
                          value={newOrg.planPrice}
                          onChange={(e) => setNewOrg({ ...newOrg, planPrice: e.target.value })}
                        />
                      </div>
                    </div>
                    {newOrg.billingType !== 'one_time' && <div className="space-y-2">
                      <Label>Trial Period (Days)</Label>
                      <Input
                        type="number"
                        value={newOrg.trialDays}
                        onChange={(e) => setNewOrg({ ...newOrg, trialDays: e.target.value })}
                        placeholder="14"
                      />
                      <p className="text-xs text-[#5a7a9a]">Number of days before trial expires (default 14)</p>
                    </div>}
                    <Button
                      onClick={handleCreateOrganization}
                      disabled={isCreatingOrg || !newOrg.name || !newOrg.slug || !newOrg.billingEmail}
                      className="w-full bg-[#0a192f] hover:bg-[#152a45]"
                    >
                      {isCreatingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Agency & Send Invite
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="!flex !flex-row gap-4">
            {/* Sidebar */}
            <TabsList className="!flex !flex-col !w-48 !h-auto items-stretch gap-1 bg-white border border-[#e5e0d5] p-2 rounded-2xl shadow-sm shrink-0 sticky top-24 self-start">
              <TabsTrigger value="overview" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="agencies" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <Building2 className="w-4 h-4 mr-2" />
                Agencies
              </TabsTrigger>
              <TabsTrigger value="all-students" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                All Students
              </TabsTrigger>
              <TabsTrigger value="coupons" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <Ticket className="w-4 h-4 mr-2" />
                Coupons
              </TabsTrigger>
              <TabsTrigger value="referrals" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="questions" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <ClipboardList className="w-4 h-4 mr-2" />
                Form Questions
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="changelog" className="rounded-xl px-4 py-2.5 font-bold text-sm !flex-none justify-start data-[state=active]:bg-[#0a192f] data-[state=active]:text-white">
                <History className="w-4 h-4 mr-2" />
                Changelog
              </TabsTrigger>
            </TabsList>

            {/* Content */}
            <div className="flex-1 min-w-0">

            <TabsContent value="overview">
              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-[#0a192f] to-[#1e3a5f] rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#c9a227] rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#0a192f]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Quick Actions</h3>
                    <p className="text-white/60 text-xs">Platform management shortcuts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowDemoDialog(true)}
                    className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f] font-bold text-xs uppercase tracking-wider gap-2 h-9"
                  >
                    <Play className="w-4 h-4" />
                    Start Demo
                  </Button>
                  <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider gap-2 h-9 border border-white/20">
                        <Plus className="w-4 h-4" />
                        New Agency
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="border-[#e5e0d5] hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1 text-[#5a7a9a]">Agencies</p>
                        <p className="text-3xl font-bold text-[#0a192f]">{stats.totalOrganizations}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {stats.activeOrganizations} active
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                        <Building2 className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-amber-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1 text-[#5a7a9a]">Total Students</p>
                        <p className="text-3xl font-bold text-[#0a192f]">{stats.totalStudents}</p>
                        <p className="text-xs text-[#5a7a9a]">across all agencies</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                        <Users className="w-7 h-7 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-green-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1 text-[#5a7a9a]">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-[#0a192f]">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-[#5a7a9a]">from plan subscriptions</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                        <DollarSign className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5] hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-purple-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1 text-[#5a7a9a]">Avg. Students</p>
                        <p className="text-3xl font-bold text-[#0a192f]">{stats.totalOrganizations > 0 ? Math.round(stats.totalStudents / stats.totalOrganizations) : 0}</p>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          per agency
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                        <Activity className="w-7 h-7 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Plan Distribution</CardTitle>
                    <CardDescription>Agency subscription tiers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      {planChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={planChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {planChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#5a7a9a]">
                          No agency data yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#0a192f] text-lg">Recent Agencies</CardTitle>
                        <CardDescription>Latest agency onboardings</CardDescription>
                      </div>
                      <Button variant="ghost" onClick={() => setActiveTab("agencies")} className="text-[#c9a227]">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {organizations
                        .filter(o => !o.settings?.platformOwner)
                        .slice(0, 5)
                        .map((org) => (
                          <div key={org.id} className="flex items-center justify-between p-3 bg-[#faf8f3] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#0a192f] flex items-center justify-center text-white font-bold">
                                {org.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-[#0a192f]">{org.name}</p>
                                <p className="text-xs text-[#5a7a9a]">{org.slug}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-[#c9a227] text-[#c9a227]">
                              {org.plan_type}
                            </Badge>
                          </div>
                        ))}
                      {organizations.filter(o => !o.settings?.platformOwner).length === 0 && (
                        <p className="text-center text-[#5a7a9a] py-8">No agencies yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#0a192f] text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#c9a227]" />
                      Platform Status
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {platformStatus.timestamp && (
                        <span className="text-xs text-[#5a7a9a]">
                          Last checked: {new Date(platformStatus.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                        onClick={fetchPlatformStatus}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {/* Overall Status Banner */}
                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                      platformStatus.status === 'up' ? 'bg-green-50 border-green-200' :
                      platformStatus.status === 'degraded' ? 'bg-amber-50 border-amber-200' :
                      platformStatus.status === 'loading' ? 'bg-gray-50 border-gray-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className={`w-4 h-4 rounded-full shrink-0 ${
                        platformStatus.status === 'up' ? 'bg-green-500' :
                        platformStatus.status === 'degraded' ? 'bg-amber-500' :
                        platformStatus.status === 'loading' ? 'bg-gray-400 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <span className={`font-bold text-sm ${
                          platformStatus.status === 'up' ? 'text-green-800' :
                          platformStatus.status === 'degraded' ? 'text-amber-800' :
                          platformStatus.status === 'loading' ? 'text-gray-600' :
                          'text-red-800'
                        }`}>
                          {platformStatus.message}
                        </span>
                        {platformStatus.issues && platformStatus.issues.length > 0 && (
                          <p className={`text-xs mt-0.5 ${
                            platformStatus.status === 'up' ? 'text-green-600' :
                            platformStatus.status === 'degraded' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {platformStatus.issues.filter(i => i.severity === 'high').length} critical, {platformStatus.issues.filter(i => i.severity === 'medium').length} warnings, {platformStatus.issues.filter(i => i.severity === 'low').length} info
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Service Health Checks */}
                    {platformStatus.services && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#5a7a9a] mb-3">Service Health</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "Database (Supabase)", key: "database" as const, icon: <Package className="w-4 h-4" /> },
                            { name: "Email (Resend)", key: "email" as const, icon: <Mail className="w-4 h-4" /> },
                          ].map((service) => {
                            const serviceStatus = platformStatus.services![service.key]
                            return (
                              <div key={service.key} className={`flex items-center gap-3 p-3 rounded-lg border ${
                                serviceStatus === 'up' ? 'bg-white border-green-200' :
                                serviceStatus === 'degraded' ? 'bg-amber-50 border-amber-200' :
                                serviceStatus === 'unknown' ? 'bg-gray-50 border-gray-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  serviceStatus === 'up' ? 'bg-green-100 text-green-600' :
                                  serviceStatus === 'degraded' ? 'bg-amber-100 text-amber-600' :
                                  serviceStatus === 'unknown' ? 'bg-gray-100 text-gray-500' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {service.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#0a192f] truncate">{service.name}</p>
                                  <p className={`text-xs font-bold uppercase tracking-wider ${
                                    serviceStatus === 'up' ? 'text-green-600' :
                                    serviceStatus === 'degraded' ? 'text-amber-600' :
                                    serviceStatus === 'unknown' ? 'text-gray-500' :
                                    'text-red-600'
                                  }`}>
                                    {serviceStatus === 'up' ? 'Operational' :
                                     serviceStatus === 'degraded' ? 'Degraded' :
                                     serviceStatus === 'unknown' ? 'Unknown' :
                                     'Down'}
                                  </p>
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  serviceStatus === 'up' ? 'bg-green-500' :
                                  serviceStatus === 'degraded' ? 'bg-amber-500' :
                                  serviceStatus === 'unknown' ? 'bg-gray-400' :
                                  'bg-red-500'
                                }`} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Active Issues */}
                    {platformStatus.issues && platformStatus.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#5a7a9a] mb-3">
                          Active Issues ({platformStatus.issues.length})
                        </p>
                        <div className="grid gap-2">
                          {platformStatus.issues
                            .sort((a, b) => {
                              const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
                              return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
                            })
                            .map((issue, idx) => (
                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${
                              issue.severity === 'high' ? 'bg-red-50 border-red-200' :
                              issue.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                              'bg-blue-50 border-blue-200'
                            }`}>
                              <div className={`mt-0.5 shrink-0 ${
                                issue.severity === 'high' ? 'text-red-500' :
                                issue.severity === 'medium' ? 'text-amber-500' :
                                'text-blue-500'
                              }`}>
                                {issue.severity === 'high' ? <XCircle className="w-4 h-4" /> :
                                 issue.severity === 'medium' ? <Clock className="w-4 h-4" /> :
                                 <Activity className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`text-[10px] font-bold uppercase tracking-wider h-5 border-0 ${
                                    issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                                    issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {issue.severity === 'high' ? 'Critical' : issue.severity === 'medium' ? 'Warning' : 'Info'}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] font-medium h-5 border-[#e5e0d5] text-[#5a7a9a]">
                                    {issue.type}
                                  </Badge>
                                </div>
                                <p className="text-sm font-bold text-[#0a192f] mt-1.5">{issue.agency}</p>
                                <p className="text-sm text-[#5a7a9a]">{issue.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Issues State */}
                    {platformStatus.status === 'up' && (!platformStatus.issues || platformStatus.issues.length === 0) && (
                      <div className="text-center py-4 text-[#5a7a9a]">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm font-medium">No active issues detected</p>
                        <p className="text-xs mt-1">All services are running normally</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Analytics Widgets ──────────────────────────────────────── */}
              <div className="grid lg:grid-cols-2 gap-6 mt-8">
                {/* Archetype Distribution */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Archetype Distribution</CardTitle>
                    <CardDescription>Student personality archetypes breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      {(() => {
                        const archetypeData = allStudents
                          .filter(a => a.student_archetype)
                          .reduce((acc: Record<string, number>, a) => {
                            const name = (a.student_archetype || '').length > 20
                              ? (a.student_archetype || '').slice(0, 18) + '...'
                              : a.student_archetype || ''
                            acc[name] = (acc[name] || 0) + 1
                            return acc
                          }, {})
                        const chartData = Object.entries(archetypeData)
                          .map(([name, value]) => ({ name, value }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 12)
                        return chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
                              <XAxis type="number" tick={{ fontSize: 11 }} />
                              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#c9a227" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[#5a7a9a] text-sm">No archetype data yet</div>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Distribution */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Grade Distribution</CardTitle>
                    <CardDescription>Students by grade level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      {(() => {
                        const gradeData = allStudents
                          .filter(a => a.student?.grade_level)
                          .reduce((acc: Record<string, number>, a) => {
                            const grade = a.student?.grade_level || 'Unknown'
                            acc[grade] = (acc[grade] || 0) + 1
                            return acc
                          }, {})
                        const chartData = Object.entries(gradeData).map(([name, value]) => ({ name, value }))
                        return chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie data={chartData} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={90} dataKey="value">
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[#5a7a9a] text-sm">No grade data yet</div>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing / Top Coupons / Recent Completions */}
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* Top Performing */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#0a192f] text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#c9a227]" />
                      Top Performing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allStudents
                        .filter(a => a.competitiveness_score)
                        .sort((a, b) => (b.competitiveness_score || 0) - (a.competitiveness_score || 0))
                        .slice(0, 5)
                        .map((a, i) => (
                          <div key={a.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#c9a227]">#{i + 1}</span>
                              <span className="text-sm text-[#0a192f] font-medium truncate max-w-[140px]">
                                {a.student?.full_name || `${a.student?.first_name || ''} ${a.student?.last_name || ''}`.trim() || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-[#0a192f]">{a.competitiveness_score}/100</span>
                          </div>
                        ))}
                      {allStudents.filter(a => a.competitiveness_score).length === 0 && (
                        <p className="text-sm text-[#5a7a9a] text-center py-4">No scores yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Coupons */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#0a192f] text-base flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#c9a227]" />
                      Top Coupons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coupons
                        .sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0))
                        .slice(0, 5)
                        .map((c) => (
                          <div key={c.id} className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold bg-[#0a192f] text-white px-2 py-0.5 rounded tracking-wider">{c.code}</span>
                              <p className="text-xs text-[#5a7a9a] mt-1">{c.description || c.organization || 'No org'}</p>
                            </div>
                            <span className="text-xs font-bold bg-[#faf8f3] border border-[#e5e0d5] px-2 py-1 rounded">{c.current_uses || 0} uses</span>
                          </div>
                        ))}
                      {coupons.length === 0 && (
                        <p className="text-sm text-[#5a7a9a] text-center py-4">No coupons yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Completions */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#0a192f] text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#c9a227]" />
                      Recent Completions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allStudents
                        .filter(a => a.status === 'completed')
                        .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
                        .slice(0, 5)
                        .map((a) => (
                          <div key={a.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-[#0a192f]">
                                {a.student?.full_name || `${a.student?.first_name || ''} ${a.student?.last_name || ''}`.trim() || 'Unknown'}
                              </p>
                              <p className="text-xs text-[#c9a227]">{a.student_archetype || 'No archetype'}</p>
                            </div>
                            <span className="text-xs text-[#5a7a9a]">
                              {new Date(a.completed_at || a.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      {allStudents.filter(a => a.status === 'completed').length === 0 && (
                        <p className="text-sm text-[#5a7a9a] text-center py-4">No completions yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gender / States / Countries */}
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* Gender Distribution */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Gender Distribution</CardTitle>
                    <CardDescription>Student gender breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      {demographics?.genders && demographics.genders.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={demographics.genders} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={70} dataKey="value">
                              {demographics.genders.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#5a7a9a] text-sm">No gender data yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top States */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Top States</CardTitle>
                    <CardDescription>Students by state (top 10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      {demographics?.locations && demographics.locations.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={demographics.locations.slice(0, 10)} layout="vertical" margin={{ left: 5, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0a192f" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#5a7a9a] text-sm">No state data yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Countries */}
                <Card className="border-[#e5e0d5]">
                  <CardHeader>
                    <CardTitle className="text-[#0a192f] text-lg">Top Countries</CardTitle>
                    <CardDescription>Students by country (top 10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      {demographics?.countries && demographics.countries.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={demographics.countries.slice(0, 10)} layout="vertical" margin={{ left: 5, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#c9a227" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#5a7a9a] text-sm">No country data yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            <TabsContent value="agencies">
              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-[#0a192f]">Agencies</CardTitle>
                      <CardDescription>Manage all white-label partner organizations</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                      <Input
                        placeholder="Search agencies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 border-[#e5e0d5]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#0a192f]" />
                    </div>
                  ) : filteredOrganizations.filter(o => !o.settings?.platformOwner).length === 0 ? (
                    <div className="text-center py-12 text-[#5a7a9a]">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No agencies found</p>
                      <Button className="mt-4 bg-[#c9a227]" onClick={() => setShowCreateOrgDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Agency
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agency</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Admins</TableHead>
                            <TableHead>Plan Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrganizations.filter(o => !o.settings?.platformOwner).map((org) => (
                            <TableRow key={org.id} className="hover:bg-[#faf8f3]">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#0a192f] flex items-center justify-center text-white font-bold">
                                    {org.name[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-[#0a192f]">{org.name}</p>
                                    <p className="text-xs text-[#5a7a9a]">/{org.slug}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`
                                  ${org.plan_type === 'enterprise' ? 'border-[#c9a227] text-[#c9a227]' : 
                                    org.plan_type === 'professional' ? 'border-blue-500 text-blue-500' : 
                                    'border-gray-400 text-gray-600'}
                                `}>
                                  {org.plan_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{org.student_count || 0}</span>
                                  <span className="text-[#5a7a9a]">/ {org.max_students}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{org.admin_count || 0}</span>
                                  <span className="text-[#5a7a9a]">/ {org.max_admins}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{org.plan_price != null ? `$${org.plan_price}${org.billing_type === 'one_time' ? '' : '/mo'}` : '—'}</TableCell>
                              <TableCell>
                                {org.subscription_status === 'active' ? (
                                  <Badge className="bg-green-100 text-green-700 border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : org.subscription_status === 'trial' ? (
                                  <div className="flex flex-col gap-1">
                                    <Badge className="bg-amber-100 text-amber-700 border-0">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Trial
                                    </Badge>
                                    {org.trial_ends_at && (
                                      <span className="text-xs text-[#5a7a9a]">
                                        Ends {new Date(org.trial_ends_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 border-0">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    {org.subscription_status === 'suspended' ? 'Suspended' : org.subscription_status}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-[#c9a227] hover:bg-amber-50"
                                      onClick={() => handleEditOrg(org)}
                                      title="Edit organization"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-green-600 hover:bg-green-50"
                                      onClick={() => {
                                        setInvoicingOrg(org)
                                        setInvoiceData({
                                          amount: String(org.plan_price || 499),
                                          description: org.billing_type === 'one_time'
                                            ? `${org.name} - One-Time License (${org.max_students} students)`
                                            : `${(org.plan_type || 'starter').charAt(0).toUpperCase() + (org.plan_type || 'starter').slice(1)} Plan - Monthly Subscription`,
                                          quantity: "1"
                                        })
                                        setShowInvoiceDialog(true)
                                      }}
                                      title="Send Stripe Invoice"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                      onClick={() => handleImpersonateOrg(org.id, org.name)}
                                      title="View as this agency"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => copyToClipboard(`${window.location.origin}/${org.slug}`)}
                                      title="Copy agency URL"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <div className="px-1" title={org.subscription_status === 'active' ? 'Suspend organization' : org.subscription_status === 'suspended' ? 'Activate organization' : `Status: ${org.subscription_status}`}>
                                      <Switch
                                        checked={org.subscription_status === 'active'}
                                        disabled={org.subscription_status !== 'active' && org.subscription_status !== 'suspended'}
                                        onCheckedChange={() => toggleOrgStatus(org.id, org.subscription_status)}
                                      />
                                    </div>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Delete Organization</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to delete <strong>{org.name}</strong>? This action cannot be undone and all associated data (students, admins, assessments) will be permanently removed.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end gap-3 mt-4">
                                          <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                          </DialogClose>
                                          <Button 
                                            variant="destructive" 
                                            onClick={() => handleDeleteOrganization(org.id)}
                                            disabled={isDeletingOrg === org.id}
                                          >
                                            {isDeletingOrg === org.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                            Delete Permanently
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card className="border-[#e5e0d5]">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-[#0a192f] flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#c9a227]" />
                        Super Admin Team
                      </CardTitle>
                      <CardDescription>Manage co-super admins who have full platform access</CardDescription>
                    </div>
                    <Dialog open={showInviteSuperAdminDialog} onOpenChange={setShowInviteSuperAdminDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f]">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Co-Super Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#c9a227]" />
                            Invite Co-Super Admin
                          </DialogTitle>
                          <DialogDescription>
                            This person will have full platform access including agency management, billing, and admin controls.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              placeholder="colleague@thestudentblueprint.com"
                              value={superAdminInvite.email}
                              onChange={(e) => setSuperAdminInvite({ ...superAdminInvite, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              placeholder="John Doe"
                              value={superAdminInvite.fullName}
                              onChange={(e) => setSuperAdminInvite({ ...superAdminInvite, fullName: e.target.value })}
                            />
                          </div>
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
                            <p className="font-medium flex items-center gap-2">
                              <Crown className="w-4 h-4" />
                              Super Admin Privileges
                            </p>
                            <ul className="list-disc list-inside mt-2 text-amber-600 space-y-1 text-xs">
                              <li>Full access to the Platform Command Center</li>
                              <li>Create, edit, and delete agencies</li>
                              <li>Manage billing and invoicing</li>
                              <li>Impersonate any agency</li>
                              <li>Invite other co-super admins</li>
                            </ul>
                          </div>
                          <Button
                            onClick={handleInviteSuperAdmin}
                            disabled={isInvitingSuperAdmin || !superAdminInvite.email}
                            className="w-full bg-[#0a192f] hover:bg-[#152a45]"
                          >
                            {isInvitingSuperAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Send Invitation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {superAdmins.length === 0 ? (
                    <div className="text-center py-12 text-[#5a7a9a]">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No other super admins yet</p>
                      <p className="text-sm mt-1">Invite a co-super admin to share platform management duties</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Admin</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {superAdmins.map((sa) => (
                            <TableRow key={sa.id} className="hover:bg-[#faf8f3]">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#b8921f] flex items-center justify-center text-white font-bold">
                                    {(sa.first_name || sa.email)[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-[#0a192f]">
                                      {sa.first_name || sa.last_name
                                        ? `${sa.first_name || ""} ${sa.last_name || ""}`.trim()
                                        : sa.email.split("@")[0]}
                                    </p>
                                    <Badge className="bg-[#c9a227]/10 text-[#c9a227] border-0 text-[10px] font-bold uppercase tracking-wider">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Super Admin
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-[#5a7a9a]">{sa.email}</TableCell>
                              <TableCell>
                                {sa.is_active ? (
                                  <Badge className="bg-green-100 text-green-700 border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 border-0">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-[#5a7a9a]">
                                {new Date(sa.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {sa.id === admin?.id ? (
                                  <Badge variant="outline" className="text-[#5a7a9a] border-[#e5e0d5]">
                                    You
                                  </Badge>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Remove Co-Super Admin</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to remove <strong>{sa.first_name ? `${sa.first_name} ${sa.last_name || ""}`.trim() : sa.email}</strong> as a super admin? They will lose all platform-level access.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex justify-end gap-3 mt-4">
                                        <DialogClose asChild>
                                          <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleDeleteSuperAdmin(sa.id)}
                                          disabled={isDeletingSuperAdmin === sa.id}
                                        >
                                          {isDeletingSuperAdmin === sa.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                          Remove Admin
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changelog">
              <div className="max-w-4xl mx-auto py-6">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-black text-[#0a192f] tracking-tight mb-2" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                      Platform Evolution
                    </h2>
                    <p className="text-[#5a7a9a] text-lg">Tracking every milestone at The Student Blueprint.</p>
                  </div>
                  <div className="bg-amber-100 p-4 rounded-3xl">
                    <History className="w-10 h-10 text-[#c9a227]" />
                  </div>
                </div>

                <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#e5e0d5] before:to-transparent">
                  {changelogData.map((item, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#faf8f3] group-[.is-active]:bg-[#c9a227] text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-[#e5e0d5] bg-white shadow-xl shadow-slate-900/5">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <div className="font-black text-[#0a192f] text-xl">{item.title}</div>
                          <time className="font-display text-[#c9a227] font-bold text-sm uppercase tracking-widest">{item.date}</time>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={`text-[10px] font-bold uppercase tracking-widest px-2 h-5 ${
                            item.type === 'major' ? 'bg-[#c9a227] text-white' : 'bg-[#0a192f] text-white'
                          }`}>v{item.version}</Badge>
                        </div>
                        <ul className="space-y-3">
                          {item.changes.map((change, i) => (
                            <li key={i} className="text-slate-600 text-sm flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all-students" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#0a192f]">Student Assessments</h2>
                  <p className="text-sm text-[#5a7a9a]">View and manage all student assessments</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10 h-9 w-64 border-[#e5e0d5] text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchAllStudents} disabled={studentsLoading}>
                    <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-[180px] h-9 border-[#e5e0d5] text-sm">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {[...new Set(allStudents.map(a => a.student?.grade_level).filter(Boolean))].sort().map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-9 border-[#e5e0d5] text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="partial">Generating</SelectItem>
                    <SelectItem value="started">Started</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[180px] h-9 border-[#e5e0d5] text-sm">
                    <SelectValue placeholder="All Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment</SelectItem>
                    {[...new Set(allStudents.map(a => {
                      if (a.coupon_code) return a.coupon_code
                      return a.payment_status || 'unknown'
                    }).filter(Boolean))].sort().map(p => (
                      <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a192f]" />
                </div>
              ) : (
                <Card className="border-[#e5e0d5]">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#e5e0d5] bg-[#faf8f3]">
                          <TableHead className="font-bold text-[#0a192f] px-6">Student</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Grade</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Status</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Score</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Payment</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Date</TableHead>
                          <TableHead className="font-bold text-[#0a192f] text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allStudents
                          .filter(a => {
                            // Search filter
                            if (studentSearch) {
                              const search = studentSearch.toLowerCase()
                              const name = `${a.student?.first_name || ''} ${a.student?.last_name || ''} ${a.student?.full_name || ''}`.toLowerCase()
                              const email = (a.student?.email || '').toLowerCase()
                              const school = (a.student?.school_name || '').toLowerCase()
                              if (!name.includes(search) && !email.includes(search) && !school.includes(search)) return false
                            }
                            // Grade filter
                            if (gradeFilter !== 'all' && a.student?.grade_level !== gradeFilter) return false
                            // Status filter
                            if (statusFilter !== 'all' && a.status !== statusFilter) return false
                            // Payment filter
                            if (paymentFilter !== 'all') {
                              const paymentVal = a.coupon_code || a.payment_status || 'unknown'
                              if (paymentVal !== paymentFilter) return false
                            }
                            return true
                          })
                          .map((assessment) => (
                          <TableRow key={assessment.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50">
                            <TableCell className="px-6 py-4">
                              <div>
                                <p className="font-bold text-[#0a192f]">
                                  {assessment.student?.full_name || `${assessment.student?.first_name || ''} ${assessment.student?.last_name || ''}`.trim() || 'Unknown'}
                                </p>
                                <p className="text-xs text-[#5a7a9a]">{assessment.student?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a]">
                                {assessment.student?.grade_level || '\u2014'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {assessment.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Completed
                                </span>
                              ) : assessment.status === 'partial' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                  <Clock className="w-3.5 h-3.5" />
                                  Generating...
                                </span>
                              ) : assessment.status === 'in_progress' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                                  <Clock className="w-3.5 h-3.5" />
                                  Section {assessment.current_section || '?'}/15
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  Started
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {assessment.competitiveness_score ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0a192f] text-sm w-6">{assessment.competitiveness_score}</span>
                                  <div className="w-16 h-2 bg-[#e5e0d5] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        assessment.competitiveness_score >= 80 ? 'bg-green-500' :
                                        assessment.competitiveness_score >= 60 ? 'bg-amber-500' :
                                        'bg-red-400'
                                      }`}
                                      style={{ width: `${assessment.competitiveness_score}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#5a7a9a]">&mdash;</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {assessment.coupon_code ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                                  <Ticket className="w-3 h-3 mr-1" />
                                  {assessment.coupon_code}
                                </span>
                              ) : assessment.payment_status === 'paid' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                  PAID
                                </span>
                              ) : assessment.payment_status === 'free' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                                  FREE
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500">
                                  {(assessment.payment_status || 'unpaid').toUpperCase()}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a]">
                                {new Date(assessment.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                              </span>
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center justify-end gap-1">
                                {(assessment.status === 'completed' || assessment.status === 'partial') && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                                      title="View Results"
                                      onClick={() => window.open(`/results/${assessment.id}`, '_blank')}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                                      title="View Report"
                                      onClick={() => window.open(`/results/${assessment.id}`, '_blank')}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                                      title="Download PDF"
                                      onClick={() => window.open(`/api/pdf/${assessment.id}`, '_blank')}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                                  title="Copy Link"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/results/${assessment.id}`)
                                    toast.success("Link copied to clipboard")
                                  }}
                                >
                                  <Link2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                                  title="Delete"
                                  onClick={() => setDeletingAssessmentId(assessment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {allStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="h-40 text-center text-[#5a7a9a]">
                              No student assessments found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Delete Confirmation Dialog */}
              <Dialog open={!!deletingAssessmentId} onOpenChange={(open) => { if (!open) setDeletingAssessmentId(null) }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Assessment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this assessment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setDeletingAssessmentId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deletingAssessmentId && handleDeleteAssessment(deletingAssessmentId)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="coupons" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#0a192f]">Coupon Codes</h2>
                  <p className="text-sm text-[#5a7a9a]">Generate invite codes for students to skip payment</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={couponsLoading}>
                    <RefreshCw className={`w-4 h-4 ${couponsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f] font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Coupon
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Coupon Code</DialogTitle>
                        <DialogDescription>Generate a coupon code for students to skip the payment</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="text-sm font-bold">Coupon Code</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              placeholder="E.G., HARVARD2024"
                              value={newCoupon.code}
                              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                              className="border-[#e5e0d5]"
                            />
                            <Button variant="outline" size="sm" onClick={generateRandomCode} title="Generate random code">
                              <Sparkles className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Discount Type</Label>
                          <Select value={newCoupon.discountType} onValueChange={(v) => setNewCoupon({ ...newCoupon, discountType: v })}>
                            <SelectTrigger className="mt-1 border-[#e5e0d5]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free Access (100% off)</SelectItem>
                              <SelectItem value="percentage">Percentage Discount</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newCoupon.discountType !== "free" && (
                          <div>
                            <Label className="text-sm font-bold">
                              {newCoupon.discountType === "percentage" ? "Discount (%)" : "Discount Amount ($)"}
                            </Label>
                            <Input
                              type="number"
                              placeholder={newCoupon.discountType === "percentage" ? "e.g., 50" : "e.g., 100"}
                              value={newCoupon.discountValue}
                              onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                              className="mt-1 border-[#e5e0d5]"
                            />
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-bold">Description</Label>
                          <Input
                            placeholder="e.g., Free assessment for program participants"
                            value={newCoupon.description}
                            onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                            className="mt-1 border-[#e5e0d5]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-bold">Max Uses (Optional)</Label>
                            <Input
                              type="number"
                              placeholder="Unlimited"
                              value={newCoupon.maxUses}
                              onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                              className="mt-1 border-[#e5e0d5]"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-bold">Expires (Optional)</Label>
                            <Input
                              type="date"
                              value={newCoupon.expiresAt}
                              onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                              className="mt-1 border-[#e5e0d5]"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Notes (Internal)</Label>
                          <Textarea
                            placeholder="Internal notes about this coupon..."
                            value={newCoupon.notes}
                            onChange={(e) => setNewCoupon({ ...newCoupon, notes: e.target.value })}
                            className="mt-1 border-[#e5e0d5]"
                            rows={2}
                          />
                        </div>
                        <Button
                          className="w-full bg-[#0a192f] hover:bg-[#0a192f]/90 text-white font-bold"
                          onClick={handleCreateCoupon}
                          disabled={isCreatingCoupon}
                        >
                          {isCreatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Coupon
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {couponsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a192f]" />
                </div>
              ) : (
                <Card className="border-[#e5e0d5]">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#e5e0d5] bg-[#faf8f3]">
                          <TableHead className="font-bold text-[#0a192f] px-6">Code</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Organization</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Description</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Usage</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Expires</TableHead>
                          <TableHead className="font-bold text-[#0a192f]">Status</TableHead>
                          <TableHead className="font-bold text-[#0a192f] text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#0a192f] text-white text-xs font-bold tracking-wider">
                                  {coupon.code}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-[#5a7a9a] hover:text-[#0a192f]"
                                  onClick={() => {
                                    navigator.clipboard.writeText(coupon.code)
                                    toast.success("Copied to clipboard!")
                                  }}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a]">{coupon.organization || '\u2014'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a] truncate max-w-[200px] block">{coupon.description || '\u2014'}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#0a192f]">{coupon.current_uses || 0}</span>
                                <span className="text-xs text-[#5a7a9a]">/ {coupon.max_uses || '\u221E'}</span>
                                <div className="w-16 h-2 bg-[#e5e0d5] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#0a192f] rounded-full"
                                    style={{ width: coupon.max_uses ? `${Math.min(100, ((coupon.current_uses || 0) / coupon.max_uses) * 100)}%` : `${Math.min(100, (coupon.current_uses || 0) * 2)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#5a7a9a]">
                                {coupon.valid_until
                                  ? new Date(coupon.valid_until).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                                  : 'Never'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {coupon.is_active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Inactive
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-6 text-right">
                              <Switch
                                checked={coupon.is_active}
                                onCheckedChange={(checked) => toggleCouponStatus(coupon.id, checked)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {coupons.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="h-40 text-center text-[#5a7a9a]">
                              No coupons created yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              {referralsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a192f]" />
                </div>
              ) : (
                <>
                  {/* Discount Tiers */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0a192f] flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-[#c9a227]" />
                        Discount Tiers
                      </h2>
                      <p className="text-sm text-[#5a7a9a]">Configure discount levels for referral partners</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAddTierForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>

                  <Card className="border-[#e5e0d5]">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#e5e0d5] bg-[#faf8f3]">
                            <TableHead className="font-bold text-[#0a192f] px-6">Coupon Code</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Discount %</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Student Pays</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Partner Earns (20%)</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">You Keep (80%)</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Active</TableHead>
                            <TableHead className="font-bold text-[#0a192f] text-right px-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralTiers.map((tier) => {
                            const studentPays = 497 * (1 - tier.discount_percent / 100)
                            const partnerEarns = studentPays * 0.20
                            const youKeep = studentPays * 0.80
                            return (
                              <TableRow key={tier.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50">
                                <TableCell className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#c9a227]/20 text-[#0a192f] text-xs font-bold tracking-wider">
                                    {tier.label}
                                  </span>
                                </TableCell>
                                <TableCell><span className="text-sm font-bold">{tier.discount_percent}%</span></TableCell>
                                <TableCell><span className="text-sm">{formatCurrency(studentPays)}</span></TableCell>
                                <TableCell><span className="text-sm font-bold text-green-600">{formatCurrency(partnerEarns)}</span></TableCell>
                                <TableCell><span className="text-sm">{formatCurrency(youKeep)}</span></TableCell>
                                <TableCell>
                                  <Switch checked={tier.is_active} onCheckedChange={(v) => handleToggleTierActive(tier.id, v)} />
                                </TableCell>
                                <TableCell className="px-6 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]" onClick={() => {/* TODO: edit tier */}}>
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => handleDeleteTier(tier.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {referralTiers.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="h-20 text-center text-[#5a7a9a]">No discount tiers created yet.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Add Tier Dialog */}
                  <Dialog open={showAddTierForm} onOpenChange={setShowAddTierForm}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Discount Tier</DialogTitle>
                        <DialogDescription>Create a new discount tier for referral partners</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="text-sm font-bold">Coupon Code</Label>
                          <Input placeholder="e.g., PARTNER10" value={newTier.label} onChange={(e) => setNewTier({ ...newTier, label: e.target.value.toUpperCase() })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Discount Percent (1-100)</Label>
                          <Input type="number" min="1" max="100" placeholder="e.g., 10" value={newTier.discount_percent} onChange={(e) => setNewTier({ ...newTier, discount_percent: e.target.value })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        {newTier.discount_percent && (
                          <div className="rounded-lg bg-[#faf8f3] border border-[#e5e0d5] p-3 text-sm">
                            <p>Student pays: <strong>{formatCurrency(497 * (1 - parseInt(newTier.discount_percent || "0") / 100))}</strong></p>
                            <p>Partner earns (20%): <strong className="text-green-600">{formatCurrency(497 * (1 - parseInt(newTier.discount_percent || "0") / 100) * 0.20)}</strong></p>
                            <p>You keep (80%): <strong>{formatCurrency(497 * (1 - parseInt(newTier.discount_percent || "0") / 100) * 0.80)}</strong></p>
                          </div>
                        )}
                        <Button className="w-full bg-[#0a192f] hover:bg-[#0a192f]/90 text-white font-bold" onClick={handleCreateTier} disabled={isCreatingTier}>
                          {isCreatingTier ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Tier
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#5a7a9a]">Active Partners</p>
                          <p className="text-2xl font-bold text-[#0a192f]">{referralStats.totalActivePartners}</p>
                        </div>
                        <UserPlus className="w-10 h-10 text-[#c9a227]/30" />
                      </CardContent>
                    </Card>
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#5a7a9a]">Students Referred</p>
                          <p className="text-2xl font-bold text-[#0a192f]">{referralStats.totalStudents}</p>
                        </div>
                        <Users className="w-10 h-10 text-[#c9a227]/30" />
                      </CardContent>
                    </Card>
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#5a7a9a]">Completed</p>
                          <p className="text-2xl font-bold text-[#0a192f]">{referralStats.totalCompleted}</p>
                          <p className="text-xs text-[#5a7a9a]">{referralStats.totalStudents > 0 ? Math.round((referralStats.totalCompleted / referralStats.totalStudents) * 100) : 0}% rate</p>
                        </div>
                        <CheckCircle2 className="w-10 h-10 text-green-400/30" />
                      </CardContent>
                    </Card>
                    <Card className="border-[#e5e0d5]">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#5a7a9a]">Total Revenue</p>
                          <p className="text-2xl font-bold text-[#0a192f]">{formatCurrency(referralStats.totalRevenue)}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-[#c9a227]/30" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Referral Partners */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#0a192f]">Referral Partners</h2>
                      <p className="text-sm text-[#5a7a9a]">Manage referral partners and track their performance</p>
                    </div>
                    <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f] font-bold" onClick={() => setShowAddPartnerForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Referral Partner
                    </Button>
                  </div>

                  {/* Add Partner Dialog */}
                  <Dialog open={showAddPartnerForm} onOpenChange={setShowAddPartnerForm}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Referral Partner</DialogTitle>
                        <DialogDescription>Create a new referral partner</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="text-sm font-bold">Full Name *</Label>
                          <Input placeholder="e.g., John Smith" value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Email *</Label>
                          <Input type="email" placeholder="e.g., john@example.com" value={newPartner.email} onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Organization (Optional)</Label>
                          <Input placeholder="e.g., ABC Tutoring" value={newPartner.organization} onChange={(e) => setNewPartner({ ...newPartner, organization: e.target.value })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Custom Referral Code (Optional)</Label>
                          <Input placeholder="Auto-generated if blank" value={newPartner.referral_code} onChange={(e) => setNewPartner({ ...newPartner, referral_code: e.target.value.toUpperCase() })} className="mt-1 border-[#e5e0d5]" />
                        </div>
                        {referralTiers.length > 0 && (
                          <div className="rounded-lg bg-[#faf8f3] border border-[#e5e0d5] p-3 text-xs text-[#5a7a9a]">
                            Available coupon codes: {referralTiers.filter(t => t.is_active).map(t => t.label).join(", ") || "None active"}
                          </div>
                        )}
                        <Button className="w-full bg-[#0a192f] hover:bg-[#0a192f]/90 text-white font-bold" onClick={handleCreatePartner} disabled={isCreatingPartner}>
                          {isCreatingPartner ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Partner
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Card className="border-[#e5e0d5]">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#e5e0d5] bg-[#faf8f3]">
                            <TableHead className="font-bold text-[#0a192f] px-6">Partner</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Referral Link</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Coupon Codes</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Students</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Completed</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Unpaid Balance</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Results Access</TableHead>
                            <TableHead className="font-bold text-[#0a192f]">Status</TableHead>
                            <TableHead className="font-bold text-[#0a192f] text-right px-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralPartners.map((partner) => (
                            <TableRow key={partner.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50">
                              <TableCell className="px-6 py-4">
                                <div>
                                  <p className="font-bold text-[#0a192f]">{partner.name}</p>
                                  <p className="text-xs text-[#5a7a9a]">{partner.email}</p>
                                  {partner.organization && <p className="text-xs text-[#5a7a9a]">{partner.organization}</p>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-[#faf8f3] border border-[#e5e0d5] rounded px-2 py-1 font-mono">
                                    thestudentblueprint.com?ref={partner.referral_code}
                                  </span>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#5a7a9a]" onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}?ref=${partner.referral_code}`)
                                    toast.success("Referral link copied!")
                                  }}>
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {referralTiers.filter(t => t.is_active).map(t => (
                                    <span key={t.id} className="inline-flex px-2 py-0.5 rounded bg-[#0a192f] text-white text-[10px] font-bold tracking-wider">
                                      {t.label}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell><span className="text-sm font-bold">{partner.student_count || 0}</span></TableCell>
                              <TableCell><span className="text-sm font-bold text-green-600">{partner.completed_count || 0}</span></TableCell>
                              <TableCell>
                                <span className={`text-sm font-bold ${(partner.unpaid_balance || 0) > 0 ? 'text-amber-600' : 'text-[#5a7a9a]'}`}>
                                  {formatCurrency(partner.unpaid_balance || 0)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Switch checked={partner.can_view_results} onCheckedChange={(v) => handleToggleResultsAccess(partner.id, v)} />
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                  partner.status === 'active' ? 'bg-green-100 text-green-700' :
                                  partner.status === 'invited' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]" title="View Details" onClick={() => window.open(`/results/${partner.id}`, '_blank')}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#5a7a9a] hover:text-[#0a192f]" title="Resend Invite" onClick={async () => {
                                    await fetch("/api/admin/referral-partners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: partner.id, resend_invite: true }) })
                                    toast.success("Invite resent!")
                                  }}>
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" title="Delete" onClick={() => handleDeletePartner(partner.id)}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {referralPartners.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="h-20 text-center text-[#5a7a9a]">No referral partners yet.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0a192f]">Assessment Questions</h2>
                <p className="text-sm text-[#5a7a9a]">The 15 sections students complete in the assessment — click any field to see details</p>
              </div>

              <div className="space-y-4">
                {(() => {
                  const sections: { title: string; fields: { name: string; type: string; details?: string[]; required?: boolean }[] }[] = [
                    {
                      title: "Basic Information",
                      fields: [
                        { name: "Full Name", type: "Text input", required: true },
                        { name: "Email", type: "Email input", required: true },
                        { name: "Parent Name", type: "Text input", required: true },
                        { name: "Parent Email", type: "Email input", required: true },
                        { name: "Parent Phone", type: "Phone with country code picker", details: ["60+ country codes with flags (US, UK, India, etc.)"] },
                        { name: "Date of Birth", type: "Date picker" },
                        { name: "Current Grade", type: "Dropdown", required: true, details: ["6th Grade", "7th Grade", "8th Grade", "9th Grade (Freshman)", "10th Grade (Sophomore)", "11th Grade (Junior)", "12th Grade (Senior)"] },
                        { name: "School Name", type: "Text input", required: true },
                        { name: "Address", type: "Text input", details: ["Street address, City, State, Country"] },
                        { name: "Country", type: "Dropdown", details: ["United States", "India", "United Kingdom", "Canada", "Australia", "Singapore", "UAE", "China", "South Korea", "Germany", "France", "Brazil", "Japan", "Switzerland", "Netherlands", "Ireland", "Other"] },
                        { name: "Gender", type: "Dropdown", details: ["Male", "Female", "Non-binary", "Prefer not to say"] },
                        { name: "Ethnicity", type: "Text input" },
                        { name: "Dream Schools", type: "Dynamic list (up to 3)", details: ["Students can add/remove dream school entries"] },
                        { name: "Study Abroad Plans", type: "Checkbox + multi-select", details: ["Yes/No toggle", "If yes: select target countries from country list"] },
                        { name: "Curriculum", type: "Grouped dropdown", details: ["International: IB, IGCSE, A-Levels, AP", "Indian National: CBSE, ICSE/ISC, NIOS", "European: French Bac, German Abitur, European Bac, Scottish Highers, Swiss/Italian Maturità", "North American: US High School Diploma, OSSD (Ontario), BC Curriculum", "Oceania: Australian State Certs, NCEA (New Zealand)", "Vocational: BTEC, IPC/IMYC, Montessori/Waldorf", "Other: Gaokao (China), Other"] },
                      ]
                    },
                    {
                      title: "Academic Profile",
                      fields: [
                        { name: "Curriculum Type", type: "Grouped dropdown (same as Section 1)" },
                        { name: "GPA Scale", type: "Dropdown", details: ["4.0 Scale (Unweighted)", "5.0 Scale (Weighted)", "6.0 Scale (Weighted)", "100-Point Scale (Percentage)", "10.0 CGPA (India)", "7.0 Scale (Australia)", "4.33 Scale (Canada)", "4.0 Scale (UK/Singapore)", "5.0 Scale (South Korea)", "20-Point Scale (France)", "15-Point Scale (Germany)", "IB 7-Point Scale", "Other"] },
                        { name: "GPA Unweighted", type: "Number input" },
                        { name: "GPA Weighted", type: "Number input" },
                        { name: "Advanced Courses Taken", type: "Checkbox grid (filtered by curriculum)", details: ["6 categories: Math & CS, Sciences, English & Languages, History & Social Sciences, Arts & Interdisciplinary, Career/Technical", "300+ courses tagged by curriculum (AP, IB, A-Level, IGCSE, CBSE, ICSE, NIOS, etc.)", "Auto-filtered to show relevant courses based on selected curriculum"] },
                        { name: "Advanced Courses Planned", type: "Same checkbox grid" },
                        { name: "Regular Courses Taken", type: "Checkbox grid (universal)", details: ["7 categories: Mathematics, Sciences, Language & Literature, Social Sciences, Arts, Technology & Career, PE & Health", "50+ standard courses available to all curriculums"] },
                        { name: "Regular Courses Planned", type: "Same checkbox grid" },
                        { name: "Class Rank", type: "Text input" },
                        { name: "Favorite Subjects", type: "Multi-select", details: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Economics", "Psychology", "Art", "Music", "Foreign Languages", "Physical Education"] },
                        { name: "Least Favorite Subjects", type: "Multi-select (same options)" },
                        { name: "Academic Awards", type: "Textarea" },
                      ]
                    },
                    {
                      title: "Standardized Testing",
                      fields: [
                        { name: "Haven't Taken Yet", type: "Checkbox", details: ["If checked, all test score fields are hidden"] },
                        { name: "PSAT Score", type: "Number input", details: ["Expandable breakdown: Math score, Reading score"] },
                        { name: "SAT Score", type: "Number input", details: ["Expandable breakdown: Math (200-800), Reading (200-800)"] },
                        { name: "ACT Score", type: "Number input", details: ["Expandable breakdown: English, Math, Reading, Science (each 1-36)"] },
                        { name: "AP/IB Exam Scores", type: "Textarea", details: ["Free text for listing exam scores, e.g. 'AP Calculus BC: 5, AP Physics: 4'"] },
                        { name: "Testing Timeline", type: "Textarea", details: ["When they plan to take future tests"] },
                        { name: "Preferred Test Format", type: "Radio buttons", details: ["SAT", "ACT", "Both / Undecided"] },
                      ]
                    },
                    {
                      title: "Extracurricular Activities",
                      fields: [
                        { name: "No Extracurriculars Checkbox", type: "Checkbox", details: ["If checked, activity cards are hidden"] },
                        { name: "Activities (up to 10)", type: "Dynamic card list", details: ["Each activity card has:", "• Activity Name (text)", "• Role/Position (text)", "• Years Involved (text)", "• Hours per Week (text)", "• Achievements/Description (textarea)", "Students can add/remove activity cards"] },
                      ]
                    },
                    {
                      title: "Leadership Experience",
                      fields: [
                        { name: "No Leadership Checkbox", type: "Checkbox", details: ["If checked, leadership cards are hidden"] },
                        { name: "Leadership Entries (up to 10)", type: "Dynamic card list", details: ["Each entry has:", "• Position Title (text)", "• Organization (text)", "• Awards/Recognition (text)", "• Scale of Impact (dropdown): Local, Regional, State, National, International"] },
                      ]
                    },
                    {
                      title: "Competitions & Recognitions",
                      fields: [
                        { name: "No Competitions Checkbox", type: "Checkbox", details: ["If checked, competition cards are hidden"] },
                        { name: "Competition Entries", type: "Dynamic card list", details: ["Each entry has:", "• Competition Name (text)", "• Recognition/Awards (text)"] },
                      ]
                    },
                    {
                      title: "Passions & Interests",
                      fields: [
                        { name: "Topics You Love (5 fields)", type: "5 text inputs", details: ["Topic 1 through Topic 5 — free text for each"] },
                        { name: "Industries Curious About (3 fields)", type: "3 text inputs", details: ["Industry 1 through Industry 3 — free text for each"] },
                        { name: "Hobbies & Skills", type: "Textarea" },
                        { name: "World Problem to Solve", type: "Textarea", details: ["'If you could solve one problem in the world, what would it be?'"] },
                      ]
                    },
                    {
                      title: "Career Aspirations",
                      fields: [
                        { name: "Top 3 Career Fields", type: "3 text inputs", details: ["Career 1, Career 2, Career 3"] },
                        { name: "Dream Job Title", type: "Text input" },
                        { name: "Best-Fit Career Statement", type: "Radio buttons", details: ["'I love solving problems with logic.'", "'I love helping people directly.'", "'I love creating beautiful or powerful things.'", "'I love building businesses and making things grow.'"] },
                      ]
                    },
                    {
                      title: "Research & Internship Exposure",
                      fields: [
                        { name: "No Research Experience Checkbox", type: "Checkbox", details: ["If checked, entry cards are hidden"] },
                        { name: "Experience Entries", type: "Dynamic card list", details: ["Each entry has:", "• Type (dropdown): Research, Shadowing, Internship, Job, Other", "• Organization (text)", "• Role/Title (text)", "• Description (textarea)", "• Duration (text)"] },
                      ]
                    },
                    {
                      title: "Summer Programs",
                      fields: [
                        { name: "No Summer Programs Checkbox", type: "Checkbox", details: ["If checked, program cards are hidden"] },
                        { name: "Program Entries", type: "Dynamic card list", details: ["Each entry has:", "• Program Name (text)", "• Organization (text)", "• Description (textarea)", "• Year (text)"] },
                      ]
                    },
                    {
                      title: "Special Talents",
                      fields: [
                        { name: "Musical Instruments", type: "Textarea", details: ["List instruments played and years of experience"] },
                        { name: "Visual Arts", type: "Textarea", details: ["Drawing, painting, sculpture, photography, etc."] },
                        { name: "Performance Arts", type: "Textarea", details: ["Theater, dance, spoken word, etc."] },
                        { name: "Athletics", type: "Textarea", details: ["Sports, competitions, achievements"] },
                      ]
                    },
                    {
                      title: "Family Context",
                      fields: [
                        { name: "Father's Profession", type: "Text input" },
                        { name: "Mother's Profession", type: "Text input" },
                        { name: "Sibling Professions", type: "Text input" },
                        { name: "Legacy College Connections", type: "Dynamic card list", details: ["Each entry has:", "• College Name (text)", "• Relation (dropdown): Parent (Alumnus/Alumna), Grandparent, Sibling, Aunt/Uncle, Cousin, Other Family, Family Donor"] },
                        { name: "Financial Aid Needed", type: "Checkbox" },
                        { name: "Merit Scholarship Interest", type: "Checkbox" },
                      ]
                    },
                    {
                      title: "Personality Insights",
                      fields: [
                        { name: "Top 3 Strengths", type: "3 text inputs" },
                        { name: "Top 3 Weaknesses", type: "3 text inputs" },
                        { name: "Personality Archetypes (select up to 2)", type: "Multi-select (max 2)", details: ["Visionary — Big-picture thinker", "Builder — Creates and constructs solutions", "Healer — Cares for and supports others", "Analyst — Data-driven and detail-oriented", "Artist — Creative and expressive", "Advocate — Champions causes and people", "Entrepreneur — Innovates and takes risks", "Researcher — Investigates and discovers"] },
                        { name: "Personality Type", type: "Radio buttons", details: ["Introvert", "Extrovert", "Ambivert"] },
                      ]
                    },
                    {
                      title: "Personal Storytelling",
                      fields: [
                        { name: "Life Challenge", type: "Textarea (essay)", details: ["'Describe a significant challenge you've faced and how you overcame it'", "Word counter shown to student"] },
                        { name: "Leadership Moment", type: "Textarea (essay)", details: ["'Tell us about a time you demonstrated leadership'", "Word counter shown to student"] },
                        { name: "Failure Lesson", type: "Textarea (essay)", details: ["'Describe a failure and what you learned from it'", "Word counter shown to student"] },
                        { name: "Proudest Moment", type: "Textarea (essay)", details: ["'What accomplishment are you most proud of and why?'", "Word counter shown to student"] },
                      ]
                    },
                    {
                      title: "Time Commitment",
                      fields: [
                        { name: "Hours/Week During School Year", type: "Text input", details: ["How many hours per week can you dedicate to extracurricular development?"] },
                        { name: "Hours/Week During Summer", type: "Text input", details: ["How many hours per week during summer break?"] },
                        { name: "Preferred Pace", type: "Radio buttons", details: ["Fast-Track (intense, quicker impact)", "Steady Progress (balanced with schoolwork)", "Flexible (depending on other priorities)"] },
                      ]
                    },
                  ]

                  return sections.map((section, index) => (
                    <Card key={index} className="border-[#e5e0d5]">
                      <CardHeader className="pb-2 px-6 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0a192f] text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg text-[#0a192f]">{section.title}</CardTitle>
                          <span className="text-xs text-[#5a7a9a] bg-[#faf8f3] px-2 py-0.5 rounded-full">{section.fields.length} fields</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-5">
                        <div className="space-y-2 ml-11">
                          {section.fields.map((field, fi) => (
                            <details key={fi} className="group">
                              <summary className="flex items-start gap-2 text-sm cursor-pointer list-none hover:bg-[#faf8f3] rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a227] mt-1.5 shrink-0" />
                                <span className="flex-1">
                                  <span className="font-medium text-[#0a192f]">{field.name}</span>
                                  {field.required && <span className="text-red-500 ml-1 text-xs">*required</span>}
                                  <span className="text-[#5a7a9a] ml-2 text-xs">({field.type})</span>
                                </span>
                                {field.details && (
                                  <span className="text-[#c9a227] text-xs mt-0.5 group-open:rotate-90 transition-transform">▶</span>
                                )}
                              </summary>
                              {field.details && (
                                <div className="ml-5 mt-1 mb-2 pl-3 border-l-2 border-[#e5e0d5]">
                                  {field.details.map((detail, di) => (
                                    <p key={di} className="text-xs text-[#5a7a9a] py-0.5">{detail}</p>
                                  ))}
                                </div>
                              )}
                            </details>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                })()}
              </div>
            </TabsContent>

            </div>
          </Tabs>
        </motion.div>
      </main>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your admin account password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordChange.newPassword}
              className="w-full bg-[#0a192f] hover:bg-[#152a45]"
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={showEditOrgDialog} onOpenChange={setShowEditOrgDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#c9a227]" />
              Edit Organization
            </DialogTitle>
            <DialogDescription>
              Update organization settings and limits
            </DialogDescription>
          </DialogHeader>
          {editingOrg && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={editingOrg.name}
                    onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    value={editingOrg.slug}
                    onChange={(e) => setEditingOrg({ ...editingOrg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Billing Email</Label>
                <Input
                  type="email"
                  value={editingOrg.billing_email || ''}
                  onChange={(e) => setEditingOrg({ ...editingOrg, billing_email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select
                    value={editingOrg.plan_type}
                    onValueChange={(v) => setEditingOrg({ ...editingOrg, plan_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingOrg.subscription_status}
                    onValueChange={(v) => setEditingOrg({ ...editingOrg, subscription_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Billing Type</Label>
                <Select
                  value={editingOrg.billing_type || 'subscription'}
                  onValueChange={(v) => setEditingOrg({ ...editingOrg, billing_type: v as 'subscription' | 'one_time' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription (Monthly)</SelectItem>
                    <SelectItem value="one_time">One-Time License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    value={editingOrg.max_students}
                    onChange={(e) => setEditingOrg({ ...editingOrg, max_students: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Admins</Label>
                  <Input
                    type="number"
                    value={editingOrg.max_admins}
                    onChange={(e) => setEditingOrg({ ...editingOrg, max_admins: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{(editingOrg.billing_type || 'subscription') === 'one_time' ? 'License Price ($)' : 'Plan Price ($/mo)'}</Label>
                  <Input
                    type="number"
                    value={editingOrg.plan_price ?? ''}
                    onChange={(e) => setEditingOrg({ ...editingOrg, plan_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-[#e5e0d5] pt-4 mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#5a7a9a] mb-3">Quick Actions</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleExtendTrial(editingOrg.id, 7)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    +7 Days Trial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleExtendTrial(editingOrg.id, 14)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    +14 Days Trial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleImpersonateOrg(editingOrg.id, editingOrg.name)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View as Agency
                  </Button>
                </div>
              </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowEditOrgDialog(false)
                        setEditingOrg(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateOrg}
                      disabled={isUpdatingOrg}
                      className="flex-1 bg-[#0a192f] hover:bg-[#152a45]"
                    >
                      {isUpdatingOrg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
    
          {/* Invoice Dialog */}
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Send Stripe Invoice
                </DialogTitle>
                <DialogDescription>
                  Create and send an instant invoice to {invoicingOrg?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                    placeholder="e.g., 10 Additional Student Licenses"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={invoiceData.amount}
                      onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={invoiceData.quantity}
                      onChange={(e) => setInvoiceData({ ...invoiceData, quantity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-700">
                  <p className="font-medium">Total: ${(parseFloat(invoiceData.amount || "0") * parseInt(invoiceData.quantity || "0")).toLocaleString()}</p>
                  <p className="text-xs mt-1">Invoice will be sent to {invoicingOrg?.billing_email || "the agency's billing email"}.</p>
                </div>
                <Button
                  onClick={handleSendInvoice}
                  disabled={isSendingInvoice || !invoiceData.amount || !invoiceData.description}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSendingInvoice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Finalize & Send Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>


      {/* Convert Lead to Agency Dialog */}
      {/* Demo Creation Dialog */}
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-[#c9a227]" />
              Start Demo
            </DialogTitle>
            <DialogDescription>
              Create a demo assessment with pre-filled sample data to showcase the platform to prospects.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organization (Optional)</Label>
              <Select value={demoOrgId || "none"} onValueChange={(v) => setDemoOrgId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization (or leave empty for default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Platform Default</SelectItem>
                  {organizations.filter(o => !o.settings?.platformOwner).map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The demo will be created under this organization's branding.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Demo Profile</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "healthcare", label: "Healthcare", emoji: "🩺", name: "Priya Sharma", grade: "9th", score: 94 },
                  { id: "finance", label: "Finance", emoji: "📊", name: "Marcus Chen", grade: "10th", score: 91 },
                  { id: "engineering", label: "Engineering", emoji: "⚙️", name: "Sofia Rodriguez", grade: "11th", score: 89 },
                ].map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => setDemoType(demo.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${demoType === demo.id ? 'border-[#c9a227] bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-lg mb-1">{demo.emoji}</div>
                    <div className="font-bold text-sm text-[#0a192f]">{demo.label}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{demo.name}</div>
                    <div className="text-[10px] text-gray-400">{demo.grade} grade · Score {demo.score}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
              <p className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                What the demo includes:
              </p>
              <ul className="list-disc list-inside mt-2 text-amber-600 space-y-1">
                <li>Complete student profile with all sections filled</li>
                <li>Personalized analysis, roadmap, and recommendations</li>
                <li>Scholarship matches and college recommendations</li>
                <li>Full results page you can share with prospects</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDemoDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDemo}
              disabled={isCreatingDemo}
              className="flex-1 bg-[#c9a227] hover:bg-[#b8921f] text-[#0a192f]"
            >
              {isCreatingDemo ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Create & Open Demo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
