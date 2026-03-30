"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Check, DollarSign, Users, TrendingUp, LogOut } from "lucide-react"
import { toast } from "sonner"

interface PartnerData {
  id: string
  name: string
  email: string
  referral_code: string
  status: string
  discount_tier: { name: string; discount_percent: number; commission_percent: number } | null
}

interface Student {
  id: string
  student_name: string
  payment_status: string
  sale_amount: number | null
  commission_amount: number | null
  completed: boolean
  created_at: string
  assessment_id: string | null
  assessment_status: string
  student_archetype: string | null
  competitiveness_score: number | null
  completed_at: string | null
}

interface Commission {
  id: string
  commission_amount: number
  paid_out: boolean
  created_at: string
}

interface PaymentInfo {
  preferred_method: string
  venmo_username: string | null
  paypal_email: string | null
  zelle_phone: string | null
  zelle_email: string | null
  bank_account_holder: string | null
  bank_routing_number: string | null
  bank_account_last4: string | null
  other_instructions: string | null
  contact_phone: string | null
  contact_email: string | null
}

interface Stats {
  totalStudents: number
  completedStudents: number
  totalEarned: number
  unpaidBalance: number
  totalPaidOut: number
}

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [copied, setCopied] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)

  // Payment form state
  const [preferredMethod, setPreferredMethod] = useState("venmo")
  const [venmoUsername, setVenmoUsername] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [zellePhone, setZellePhone] = useState("")
  const [zelleEmail, setZelleEmail] = useState("")
  const [bankAccountHolder, setBankAccountHolder] = useState("")
  const [bankRoutingNumber, setBankRoutingNumber] = useState("")
  const [bankAccountLast4, setBankAccountLast4] = useState("")
  const [otherInstructions, setOtherInstructions] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await fetch("/api/partner/me")
      if (res.status === 401) {
        router.push("/partner/login")
        return
      }
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }

      setPartner(data.partner)
      setStats(data.stats)
      setStudents(data.students)
      setCommissions(data.commissions)

      // Populate payment form
      if (data.paymentInfo) {
        const pi = data.paymentInfo
        setPreferredMethod(pi.preferred_method || "venmo")
        setVenmoUsername(pi.venmo_username || "")
        setPaypalEmail(pi.paypal_email || "")
        setZellePhone(pi.zelle_phone || "")
        setZelleEmail(pi.zelle_email || "")
        setBankAccountHolder(pi.bank_account_holder || "")
        setBankRoutingNumber(pi.bank_routing_number || "")
        setBankAccountLast4(pi.bank_account_last4 || "")
        setOtherInstructions(pi.other_instructions || "")
        setContactPhone(pi.contact_phone || "")
        setContactEmail(pi.contact_email || "")
      }
    } catch {
      toast.error("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!partner) return
    const link = `${window.location.origin}/?ref=${partner.referral_code}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Referral link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await fetch("/api/partner/login", { method: "DELETE" })
    router.push("/partner/login")
  }

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPayment(true)
    try {
      const res = await fetch("/api/partner/payment-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_method: preferredMethod,
          venmo_username: venmoUsername,
          paypal_email: paypalEmail,
          zelle_phone: zellePhone,
          zelle_email: zelleEmail,
          bank_account_holder: bankAccountHolder,
          bank_routing_number: bankRoutingNumber,
          bank_account_last4: bankAccountLast4,
          other_instructions: otherInstructions,
          contact_phone: contactPhone,
          contact_email: contactEmail,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Payment preferences saved!")
      } else {
        toast.error(data.error || "Failed to save")
      }
    } catch {
      toast.error("Failed to save payment info")
    } finally {
      setSavingPayment(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a227]" />
      </div>
    )
  }

  if (!partner || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <p className="text-[#5a7a9a]">Unable to load dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Nav */}
      <nav className="border-b border-[#e5e0d5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="The Student Blueprint Logo" width={40} height={40} className="object-contain" />
            <h1 className="text-lg tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="font-bold text-[#1E2849]">TheStudent</span>
              <span className="font-semibold text-[#af8f5b]">Blueprint</span>
            </h1>
            <span className="text-sm text-[#5a7a9a] hidden sm:inline">Partner Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#5a7a9a] hover:text-[#1e3a5f]">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Welcome, {partner.name}</h2>
              {partner.discount_tier && (
                <p className="text-sm text-[#5a7a9a] mt-1">
                  {partner.discount_tier.name} &mdash; {partner.discount_tier.discount_percent}% student discount, {partner.discount_tier.commission_percent}% commission
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#1e3a5f] text-white text-sm px-3 py-1">
                {partner.referral_code}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="border-[#e5e0d5] text-[#1e3a5f]">
                {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Revenue Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-[#e5e0d5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a5f]/10">
                    <DollarSign className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#5a7a9a]">Total Earned</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">{formatCurrency(stats.totalEarned)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#e5e0d5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#c9a227]/10">
                    <TrendingUp className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#5a7a9a]">Unpaid Balance</p>
                    <p className="text-2xl font-bold text-[#c9a227]">{formatCurrency(stats.unpaidBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#e5e0d5] bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#5a7a9a]">Total Paid Out</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaidOut)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Referred Students Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border border-[#e5e0d5] bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">
                Referred Students ({stats.totalStudents})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto text-[#e5e0d5] mb-3" />
                  <p className="text-[#5a7a9a]">No referred students yet.</p>
                  <p className="text-sm text-[#5a7a9a] mt-1">Share your referral link to start earning commissions!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e5e0d5]">
                        <th className="text-left py-3 px-2 text-[#5a7a9a] font-medium">Student Name</th>
                        <th className="text-left py-3 px-2 text-[#5a7a9a] font-medium">Assessment Status</th>
                        <th className="text-right py-3 px-2 text-[#5a7a9a] font-medium">Score</th>
                        <th className="text-right py-3 px-2 text-[#5a7a9a] font-medium">Commission</th>
                        <th className="text-right py-3 px-2 text-[#5a7a9a] font-medium">Date</th>
                        <th className="text-center py-3 px-2 text-[#5a7a9a] font-medium">Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-[#e5e0d5]/50 hover:bg-[#faf8f3]">
                          <td className="py-3 px-2">
                            <div className="text-[#1e3a5f] font-medium">{student.student_name}</div>
                            {student.student_archetype && (
                              <div className="text-xs text-[#c9a227]">{student.student_archetype}</div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              className={
                                student.assessment_status === "completed"
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : student.assessment_status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : student.assessment_status === "partial"
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                              }
                            >
                              {student.assessment_status === "completed" ? "Completed" :
                               student.assessment_status === "in_progress" ? "In Progress" :
                               student.assessment_status === "partial" ? "Partial" : "Not Started"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right text-[#1e3a5f] font-medium">
                            {student.competitiveness_score != null ? `${student.competitiveness_score}/100` : "---"}
                          </td>
                          <td className="py-3 px-2 text-right text-[#c9a227] font-medium">
                            {student.commission_amount != null ? formatCurrency(student.commission_amount) : "---"}
                          </td>
                          <td className="py-3 px-2 text-right text-[#5a7a9a]">{formatDate(student.created_at)}</td>
                          <td className="py-3 px-2 text-center">
                            {student.assessment_status === "completed" && student.assessment_id ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                                onClick={() => window.open(`/results/${student.assessment_id}`, '_blank')}
                              >
                                View
                              </Button>
                            ) : (
                              <span className="text-xs text-[#5a7a9a]">---</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Preferences Form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border border-[#e5e0d5] bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-[#1e3a5f]">Payment Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePayment} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[#1e3a5f] font-medium">Preferred Payment Method</Label>
                  <RadioGroup value={preferredMethod} onValueChange={setPreferredMethod} className="flex flex-wrap gap-4">
                    {[
                      { value: "venmo", label: "Venmo" },
                      { value: "paypal", label: "PayPal" },
                      { value: "zelle", label: "Zelle" },
                      { value: "bank", label: "Bank Transfer" },
                      { value: "other", label: "Other" },
                    ].map((method) => (
                      <div key={method.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={method.value} id={`method-${method.value}`} />
                        <Label htmlFor={`method-${method.value}`} className="text-[#1e3a5f] cursor-pointer">
                          {method.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Conditional fields */}
                {preferredMethod === "venmo" && (
                  <div className="space-y-2">
                    <Label htmlFor="venmo_username" className="text-[#1e3a5f]">Venmo Username</Label>
                    <Input
                      id="venmo_username"
                      placeholder="@username"
                      value={venmoUsername}
                      onChange={(e) => setVenmoUsername(e.target.value)}
                      className="border-[#e5e0d5] max-w-md"
                    />
                  </div>
                )}

                {preferredMethod === "paypal" && (
                  <div className="space-y-2">
                    <Label htmlFor="paypal_email" className="text-[#1e3a5f]">PayPal Email</Label>
                    <Input
                      id="paypal_email"
                      type="email"
                      placeholder="you@example.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="border-[#e5e0d5] max-w-md"
                    />
                  </div>
                )}

                {preferredMethod === "zelle" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="zelle_phone" className="text-[#1e3a5f]">Zelle Phone</Label>
                      <Input
                        id="zelle_phone"
                        placeholder="(555) 123-4567"
                        value={zellePhone}
                        onChange={(e) => setZellePhone(e.target.value)}
                        className="border-[#e5e0d5]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zelle_email" className="text-[#1e3a5f]">Zelle Email</Label>
                      <Input
                        id="zelle_email"
                        type="email"
                        placeholder="you@example.com"
                        value={zelleEmail}
                        onChange={(e) => setZelleEmail(e.target.value)}
                        className="border-[#e5e0d5]"
                      />
                    </div>
                  </div>
                )}

                {preferredMethod === "bank" && (
                  <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_holder" className="text-[#1e3a5f]">Account Holder Name</Label>
                      <Input
                        id="bank_account_holder"
                        placeholder="Full name on account"
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value)}
                        className="border-[#e5e0d5]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_routing_number" className="text-[#1e3a5f]">Routing Number</Label>
                        <Input
                          id="bank_routing_number"
                          placeholder="123456789"
                          value={bankRoutingNumber}
                          onChange={(e) => setBankRoutingNumber(e.target.value)}
                          className="border-[#e5e0d5]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank_account_last4" className="text-[#1e3a5f]">Last 4 of Account #</Label>
                        <Input
                          id="bank_account_last4"
                          placeholder="1234"
                          maxLength={4}
                          value={bankAccountLast4}
                          onChange={(e) => setBankAccountLast4(e.target.value)}
                          className="border-[#e5e0d5]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {preferredMethod === "other" && (
                  <div className="space-y-2 max-w-lg">
                    <Label htmlFor="other_instructions" className="text-[#1e3a5f]">Payment Instructions</Label>
                    <Textarea
                      id="other_instructions"
                      placeholder="Describe how you'd like to receive payments..."
                      value={otherInstructions}
                      onChange={(e) => setOtherInstructions(e.target.value)}
                      className="border-[#e5e0d5] min-h-[100px]"
                    />
                  </div>
                )}

                {/* Contact fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="text-[#1e3a5f]">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      placeholder="(555) 123-4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="border-[#e5e0d5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-[#1e3a5f]">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="border-[#e5e0d5]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={savingPayment}
                  className="bg-[#c9a227] hover:bg-[#b8921f] text-white"
                >
                  {savingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Payment Preferences"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
