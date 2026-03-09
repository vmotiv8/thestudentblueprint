"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  FileText, 
  Users, 
  Trophy, 
  Rocket,
  Loader2,
  ArrowLeft,
  Search,
  ExternalLink,
  Globe,
  Upload
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface Resource {
  id: string
  type: string
  title: string
  description: string
  file_url: string
  created_at: string
}

export default function KnowledgeHub() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<Resource[]>([])
  const [organization, setOrganization] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newResource, setNewResource] = useState({
    type: "course_catalog",
    title: "",
    description: "",
    file_url: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [orgRes, resourcesRes] = await Promise.all([
        fetch("/api/platform/organizations/me"),
        fetch("/api/agency/knowledge-hub")
      ])
      
      const orgData = await orgRes.json()
      const resourcesData = await resourcesRes.json()
      
      setOrganization(orgData)
      setResources(resourcesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load knowledge hub")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.")
      return
    }

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/agency/knowledge-hub/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setNewResource(prev => ({ ...prev, file_url: data.url }))
        setUploadedFileName(file.name)
        if (!newResource.title) {
          setNewResource(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, ''), file_url: data.url }))
        }
        toast.success("File uploaded")
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.type) {
      toast.error("Please fill in the required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/agency/knowledge-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResource)
      })

      if (response.ok) {
        toast.success("Resource added successfully")
        setShowAddDialog(false)
        setNewResource({ type: "course_catalog", title: "", description: "", file_url: "" })
        setUploadedFileName("")
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add resource")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    try {
      const response = await fetch(`/api/agency/knowledge-hub?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Resource deleted")
        fetchData()
      } else {
        toast.error("Failed to delete resource")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const primaryColor = organization?.primary_color || '#1e3a5f'
  const secondaryColor = organization?.secondary_color || '#c9a227'

  if (loading && !organization) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Header */}
      <nav className="text-white sticky top-0 z-50 shadow-xl border-b border-white/5" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/agency" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {organization?.logo_url ? (
                <Image src={organization.logo_url} alt="Logo" width={42} height={42} className="w-9 h-9 object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                  {organization?.name?.[0] || 'A'}
                </div>
              )}
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {organization?.name || 'Agency'} Hub
              </span>
            </Link>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.push("/agency")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 p-8 bg-white rounded-3xl border border-[#e5e0d5] shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-amber-50 text-[#c9a227]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: primaryColor }}>
                  Knowledge Hub
                </h1>
              </div>
              <p className="text-[#5a7a9a] text-lg font-medium">Upload school course catalogs, clubs, and extracurricular resources</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-2xl font-black shadow-lg" style={{ backgroundColor: primaryColor, color: 'white' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-[32px] p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#0a192f]">Add Resource</DialogTitle>
                    <DialogDescription className="text-lg font-medium">Upload a new resource to your school's hub</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Resource Type</Label>
                      <Select 
                        value={newResource.type} 
                        onValueChange={(v) => setNewResource({...newResource, type: v})}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course_catalog">Course Catalog</SelectItem>
                          <SelectItem value="clubs">Clubs & Societies</SelectItem>
                          <SelectItem value="competitions">Local Competitions</SelectItem>
                          <SelectItem value="extracurriculars">Extracurricular List</SelectItem>
                          <SelectItem value="other">Other Resource</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        placeholder="e.g., Grade 11 Course Guide 2026"
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea 
                        placeholder="Describe the resource..."
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload File or Enter URL</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp"
                        onChange={handleFileUpload}
                      />
                      <div
                        className="border-2 border-dashed border-[#e5e0d5] rounded-xl p-4 text-center cursor-pointer hover:border-[#c9a227] hover:bg-amber-50/30 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingFile ? (
                          <div className="flex items-center justify-center gap-2 py-2">
                            <Loader2 className="w-5 h-5 animate-spin text-[#5a7a9a]" />
                            <span className="text-sm text-[#5a7a9a]">Uploading...</span>
                          </div>
                        ) : uploadedFileName ? (
                          <div className="flex items-center justify-center gap-2 py-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-bold text-green-700">{uploadedFileName}</span>
                          </div>
                        ) : (
                          <div className="py-2">
                            <Upload className="w-6 h-6 mx-auto mb-1 text-[#5a7a9a]" />
                            <p className="text-sm font-bold text-[#5a7a9a]">Click to upload a file</p>
                            <p className="text-xs text-[#5a7a9a]/60">PDF, Word, Excel, CSV, or images (max 10MB)</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 border-t border-[#e5e0d5]" />
                        <span className="text-xs font-bold text-[#5a7a9a]">OR</span>
                        <div className="flex-1 border-t border-[#e5e0d5]" />
                      </div>
                      <Input
                        placeholder="Paste a URL..."
                        value={uploadedFileName ? '' : newResource.file_url}
                        onChange={(e) => {
                          setNewResource({...newResource, file_url: e.target.value})
                          setUploadedFileName("")
                        }}
                        className="h-12 rounded-xl"
                        disabled={!!uploadedFileName}
                      />
                    </div>
                    <Button 
                      onClick={handleAddResource}
                      disabled={isSubmitting || !newResource.title}
                      className="w-full h-14 rounded-2xl font-black text-lg shadow-lg"
                      style={{ backgroundColor: primaryColor, color: 'white' }}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                      Add to Knowledge Hub
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="border-[#e5e0d5] rounded-[32px] overflow-hidden bg-white shadow-sm">
            <CardHeader className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-[#0a192f]">Resource Repository</CardTitle>
                  <CardDescription className="text-[#5a7a9a]">Manage your uploaded documents and lists</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a9a]" />
                  <Input
                    placeholder="Search resources..."
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
                    <TableHead className="px-8 font-bold text-[#0a192f]">Resource</TableHead>
                    <TableHead className="font-bold text-[#0a192f]">Type</TableHead>
                    <TableHead className="font-bold text-[#0a192f]">Uploaded</TableHead>
                    <TableHead className="px-8 text-right font-bold text-[#0a192f]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-[#5a7a9a]">
                          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium">No resources found</p>
                          <p className="text-sm">Start by adding your first school resource</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResources.map((resource) => (
                      <TableRow key={resource.id} className="border-[#e5e0d5] hover:bg-[#faf8f3]/50 transition-colors">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
                              {resource.type === 'course_catalog' && <FileText className="w-6 h-6" />}
                              {resource.type === 'clubs' && <Users className="w-6 h-6" />}
                              {resource.type === 'competitions' && <Trophy className="w-6 h-6" />}
                              {resource.type === 'extracurriculars' && <Rocket className="w-6 h-6" />}
                              {resource.type === 'other' && <BookOpen className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-black text-[#0a192f] text-lg">{resource.title}</p>
                              <p className="text-sm text-[#5a7a9a] max-w-md truncate">{resource.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider bg-gray-50 text-gray-700 border border-gray-100">
                            {resource.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-[#5a7a9a] font-medium">
                            {new Date(resource.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <div className="flex justify-end gap-2">
                            {resource.file_url && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="rounded-xl h-11 w-11 p-0 text-[#1e3a5f] hover:bg-blue-50"
                                onClick={() => window.open(resource.file_url, '_blank')}
                              >
                                <ExternalLink className="w-5 h-5" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="rounded-xl h-11 w-11 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteResource(resource.id)}
                            >
                              <Trash2 className="w-5 h-5" />
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
        </motion.div>
      </main>
    </div>
  )
}
