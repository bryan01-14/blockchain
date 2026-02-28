"use client"

import { useAuth, type UserRole } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Globe } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  /** Si défini, l'accès est autorisé si le rôle de l'utilisateur est dans cette liste. */
  requiredRoles?: UserRole[]
  fallbackUrl?: string
}

function userHasAccess(role: UserRole | undefined, requiredRole?: UserRole, requiredRoles?: UserRole[]): boolean {
  if (requiredRoles?.length) return !!role && requiredRoles.includes(role)
  if (requiredRole) return role === requiredRole
  return true
}

export function AuthGuard({ children, requiredRole, requiredRoles, fallbackUrl }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace(fallbackUrl || "/login")
      return
    }

    const allowed = userHasAccess(user?.role, requiredRole, requiredRoles)
    if (!allowed) {
      if (user?.role === "admin") {
        router.replace("/admin")
      } else if (user?.role === "guide") {
        router.replace("/guide")
      } else if (user?.role === "tourist") {
        router.replace("/sites")
      } else {
        router.replace(fallbackUrl || "/login")
      }
      return
    }

    // Small delay for smooth entrance
    const timer = setTimeout(() => setShowContent(true), 50)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, requiredRole, requiredRoles, isLoading, router, fallbackUrl])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Globe className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="absolute -inset-2 animate-spin rounded-2xl border-2 border-primary/20 border-t-primary" style={{ animationDuration: "1.2s" }} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-semibold text-foreground">VisitSecure CI</p>
            <p className="text-xs text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (!userHasAccess(user?.role, requiredRole, requiredRoles)) return null

  return (
    <div className={`transition-all duration-300 ease-out ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {children}
    </div>
  )
}
