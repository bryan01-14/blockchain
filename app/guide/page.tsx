"use client"

import { useState } from "react"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { StatCardSkeleton } from "@/components/skeletons"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import { useAuth } from "@/lib/auth-context"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Compass,
  ShoppingBag,
  Plus,
  MapPin,
  AlertCircle,
  Camera,
  Upload,
  Bell,
  ShieldCheck,
  QrCode,
  IdCard,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface GuideStat {
  bookings: { total: number; confirmed: number; pending: number; completed: number; revenue: number }
  orders: { total: number; confirmed: number; pending: number; completed: number; revenue: number }
  totalRevenue: number
}

interface Booking {
  bookingId: string
  tourTitle: string
  siteName: string
  participantName: string
  participantEmail: string
  date: string
  time: string
  price: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  createdAt: string
}

interface CraftOrder {
  orderId: string
  craftName: string
  buyerName: string
  buyerEmail: string
  price: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  nftToken: string | null
  createdAt: string
}

interface Tour {
  tourId: string
  title: string
  site: string
  date: string
  time: string
  duration: string
  price: number
  maxSpots: number
  availableSpots: number
  status: string
  language?: string
  includes?: string[]
}

function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  suffix,
  color = "text-primary",
}: {
  icon: React.ElementType
  label: string
  value: string
  numericValue?: number
  suffix?: string
  color?: string
}) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const animatedCount = useCountUp(numericValue ?? 0, 1500, isVisible)
  const displayValue = numericValue != null ? animatedCount.toLocaleString("fr-FR") : value

  return (
    <Card className="card-hover-lift">
      <CardContent className="pt-6" ref={ref}>
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-card-foreground">
            {displayValue}
            {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const statusLabels: Record<string, { label: string; class: string }> = {
  confirmed: { label: "Confirme", class: "border-accent/30 bg-accent/10 text-accent" },
  pending: { label: "En attente", class: "border-orange-300 bg-orange-50 text-orange-600" },
  completed: { label: "Termine", class: "border-primary/30 bg-primary/10 text-primary" },
  cancelled: { label: "Annule", class: "border-destructive/30 bg-destructive/10 text-destructive" },
}

function StatusBadge({ status }: { status: string }) {
  const s = statusLabels[status] || { label: status, class: "" }
  return (
    <Badge variant="outline" className={s.class}>
      {status === "confirmed" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === "pending" && <AlertCircle className="mr-1 h-3 w-3" />}
      {status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === "cancelled" && <XCircle className="mr-1 h-3 w-3" />}
      {s.label}
    </Badge>
  )
}

interface GuideProfile {
  certified: boolean
  status: string
  cniSubmitted: boolean
  permanentId?: string
}

function CertificationBlock({
  email,
  certified,
  cniSubmitted,
  status,
  onSubmitted,
  guideName,
}: {
  email: string
  certified: boolean
  cniSubmitted: boolean
  status: string
  onSubmitted: () => void
  guideName: string
}) {
  const canResubmit = status === "rejected"
  const showForm = !cniSubmitted || canResubmit
  const [cniNumber, setCniNumber] = useState("")
  const [nameOnCni, setNameOnCni] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!cniNumber.trim() || cniNumber.trim().length < 6) {
      setError("Le numéro de CNI doit contenir au moins 6 caractères.")
      return
    }
    if (!nameOnCni.trim() || nameOnCni.trim().length < 3) {
      setError("Indiquez votre nom complet tel qu'il apparaît sur votre CNI (pour vérifier que la pièce vous appartient).")
      return
    }
    if (!file) {
      setError("Veuillez ajouter une photo ou un document de votre CNI.")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("cniNumber", cniNumber.trim())
      formData.append("nameOnCni", nameOnCni.trim())
      formData.append("cniFile", file)
      const res = await fetch("/api/guide/upload-cni", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi.")
      } else {
        setSuccess(data.message || "CNI soumise avec succès.")
        setCniNumber("")
        setNameOnCni("")
        setFile(null)
        onSubmitted()
      }
    } catch {
      setError("Erreur de connexion.")
    } finally {
      setLoading(false)
    }
  }

  if (certified) return null

  return (
    <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <ShieldCheck className="h-5 w-5" />
          Certification requise
        </CardTitle>
        <CardDescription>
          {canResubmit
            ? "Votre demande précédente a été refusée. Vous pouvez soumettre une nouvelle demande avec des documents corrigés ou complétés."
            : cniSubmitted
              ? "Votre CNI a été soumise. L'administrateur examine votre demande. Vous recevrez un message dans l'application dès qu'une décision sera prise."
              : "Pour proposer des visites, soumettez votre pièce d'identité (CNI). Le nom indiqué doit correspondre à votre nom d'inscription pour vérifier que la pièce vous appartient."}
        </CardDescription>
      </CardHeader>
      {showForm && (
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label className="text-foreground">Nom complet tel qu'il apparaît sur la CNI</Label>
              <Input
                value={nameOnCni}
                onChange={(e) => setNameOnCni(e.target.value)}
                placeholder={`Ex: ${guideName || "Prénom Nom"}`}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Saisissez exactement le nom et prénom figurant sur votre CNI pour vérifier que la pièce vous appartient.
              </p>
            </div>
            <div>
              <Label className="text-foreground">Numéro de CNI</Label>
              <Input
                value={cniNumber}
                onChange={(e) => setCniNumber(e.target.value)}
                placeholder="Numéro figurant sur la CNI"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-foreground">Document CNI (photo ou PDF)</Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Prenez une photo ou uploadez une image/PDF de votre CNI (max 4 Mo)
              </p>
              <div className="flex flex-wrap gap-2">
                <label
                  htmlFor="cni-camera-input"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  <Camera className="h-4 w-4" />
                  Prendre une photo
                </label>
                <input
                  id="cni-camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="cni-file-input"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/50"
                >
                  <Upload className="h-4 w-4" />
                  Choisir un fichier
                </label>
                <input
                  id="cni-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Fichier sélectionné : {file.name}
                </p>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}
            <Button type="submit" disabled={loading} className="btn-press w-fit">
              {loading ? "Envoi..." : canResubmit ? "Soumettre une nouvelle demande" : "Soumettre ma CNI"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}

function NewTourDialog({ guideName, guideEmail, onCreated, disabled }: { guideName: string; guideEmail: string; onCreated: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    site: "",
    description: "",
    date: "",
    time: "09:00",
    duration: "3h",
    price: "",
    maxSpots: "10",
    language: "Français",
    includes: "",
  })

  const handleSubmit = async () => {
    if (!form.title || !form.site || !form.date || !form.price) return
    setLoading(true)
    try {
      await fetch("/api/guide/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guide: guideName,
          guideEmail,
        }),
      })
      setOpen(false)
      setForm({
        title: "",
        site: "",
        description: "",
        date: "",
        time: "09:00",
        duration: "3h",
        price: "",
        maxSpots: "10",
        language: "Français",
        includes: "",
      })
      onCreated()
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <DialogTrigger asChild>
        <Button className="btn-press" disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Proposer une Visite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Visite Guidee</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titre de la visite</Label>
            <Input id="title" placeholder="ex: Visite Historique Coloniale" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="site">Site culturel</Label>
            <Input id="site" placeholder="ex: Grand-Bassam" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Decrivez la visite..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Heure</Label>
              <Input id="time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration">{"Dur\u00e9e"}</Label>
              <Input id="duration" placeholder="3h" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input id="price" type="number" placeholder="15000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxSpots">Places max</Label>
              <Input id="maxSpots" type="number" value={form.maxSpots} onChange={(e) => setForm({ ...form, maxSpots: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="language">Langue de la visite</Label>
              <Input
                id="language"
                placeholder="ex: Français, Anglais"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="includes">Ce qui est inclus</Label>
              <Input
                id="includes"
                placeholder="ex: Billet du site, transport, collation"
                value={form.includes}
                onChange={(e) => setForm({ ...form, includes: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Séparez les éléments par des virgules (ex: Billet, Transport, Collation).
              </p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !form.title || !form.site || !form.date || !form.price} className="btn-press">
            {loading ? "Enregistrement..." : "Publier la Visite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GuideDashboardPage() {
  const { user } = useAuth()
  const email = user?.email || ""
  const guideName = user?.name || ""

  const { data: profile, mutate: mutateProfile } = useSWR<GuideProfile>(
    email ? `/api/guide/profile?email=${encodeURIComponent(email)}` : null,
    fetcher,
    { refreshInterval: 4000, revalidateOnFocus: true }
  )
  const { data: stats, isLoading: statsLoading } = useSWR<GuideStat>(
    email ? `/api/guide/stats?email=${encodeURIComponent(email)}` : null,
    fetcher,
    { refreshInterval: 10000, revalidateOnFocus: true }
  )
  const { data: notificationsData } = useSWR<{ notifications: { id: string; message: string; read: boolean; type: string }[]; unreadCount: number }>(
    user?.id ? `/api/notifications?userId=${encodeURIComponent(user.id)}` : email ? `/api/notifications?email=${encodeURIComponent(email)}` : null,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true }
  )
  const { data: bookings, mutate: mutateBookings } = useSWR<Booking[]>(
    email ? `/api/guide/bookings?email=${encodeURIComponent(email)}` : null,
    fetcher,
    { refreshInterval: 15000, revalidateOnFocus: true }
  )
  const { data: orders, mutate: mutateOrders } = useSWR<CraftOrder[]>(
    email ? `/api/guide/orders?email=${encodeURIComponent(email)}` : null,
    fetcher,
    { refreshInterval: 15000, revalidateOnFocus: true }
  )
  const { data: tours, mutate: mutateTours } = useSWR<Tour[]>(
    guideName ? `/api/guide/tours?guide=${encodeURIComponent(guideName)}` : null,
    fetcher,
    { refreshInterval: 15000, revalidateOnFocus: true }
  )

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      await fetch("/api/guide/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      })
      mutateBookings()
    } catch {
      // silent
    }
  }

  const handleOrderAction = async (orderId: string, status: string) => {
    try {
      await fetch("/api/guide/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      })
      mutateOrders()
    } catch {
      // silent
    }
  }

  const s = stats ?? {
    bookings: { total: 0, confirmed: 0, pending: 0, completed: 0, revenue: 0 },
    orders: { total: 0, confirmed: 0, pending: 0, completed: 0, revenue: 0 },
    totalRevenue: 0,
  }

  const pendingBookingsCount = bookings?.filter((b) => b.status === "pending").length ?? 0
  const pendingOrdersCount = orders?.filter((o) => o.status === "pending").length ?? 0

  if (statsLoading) {
    return (
      <AuthGuard requiredRole="guide">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="mb-8">
            <div className="skeleton-shimmer h-8 w-64" />
            <div className="skeleton-shimmer mt-3 h-5 w-96" />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </main>
        <Footer />
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="guide">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {"Bienvenue, "}{guideName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {"G\u00e9rez vos visites, r\u00e9servations et commandes artisanales depuis votre tableau de bord."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 hover:bg-secondary"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {notificationsData && notificationsData.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {notificationsData.unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="border-b p-3">
                  <p className="font-semibold text-sm">Notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {!notificationsData?.notifications?.length ? (
                    <p className="p-4 text-sm text-muted-foreground">Aucune notification.</p>
                  ) : (
                    notificationsData.notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`border-b p-3 text-sm last:border-b-0 ${!n.read ? "bg-primary/5" : ""}`}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <NewTourDialog
              guideName={guideName}
              guideEmail={email}
              onCreated={() => mutateTours()}
              disabled={!profile?.certified}
            />
          </div>
        </div>

        {/* Bloc certification (CNI non soumise ou en attente) */}
        <CertificationBlock
          email={email}
          certified={profile?.certified ?? false}
          cniSubmitted={profile?.cniSubmitted ?? false}
          status={profile?.status ?? ""}
          onSubmitted={() => mutateProfile()}
          guideName={guideName}
        />

        {/* Identifiant permanent et QR code */}
        {profile?.permanentId && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IdCard className="h-5 w-5 text-primary" />
                Mon identifiant guide
              </CardTitle>
              <CardDescription>
                Votre identifiant permanent et votre QR code. Présentez ce QR pour vous identifier lors des vérifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">Identifiant permanent</p>
                <p className="font-mono text-lg font-bold text-foreground">{profile.permanentId}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-border bg-white p-2">
                  <img
                    src={`/api/guide/qr?email=${encodeURIComponent(email)}`}
                    alt="QR code guide"
                    className="h-full w-full object-contain"
                    width={128}
                    height={128}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Code QR</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/verification">
                  <QrCode className="mr-2 h-4 w-4" />
                  Vérifier un billet (ouvrir la caméra)
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Revenus Totaux (FCFA)"
            value={s.totalRevenue.toLocaleString("fr-FR")}
            numericValue={s.totalRevenue}
          />
          <StatCard
            icon={Compass}
            label={"R\u00e9servations"}
            value={s.bookings.total.toString()}
            numericValue={s.bookings.total}
          />
          <StatCard
            icon={ShoppingBag}
            label="Commandes Artisanat"
            value={s.orders.total.toString()}
            numericValue={s.orders.total}
          />
          <StatCard
            icon={TrendingUp}
            label={"Termin\u00e9es"}
            value={(s.bookings.completed + s.orders.completed).toString()}
            numericValue={s.bookings.completed + s.orders.completed}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 flex w-full overflow-x-auto sm:w-fit">
            <TabsTrigger value="bookings" className="gap-1.5">
              <Compass className="h-4 w-4" />
              {"R\u00e9servations"}
              {pendingBookingsCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {pendingBookingsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingBag className="h-4 w-4" />
              Commandes
              {pendingOrdersCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {pendingOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tours" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Mes Visites
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {"R\u00e9servations de Visites Guid\u00e9es"}
                </CardTitle>
                <CardDescription>
                  {"Les touristes ayant r\u00e9serv\u00e9 vos visites apparaissent ici."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!bookings || bookings.length === 0) ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <Compass className="h-10 w-10 opacity-30" />
                    <p>{"Aucune r\u00e9servation pour le moment."}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookings.map((b) => (
                      <div
                        key={b.bookingId}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {b.participantName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">{b.participantName}</p>
                            <p className="text-xs text-muted-foreground">{b.tourTitle} - {b.siteName}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{b.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.time}</span>
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{b.price.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={b.status} />
                          {b.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="btn-press border-accent/30 text-accent hover:bg-accent/10"
                                onClick={() => handleBookingAction(b.bookingId, "confirmed")}
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="btn-press border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={() => handleBookingAction(b.bookingId, "cancelled")}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Refuser
                              </Button>
                            </div>
                          )}
                          {b.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="btn-press"
                              onClick={() => handleBookingAction(b.bookingId, "completed")}
                            >
                              {"Marquer termin\u00e9e"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Commandes Artisanales
                </CardTitle>
                <CardDescription>
                  {"Les achats d'objets artisanaux qui vous sont attribu\u00e9s."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!orders || orders.length === 0) ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <ShoppingBag className="h-10 w-10 opacity-30" />
                    <p>Aucune commande pour le moment.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map((o) => (
                      <div
                        key={o.orderId}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {o.buyerName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">{o.craftName}</p>
                            <p className="text-xs text-muted-foreground">
                              {"Acheteur : "}{o.buyerName} ({o.buyerEmail})
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />{o.price.toLocaleString("fr-FR")} FCFA
                              </span>
                              {o.nftToken && (
                                <span className="font-mono text-primary">NFT: {o.nftToken.slice(0, 10)}...</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          {o.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="btn-press border-accent/30 text-accent hover:bg-accent/10"
                                onClick={() => handleOrderAction(o.orderId, "confirmed")}
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                Confirmer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="btn-press border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={() => handleOrderAction(o.orderId, "cancelled")}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Annuler
                              </Button>
                            </div>
                          )}
                          {o.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="btn-press"
                              onClick={() => handleOrderAction(o.orderId, "completed")}
                            >
                              {"Marquer livr\u00e9"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {"Mes Visites Propos\u00e9es"}
                    </CardTitle>
                    <CardDescription>
                      {"Les visites que vous proposez aux touristes sur la plateforme."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(!tours || tours.length === 0) ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <MapPin className="h-10 w-10 opacity-30" />
                    <p>{"Vous n'avez pas encore propos\u00e9 de visite."}</p>
                    <p className="text-sm">{"Cliquez sur \"Proposer une Visite\" pour commencer."}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {tours.map((t) => (
                      <div
                        key={t.tourId}
                        className="rounded-xl border border-border p-5 transition-all duration-200 hover:shadow-sm hover:border-primary/20"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-card-foreground">{t.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{t.site}</p>
                          </div>
                          <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">{t.status}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {t.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t.time} ({t.duration})
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {t.availableSpots}/{t.maxSpots} places
                          </span>
                          {t.language && (
                            <span className="flex items-center gap-1">
                              <Languages className="h-3.5 w-3.5" />
                              {t.language}
                            </span>
                          )}
                        </div>
                        {t.includes && t.includes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {t.includes.map((inc, i) => (
                              <Badge key={`${inc}-${i}`} variant="secondary" className="text-[11px]">
                                <CircleCheck className="mr-1 h-3 w-3" />
                                {inc}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-sm font-semibold text-primary">
                          {t.price.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </AuthGuard>
  )
}
