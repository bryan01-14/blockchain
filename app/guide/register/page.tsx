"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Globe } from "lucide-react"

export default function GuideRegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isGuide, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated && isGuide) {
      router.replace("/guide")
      return
    }
    router.replace("/login")
  }, [isAuthenticated, isGuide, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <Globe className="h-14 w-14 text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }
  return null
}

