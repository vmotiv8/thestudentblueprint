"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, Sparkles, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
          toast.success("Welcome back!")
          router.push(data.redirectUrl || "/admin")
      } else {
        toast.error(data.error || "Invalid credentials")
      }
    } catch {
      toast.error("Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#faf8f3]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
            <div className="text-center mb-8">
<Image 
                  src="/logo.png" 
                  alt="The Student Blueprint Logo" 
                  width={64} 
                  height={64} 
                  className="mx-auto mb-4 object-contain"
                />
                <h1 className="text-3xl font-extrabold text-[#1e3a5f] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  The Student Blueprint
                </h1>
            </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-[#e5e0d5] bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-[#1e3a5f]">Login</CardTitle>
                <CardDescription className="text-[#5a7a9a]">Access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1e3a5f]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@vmotiv8.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#e5e0d5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#1e3a5f]">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-[#e5e0d5]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#c9a227] hover:bg-[#b8921f] text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
      </motion.div>
    </div>
  )
}