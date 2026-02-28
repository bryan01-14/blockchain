"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, Eye, EyeOff, AlertCircle, ArrowRight, User, Compass } from "lucide-react"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"tourist" | "guide">("tourist")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register, isAuthenticated, isAdmin, isTourist, isGuide } = useAuth()
  const router = useRouter()

  // Prefetch des pages cibles pour navigation instantanée après connexion
  useEffect(() => {
    router.prefetch("/sites")
    router.prefetch("/admin")
    router.prefetch("/guide")
  }, [router])

  // Si déjà connecté, redirection immédiate
  useEffect(() => {
    if (!isAuthenticated) return
    if (isAdmin) router.replace("/admin")
    else if (isGuide) router.replace("/guide")
    else if (isTourist) router.replace("/sites")
  }, [isAuthenticated, isAdmin, isGuide, isTourist, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "login") {
      const result = await login(email, password)
      setLoading(false)
      if (result.success) {
        if (result.role === "admin") router.replace("/admin")
        else if (result.role === "guide") router.replace("/guide")
        else router.replace("/sites")
      } else {
        setError(result.error || "Une erreur est survenue.")
      }
    } else {
      const result = await register(name, email, password, role)
      setLoading(false)
      if (result.success) {
        router.replace(role === "guide" ? "/guide" : "/sites")
      } else {
        setError(result.error || "Une erreur est survenue.")
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - image */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/images/culture-hero.jpg"
          alt="Patrimoine culturel ivoirien"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-background">
                VisitSecure
              </span>
              <span className="text-[10px] leading-tight text-background/70">
                {"C\u00f4te d'Ivoire"}
              </span>
            </div>
          </Link>
          <div>
            <h2 className="max-w-md text-balance text-3xl font-bold text-background">
              {"Bienvenue sur VisitSecure CI"}
            </h2>
            <p className="mt-3 max-w-md text-pretty text-background/70">
              {"Connectez-vous pour acc\u00e9der \u00e0 la plateforme de tourisme culturel blockchain de la C\u00f4te d'Ivoire."}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:max-w-lg">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
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

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="px-0 lg:px-6">
              <CardTitle className="text-2xl">
                {mode === "login" ? "Connexion" : "Inscription"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Connectez-vous avec votre compte touriste, guide ou administrateur."
                  : "Choisissez votre r\u00f4le et cr\u00e9ez votre compte."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {mode === "register" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        R\u00f4le
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRole("tourist")}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                            role === "tourist" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary/50"
                          }`}
                        >
                          <User className="h-4 w-4" />
                          Touriste
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("guide")}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                            role === "guide" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary/50"
                          }`}
                        >
                          <Compass className="h-4 w-4" />
                          Guide
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role === "guide"
                          ? "En tant que guide, vous devrez soumettre votre CNI dans l'application avant de proposer des services."
                          : "D\u00e9couvrez les sites culturels et r\u00e9servez des visites guid\u00e9es."}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nom complet
                      </label>
                      <Input
                        placeholder="Kouame Aya"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="votre@email.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive animate-in fade-in-0 duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="btn-press w-full">
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      {mode === "login" ? "Se connecter" : "Cr\u00e9er mon compte"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {mode === "login" && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {"Pas encore de compte ? "}
                  <button
                    onClick={() => { setMode("register"); setError("") }}
                    className="font-medium text-primary hover:underline"
                  >
                    {"S'inscrire"}
                  </button>
                </div>
              )}

              {mode === "register" && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {"D\u00e9j\u00e0 un compte ? "}
                  <button
                    onClick={() => { setMode("login"); setError("") }}
                    className="font-medium text-primary hover:underline"
                  >
                    Se connecter
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <div className="rounded-lg border border-border bg-secondary/50 p-3">
                  <p className="mb-1 text-xs font-semibold text-foreground">Compte Touriste :</p>
                  <p className="text-xs text-muted-foreground">
                    Email : <span className="font-mono">touriste@mail.ci</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mot de passe : <span className="font-mono">touriste123</span>
                  </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-primary">Compte Administrateur :</p>
                  <p className="text-xs text-muted-foreground">
                    Email : <span className="font-mono">admin@visitsecure.ci</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mot de passe : <span className="font-mono">admin123</span>
                  </p>
                </div>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-accent">Compte Guide :</p>
                  <p className="text-xs text-muted-foreground">
                    Email : <span className="font-mono">koffi.jb@mail.ci</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mot de passe : <span className="font-mono">guide123</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
