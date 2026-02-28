"use client"

import { useState } from "react"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { StatCardSkeleton, ChartSkeleton } from "@/components/skeletons"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import type { Guide, CulturalSite } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  Ticket,
  Shield,
  Map,
  Award,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
<<<<<<< HEAD
  IdCard,
=======
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DashboardStats {
  totalVisitors: number
  totalRevenue: number
  totalTicketsSold: number
  activeGuides: number
  sitesCount: number
  fraudsPrevented: number
  monthlyGrowth: number
  satisfactionRate: number
  monthlyData: { month: string; visitors: number; revenue: number }[]
}

function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  suffix,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string
  numericValue?: number
  suffix?: string
  trend?: number
}) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const animatedCount = useCountUp(numericValue ?? 0, 1500, isVisible)
  const displayValue = numericValue != null ? animatedCount.toLocaleString("fr-FR") : value

  return (
    <Card className="card-hover-lift">
      <CardContent className="pt-6" ref={ref}>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          {trend != null && trend > 0 && (
            <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
              <TrendingUp className="mr-1 h-3 w-3" />+{trend}%
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-card-foreground">
            {displayValue}
            {suffix && (
              <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function GuideRow({
  guide,
  onAction,
}: {
  guide: Guide
  onAction: (id: string, action: "approve" | "reject") => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {guide.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">{guide.name}</p>
          <p className="text-xs text-muted-foreground">
            {guide.speciality} - {guide.email}
          </p>
<<<<<<< HEAD
          {(guide.documents as { nameOnCni?: string })?.nameOnCni && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Nom sur CNI : {((guide.documents as { nameOnCni: string }).nameOnCni)}
            </p>
          )}
          {guide.documents?.cniNumber && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <IdCard className="h-3 w-3 text-primary" />
              CNI&nbsp;:
              <span className="font-mono">
                ****{guide.documents.cniNumber.slice(-4)}
              </span>
              {(guide.documents as { cniDocumentUrl?: string; cniDocumentData?: string }).cniDocumentUrl ? (
                <a
                  href={(guide.documents as { cniDocumentUrl: string }).cniDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-primary hover:underline"
                >
                  Voir
                </a>
              ) : (guide.documents as { cniDocumentData?: string }).cniDocumentData ? (
                <a
                  href={`/api/guide/cni-document?guideId=${guide.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-primary hover:underline"
                >
                  Voir
                </a>
              ) : null}
            </p>
          )}
=======
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          {guide.rating}
        </div>
        <div className="text-sm text-muted-foreground">{guide.totalTours} visites</div>
<<<<<<< HEAD
        {guide.status === "pending_cni" ? (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
            En attente de CNI
          </Badge>
        ) : guide.status === "pending" ? (
=======
        {guide.status === "pending" ? (
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="btn-press border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => onAction(guide.id, "approve")}
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Valider
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="btn-press border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => onAction(guide.id, "reject")}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Refuser
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className={
              guide.status === "approved"
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }
          >
            {guide.status === "approved" ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {guide.status === "approved" ? "Certifie" : "Refuse"}
          </Badge>
        )}
      </div>
    </div>
  )
}

const COLORS = [
  "oklch(0.55 0.16 45)",
  "oklch(0.60 0.14 145)",
  "oklch(0.65 0.12 250)",
  "oklch(0.70 0.15 80)",
  "oklch(0.50 0.10 30)",
]

export default function AdminPage() {
<<<<<<< HEAD
  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>("/api/admin/stats", fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })
  const { data: guidesData, mutate: mutateGuides } = useSWR<Guide[]>("/api/admin/guides", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  })
  const { data: sitesData } = useSWR<(CulturalSite & { published: boolean })[]>("/api/admin/sites", fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })
=======
  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>("/api/admin/stats", fetcher)
  const { data: guidesData, mutate: mutateGuides } = useSWR<Guide[]>("/api/admin/guides", fetcher)
  const { data: sitesData } = useSWR<(CulturalSite & { published: boolean })[]>("/api/admin/sites", fetcher)
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b

  const [localGuides, setLocalGuides] = useState<Guide[] | null>(null)
  const guides = localGuides ?? guidesData ?? []
  const sites = sitesData ?? []

  const handleGuideAction = async (id: string, action: "approve" | "reject") => {
    const status = action === "approve" ? "approved" : "rejected"

    // Optimistic update
    setLocalGuides(
      guides.map((g) =>
        g.id === id ? { ...g, status: status as Guide["status"], certified: action === "approve" } : g
      )
    )

    try {
      await fetch("/api/admin/guides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: id, status }),
      })
      mutateGuides()
    } catch {
      // Revert on error
      setLocalGuides(null)
    }
  }

  const visitorsBySite = sites.map((s) => ({
    name: s.name,
    visitors: s.visitors,
  }))

  if (statsLoading) {
    return (
      <AuthGuard requiredRole="admin">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="mb-8">
            <div className="skeleton-shimmer h-8 w-48" />
            <div className="skeleton-shimmer mt-3 h-5 w-80" />
          </div>
<<<<<<< HEAD
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
=======
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </main>
        <Footer />
      </AuthGuard>
    )
  }

  const s = stats ?? {
    totalVisitors: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeGuides: 0,
    sitesCount: 0,
    fraudsPrevented: 0,
    monthlyGrowth: 0,
    satisfactionRate: 0,
    monthlyData: [],
  }

  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Administration</h1>
=======
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
          <p className="mt-2 text-muted-foreground">
            {"Tableau de bord analytique et gestion de la plateforme"}
          </p>
        </div>

<<<<<<< HEAD
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
=======
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
          <StatCard icon={Users} label="Visiteurs Totaux" value={s.totalVisitors.toLocaleString("fr-FR")} numericValue={s.totalVisitors} trend={s.monthlyGrowth} />
          <StatCard icon={DollarSign} label="Revenus (FCFA)" value={s.totalRevenue.toLocaleString("fr-FR")} numericValue={s.totalRevenue} />
          <StatCard icon={Ticket} label="Billets Vendus" value={s.totalTicketsSold.toLocaleString("fr-FR")} numericValue={s.totalTicketsSold} />
          <StatCard icon={Shield} label="Fraudes Bloquees" value={s.fraudsPrevented.toString()} numericValue={s.fraudsPrevented} />
        </div>

<<<<<<< HEAD
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
=======
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
          <StatCard icon={Award} label="Guides Actifs" value={s.activeGuides.toString()} numericValue={s.activeGuides} />
          <StatCard icon={Map} label="Sites Culturels" value={s.sitesCount.toString()} numericValue={s.sitesCount} />
          <StatCard icon={TrendingUp} label="Croissance Mensuelle" value={s.monthlyGrowth.toString()} numericValue={s.monthlyGrowth} suffix="%" />
          <StatCard icon={Star} label="Taux de Satisfaction" value={s.satisfactionRate.toString()} numericValue={s.satisfactionRate} suffix="%" />
        </div>

        <Tabs defaultValue="analytics">
<<<<<<< HEAD
          <TabsList className="mb-6 flex w-full overflow-x-auto sm:w-fit">
=======
          <TabsList className="mb-6">
>>>>>>> 2ebbd2bcaa792b32929f85fec6b7c0c04ab6786b
            <TabsTrigger value="analytics">Analytique</TabsTrigger>
            <TabsTrigger value="guides">
              Guides
              {guides.filter((g) => g.status === "pending").length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {guides.filter((g) => g.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Visiteurs Mensuels</CardTitle>
                  <CardDescription>{"\u00c9volution des visiteurs sur les 6 derniers mois"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={s.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 80)" />
                      <XAxis dataKey="month" stroke="oklch(0.50 0.02 50)" fontSize={12} />
                      <YAxis stroke="oklch(0.50 0.02 50)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.90 0.02 80)", borderRadius: "8px" }} />
                      <Bar dataKey="visitors" fill="oklch(0.55 0.16 45)" radius={[4, 4, 0, 0]} name="Visiteurs" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenus Mensuels (FCFA)</CardTitle>
                  <CardDescription>{"Tendance des revenus touristiques"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={s.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 80)" />
                      <XAxis dataKey="month" stroke="oklch(0.50 0.02 50)" fontSize={12} />
                      <YAxis stroke="oklch(0.50 0.02 50)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.90 0.02 80)", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="revenue" stroke="oklch(0.60 0.14 145)" strokeWidth={2} dot={{ fill: "oklch(0.60 0.14 145)", r: 4 }} name="Revenus" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{"R\u00e9partition par Site"}</CardTitle>
                  <CardDescription>{"Nombre de visiteurs par site culturel"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-8 lg:flex-row">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={visitorsBySite}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="visitors"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {visitorsBySite.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.90 0.02 80)", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2">
                      {visitorsBySite.map((site, i) => (
                        <div key={site.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-sm text-foreground">{site.name}</span>
                          <span className="text-sm font-semibold text-foreground">{site.visitors.toLocaleString("fr-FR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Gestion des Guides
                </CardTitle>
                <CardDescription>{"Validez ou refusez les demandes de certification des guides touristiques"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {guides.map((guide) => (
                    <GuideRow key={guide.id} guide={guide} onAction={handleGuideAction} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Gestion des Sites Culturels
                </CardTitle>
                <CardDescription>{"Publication et gestion des sites culturels de la plateforme"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {sites.map((site) => (
                    <div key={site.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{site.name}</p>
                          {site.unesco && <Badge className="bg-accent text-accent-foreground">UNESCO</Badge>}
                          <Badge variant="secondary" className="capitalize">{site.category}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {site.location} - {site.price.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {site.visitors.toLocaleString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {site.rating}
                        </span>
                        <Badge variant="outline" className={site.published ? "border-accent/30 bg-accent/10 text-accent" : "border-border"}>
                          {site.published ? <><CheckCircle className="mr-1 h-3 w-3" />Publie</> : "Brouillon"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </AuthGuard>
  )
}
