'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Plus,
  Users,
  FileText,
  DollarSign,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Organization } from '@/types'

interface OrganizationWithCounts extends Organization {
  admins: { count: number }[]
  students: { count: number }[]
  assessments: { count: number }[]
}

export default function OrganizationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<OrganizationWithCounts[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const slugCheckTimer = useState<ReturnType<typeof setTimeout> | null>(null)
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    billing_email: '',
    plan_type: 'starter',
    max_students: 50,
    max_admins: 3,
    assessment_price: 47,
    primary_color: '#1e3a5f',
    secondary_color: '#c9a227',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me')
      const data = await response.json()

      if (data.admin?.role !== 'super_admin') {
        toast.error('Access denied. Super admin required.')
        router.push('/admin')
        return
      }

      fetchOrganizations()
    } catch {
      router.push('/admin/login')
    }
  }

  const checkSlugAvailability = (slug: string) => {
    if (slugCheckTimer[0]) clearTimeout(slugCheckTimer[0])

    if (!slug || slug.length < 2) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')
    slugCheckTimer[0] = setTimeout(async () => {
      try {
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        const taken = organizations.some((org) => org.slug === normalizedSlug)
        if (taken) {
          setSlugStatus('taken')
          return
        }
        const response = await fetch('/api/platform/organizations')
        const data = await response.json()
        const slugTaken = (data.organizations || []).some(
          (org: OrganizationWithCounts) => org.slug === normalizedSlug
        )
        setSlugStatus(slugTaken ? 'taken' : 'available')
      } catch {
        setSlugStatus('idle')
      }
    }, 400)
  }

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/platform/organizations')
      const data = await response.json()

      if (data.organizations) {
        setOrganizations(data.organizations)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
      toast.error('Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrg = async () => {
    if (!newOrg.name.trim() || !newOrg.slug.trim()) {
      toast.error('Name and slug are required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/platform/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Organization created successfully!')
        setShowCreateDialog(false)
        setSlugStatus('idle')
        setNewOrg({
          name: '',
          slug: '',
          billing_email: '',
          plan_type: 'starter',
          max_students: 50,
          max_admins: 3,
          assessment_price: 47,
          primary_color: '#1e3a5f',
          secondary_color: '#c9a227',
        })
        fetchOrganizations()
      } else {
        toast.error(data.error || 'Failed to create organization')
      }
    } catch {
      toast.error('Failed to create organization')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will delete all associated data.`)) {
      return
    }

    try {
      const response = await fetch(`/api/platform/organizations?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Organization deleted')
        fetchOrganizations()
      } else {
        toast.error(data.error || 'Failed to delete organization')
      }
    } catch {
      toast.error('Failed to delete organization')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'trial':
        return 'bg-blue-100 text-blue-700'
      case 'past_due':
        return 'bg-amber-100 text-amber-700'
      case 'canceled':
      case 'suspended':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pro':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <nav className="bg-[#1e3a5f] text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Platform Management
              </h1>
              <p className="text-white/60 text-sm">Manage tutoring agency organizations</p>
            </div>
          </div>

          <Badge className="bg-[#c9a227] text-[#1e3a5f] hover:bg-[#b8921f] border-0 rounded-full px-4 py-1 font-bold">
            Super Admin
          </Badge>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-[#e5e0d5]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5a7a9a]">Organizations</p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">{organizations.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5e0d5]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5a7a9a]">Total Students</p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">
                    {organizations.reduce((sum, org) => sum + (org.students?.[0]?.count || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5e0d5]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5a7a9a]">Assessments</p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">
                    {organizations.reduce((sum, org) => sum + (org.assessments?.[0]?.count || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5e0d5]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5a7a9a]">Active Plans</p>
                  <p className="text-3xl font-bold text-[#1e3a5f]">
                    {organizations.filter(org => org.subscription_status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#e5e0d5]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#1e3a5f]">Organizations</CardTitle>
                <CardDescription>Manage tutoring agencies and their access</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#c9a227] hover:bg-[#b8921f] text-[#1e3a5f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Organization Name *</Label>
                        <Input
                          placeholder="e.g., Princeton Tutoring"
                          value={newOrg.name}
                          onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Slug *</Label>
                        <div className="relative">
                          <Input
                            placeholder="e.g., princeton-tutoring"
                            value={newOrg.slug}
                            onChange={(e) => {
                              const normalized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                              setNewOrg({ ...newOrg, slug: normalized })
                              checkSlugAvailability(normalized)
                            }}
                            className={
                              slugStatus === 'taken' ? 'border-red-400 pr-8' :
                              slugStatus === 'available' ? 'border-green-400 pr-8' : 'pr-8'
                            }
                          />
                          {slugStatus === 'checking' && (
                            <Loader2 className="w-4 h-4 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          )}
                          {slugStatus === 'available' && (
                            <CheckCircle2 className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" />
                          )}
                          {slugStatus === 'taken' && (
                            <XCircle className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500" />
                          )}
                        </div>
                        {slugStatus === 'taken' && (
                          <p className="text-xs text-red-500">This slug is already in use</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Billing Email</Label>
                      <Input
                        type="email"
                        placeholder="billing@example.com"
                        value={newOrg.billing_email}
                        onChange={(e) => setNewOrg({ ...newOrg, billing_email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Plan Type</Label>
                        <Select
                          value={newOrg.plan_type}
                          onValueChange={(value) => setNewOrg({ ...newOrg, plan_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Assessment Price ($)</Label>
                        <Input
                          type="number"
                          value={newOrg.assessment_price}
                          onChange={(e) => setNewOrg({ ...newOrg, assessment_price: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Students</Label>
                        <Input
                          type="number"
                          value={newOrg.max_students}
                          onChange={(e) => setNewOrg({ ...newOrg, max_students: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Admins</Label>
                        <Input
                          type="number"
                          value={newOrg.max_admins}
                          onChange={(e) => setNewOrg({ ...newOrg, max_admins: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newOrg.primary_color}
                            onChange={(e) => setNewOrg({ ...newOrg, primary_color: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={newOrg.primary_color}
                            onChange={(e) => setNewOrg({ ...newOrg, primary_color: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newOrg.secondary_color}
                            onChange={(e) => setNewOrg({ ...newOrg, secondary_color: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={newOrg.secondary_color}
                            onChange={(e) => setNewOrg({ ...newOrg, secondary_color: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateOrg}
                      disabled={isCreating || !newOrg.name || !newOrg.slug || slugStatus === 'taken' || slugStatus === 'checking'}
                      className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Organization'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-12 text-[#5a7a9a]">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No organizations yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: org.primary_color }}
                              />
                              <p className="font-medium text-[#1e3a5f]">{org.name}</p>
                              {org.settings?.platformOwner && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">Platform</Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#5a7a9a]">/{org.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(org.plan_type)}>
                            {org.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(org.subscription_status)}>
                            {org.subscription_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {org.students?.[0]?.count || 0} / {org.max_students}
                        </TableCell>
                        <TableCell>
                          {org.assessments?.[0]?.count || 0}
                        </TableCell>
                        <TableCell>
                          ${org.assessment_price}
                        </TableCell>
                        <TableCell className="text-sm text-[#5a7a9a]">
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/admin?org=${org.slug}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!org.settings?.platformOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteOrg(org.id, org.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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
      </main>
    </div>
  )
}
