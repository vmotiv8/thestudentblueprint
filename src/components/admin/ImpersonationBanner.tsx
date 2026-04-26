'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ImpersonationState {
  impersonating: boolean
  originalAdmin?: {
    id: string
    email: string
    name: string
  }
}

export function ImpersonationBanner() {
  const router = useRouter()
  const [state, setState] = useState<ImpersonationState>({ impersonating: false })
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    checkImpersonation()
  }, [])

  const checkImpersonation = async () => {
    try {
      const res = await fetch('/api/admin/impersonate')
      const data = await res.json()
      setState(data)
    } catch {
      // Silently fail - not critical
    }
  }

  const handleEndImpersonation = async () => {
    setEnding(true)
    try {
      const res = await fetch('/api/admin/impersonate', { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast.success('Returned to super admin view')
        router.push('/admin')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to end impersonation')
      }
    } catch {
      toast.error('Failed to end impersonation')
    } finally {
      setEnding(false)
    }
  }

  if (!state.impersonating) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4" />
          <span className="font-medium">
            Viewing as agency admin
            {state.originalAdmin && (
              <span className="opacity-75 ml-2">
                (logged in as {state.originalAdmin.name})
              </span>
            )}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 hover:text-white h-7 px-3 font-bold"
          onClick={handleEndImpersonation}
          disabled={ending}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Super Admin
        </Button>
      </div>
    </div>
  )
}
