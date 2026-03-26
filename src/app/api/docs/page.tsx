"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Code2,
  Copy,
  Terminal,
  ArrowLeft,
  Key,
  Globe,
  Zap,
  ShieldCheck,
    Webhook,
    Play,
    CheckCircle2,
    FileText,
    UserPlus,
  } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

const API_DOCS = [
  {
    title: "Authentication",
    description: "Authenticate your requests using the 'x-api-key' header with your agency's secret API key.",
    method: "HEADER",
    endpoint: "x-api-key: sb_live_...",
    params: [],
    response: "Standard HTTP 401 if missing or invalid."
  },
  {
    title: "Invite Student",
    description: "Trigger a white-labeled assessment invitation email to a student.",
    method: "POST",
    endpoint: "/api/v1/assessments/invite",
    params: [
      { name: "email", type: "string", required: true, description: "Student's email address" },
      { name: "first_name", type: "string", required: false, description: "Student's first name" },
      { name: "coupon_code", type: "string", required: false, description: "Coupon code to apply" },
      { name: "message", type: "string", required: false, description: "Custom message to include in the invitation email" }
    ],
    response: '{ "success": true, "message": "Invitation sent" }'
  }
]

export default function APIDocumentation() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/me")
      const data = await response.json()
      if (data.admin) {
        setAdmin(data.admin)
      } else {
        router.push("/admin/login")
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const primaryColor = admin?.organization?.primary_color || '#0a192f'

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <nav className="bg-white border-b border-[#e5e0d5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/agency" className="text-[#5a7a9a] hover:text-[#0a192f] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6" style={{ color: primaryColor }} />
              <h1 className="text-xl font-bold text-[#0a192f]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>API Documentation</h1>
            </div>
          </div>
          <Badge variant="outline" className="border-[#c9a227] text-[#c9a227] px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
            v1.0.0 Stable
          </Badge>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-widest mb-4">Introduction</h3>
              <p className="text-sm text-[#5a7a9a] leading-relaxed">
                The The Student Blueprint API allows agencies to programmatically invite students, manage assessments, and retrieve results for integration into their own CRM or student portals.
              </p>
            </div>

            <div className="p-6 bg-[#0a192f] rounded-2xl text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Base URL</h4>
              </div>
              <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between group">
                <code className="text-xs font-mono text-white/80">https://thestudentblueprint.com</code>
                <button onClick={() => copyToClipboard('https://thestudentblueprint.com')} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-4 h-4 text-white/40 hover:text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-widest">Resources</h3>
              {[
                { icon: Terminal, label: "Authentication" },
                { icon: UserPlus, label: "Student Invites" },
                { icon: FileText, label: "Assessment Data" },
                { icon: Webhook, label: "Webhooks" }
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-[#5a7a9a] hover:text-[#0a192f] group">
                  <item.icon className="w-4 h-4 group-hover:text-[#c9a227]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {API_DOCS.map((doc, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0a192f]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{doc.title}</h2>
                    <p className="text-[#5a7a9a] mt-2">{doc.description}</p>
                  </div>
                  <Badge className={`
                    ${doc.method === 'POST' ? 'bg-green-100 text-green-700' : 
                      doc.method === 'GET' ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'}
                  `}>
                    {doc.method}
                  </Badge>
                </div>

                <div className="bg-[#1e3a5f] rounded-xl overflow-hidden shadow-lg border border-white/10">
                  <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Endpoint</span>
                    <button onClick={() => copyToClipboard(doc.endpoint)} className="text-white/40 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-4">
                    <code className="text-sm font-mono text-blue-100">{doc.endpoint}</code>
                  </div>
                </div>

                {doc.params.length > 0 && (
                  <div className="border border-[#e5e0d5] rounded-xl overflow-hidden bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#faf8f3]">
                          <TableHead className="w-[150px]">Parameter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doc.params.map((param, j) => (
                          <TableRow key={j}>
                            <TableCell className="font-mono text-sm font-bold text-[#0a192f]">{param.name}</TableCell>
                            <TableCell><Badge variant="outline">{param.type}</Badge></TableCell>
                            <TableCell>{param.required ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : "—"}</TableCell>
                            <TableCell className="text-sm text-[#5a7a9a]">{param.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#0a192f] uppercase tracking-widest">Example Response</p>
                  <pre className="bg-[#faf8f3] border border-[#e5e0d5] p-4 rounded-xl text-sm font-mono text-[#0a192f] overflow-x-auto">
                    {doc.response}
                  </pre>
                </div>

                {i < API_DOCS.length - 1 && <div className="h-px bg-[#e5e0d5] w-full mt-12" />}
              </motion.section>
            ))}

            <Card className="border-[#c9a227] bg-amber-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#c9a227]" />
                  Need Help?
                </CardTitle>
                <CardDescription>
                  Our engineering team is available to assist with custom integrations and higher rate limits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-[#0a192f] hover:bg-[#152a45]">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
