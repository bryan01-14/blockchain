"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Globe,
  LayoutDashboard,
  Ticket,
  Shield,
  QrCode,
  Menu,
  X,
  Map,
  User,
  LogOut,
  LogIn,
  Palette,
  BookOpen,
  MessageCircle,
  Compass,
  ShoppingBag,
} from "lucide-react"

const touristLinks = [
  { href: "/", label: "Accueil", icon: Globe },
  { href: "/sites", label: "Sites Culturels", icon: Map },
  { href: "/marketplace", label: "Artisanat", icon: Palette },
  { href: "/stories", label: "Histoires", icon: BookOpen },
  { href: "/tickets", label: "Billets NFT", icon: Ticket },
  { href: "/assistant", label: "Assistant IA", icon: MessageCircle },
]

const adminLinks = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/verification", label: "Verification", icon: QrCode },
]

const guideLinks = [
  { href: "/guide", label: "Mon Dashboard", icon: LayoutDashboard },
  { href: "/verification", label: "Vérification", icon: QrCode },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, isGuide, logout } = useAuth()

  // Determine which nav links to show
  const navLinks = isAdmin
    ? adminLinks
    : isGuide
      ? guideLinks
      : isAuthenticated
        ? touristLinks
        : [{ href: "/", label: "Accueil", icon: Globe }]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-90 active:opacity-95" prefetch>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform duration-200 hover:scale-105">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">
              VisitSecure
            </span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              {"C\u00f4te d'Ivoire"}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "nav-link flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "nav-link-active bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs font-medium text-primary capitalize">
                    {user.role === "admin" ? "Administrateur" : user.role === "guide" ? "Guide Touristique" : "Touriste"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/verification" className="cursor-pointer">
                        <QrCode className="mr-2 h-4 w-4" />
                        Verification
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : isGuide ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/guide" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Mon Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sites" className="cursor-pointer">
                        <Map className="mr-2 h-4 w-4" />
                        Sites Culturels
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/sites" className="cursor-pointer">
                        <Map className="mr-2 h-4 w-4" />
                        Sites Culturels
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/marketplace" className="cursor-pointer">
                        <Palette className="mr-2 h-4 w-4" />
                        Artisanat
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tickets" className="cursor-pointer">
                        <Ticket className="mr-2 h-4 w-4" />
                        Mes Billets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/assistant" className="cursor-pointer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Assistant IA
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {"D\u00e9connexion"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Connexion
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Inscription</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden transition-transform duration-200 active:scale-95"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="nav-backdrop fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav-panel fixed left-0 right-0 top-[57px] z-50 max-h-[calc(100vh-57px)] overflow-y-auto border-t border-border bg-background px-4 pb-6 pt-3 shadow-lg lg:hidden">
          {/* Show user info on mobile if logged in */}
          {isAuthenticated && user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role === "admin" ? "Administrateur" : user.role === "guide" ? "Guide Touristique" : "Touriste"}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 active:scale-[0.99]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  handleLogout()
                  setMobileOpen(false)
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                {"D\u00e9connexion"}
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Inscription
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
