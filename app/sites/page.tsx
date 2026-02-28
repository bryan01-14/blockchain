"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Image from "next/image"
import useSWR, { mutate } from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { CardSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth-context"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { CulturalSite } from "@/lib/data"
import { culturalSites as staticSites } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  MapPin,
  Star,
  Users,
  Search,
  Ticket,
  Shield,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Languages,
  CircleCheck,
  Loader2,
  Compass,
  X,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const categories = [
  { value: "all", label: "Toutes les categories" },
  { value: "patrimoine", label: "Patrimoine" },
  { value: "nature", label: "Nature" },
  { value: "religieux", label: "Religieux" },
  { value: "historique", label: "Historique" },
]

interface Tour {
  tourId: string
  siteId: string
  siteName: string
  title: string
  description: string
  guide: string
  guideId: string
  duration: string
  maxParticipants: number
  currentParticipants: number
  price: number
  date: string
  time: string
  language: string
  includes: string[]
  rating: number
  status: string
}

interface CraftMini {
  craftId: string
  name: string
  price: number
  image?: string
  inStock?: boolean
}

/* ── Site Card ── */
function SiteCard({
  site,
  onSelect,
  index,
}: {
  site: CulturalSite
  onSelect: (s: CulturalSite) => void
  index: number
}) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 })

  return (
    <div
      ref={ref}
      id={site.id}
      className={`animate-on-scroll card-hover-lift group cursor-pointer overflow-hidden rounded-xl border border-border bg-card ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
      onClick={() => onSelect(site)}
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={site.image}
          alt={site.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-2">
          {site.unesco && (
            <Badge className="bg-accent text-accent-foreground shadow-sm">UNESCO</Badge>
          )}
          <Badge variant="secondary" className="capitalize bg-card/90 text-card-foreground backdrop-blur-sm">
            {site.category}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-card-foreground">{site.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {site.location.split(",")[0]}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {site.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {site.visitors.toLocaleString("fr-FR")}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {site.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {site.price.toLocaleString("fr-FR")} FCFA
          </p>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {"Voir d\u00e9tails"}
          </Badge>
        </div>
      </div>
    </div>
  )
}

/* ── Site Detail View with Guided Tours ── */
function SiteDetail({
  site,
  onBack,
  onBuyTicket,
}: {
  site: CulturalSite
  onBack: () => void
  onBuyTicket: (site: CulturalSite) => void
}) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  const { data: tours, isLoading: toursLoading } = useSWR<Tour[]>(
    `/api/tours?siteId=${site.id}`,
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: true, dedupingInterval: 5000 }
  )

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux sites
      </button>

      {/* Hero image */}
      <div className="relative h-64 overflow-hidden rounded-xl md:h-80 lg:h-96">
        <Image
          src={site.image}
          alt={site.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-3">
            {site.unesco && (
              <Badge className="bg-accent text-accent-foreground shadow-sm">UNESCO</Badge>
            )}
            <Badge variant="secondary" className="capitalize bg-card/90 text-card-foreground backdrop-blur-sm">
              {site.category}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-background md:text-4xl">{site.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-background/80">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {site.location}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {site.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {site.visitors.toLocaleString("fr-FR")} visiteurs
            </span>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{site.description}</p>
          </div>

          {/* Guided Tours Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Compass className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{"Visites Guid\u00e9es"}</h2>
                <p className="text-sm text-muted-foreground">{"Explorez ce site avec un guide expert"}</p>
              </div>
            </div>

            {toursLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <div className="skeleton-shimmer h-4 w-3/4 mb-3" />
                    <div className="skeleton-shimmer h-3 w-1/2 mb-2" />
                    <div className="skeleton-shimmer h-3 w-2/3 mb-4" />
                    <div className="skeleton-shimmer h-8 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            ) : tours && tours.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {tours.map((tour) => {
                  const spotsLeft = tour.maxParticipants - tour.currentParticipants
                  const dateFormatted = new Date(tour.date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                  return (
                    <Card
                      key={tour.tourId}
                      className="card-hover-lift cursor-pointer transition-all hover:border-primary/30"
                      onClick={() => setSelectedTour(tour)}
                    >
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-card-foreground">{tour.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Guide : {tour.guide}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                            <Calendar className="h-3 w-3" /> {dateFormatted}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                            <Clock className="h-3 w-3" /> {tour.time}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                            <Clock className="h-3 w-3" /> {tour.duration}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">
                            Voir les détails
                          </span>
                          <Badge
                            variant={spotsLeft <= 3 ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            <Users className="mr-1 h-3 w-3" />
                            {spotsLeft} place{spotsLeft > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
                <Compass className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {"Aucune visite guid\u00e9e disponible pour ce site actuellement."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">{"Billet d'entr\u00e9e"}</span>
              <p className="text-3xl font-bold text-foreground">
                {site.price.toLocaleString("fr-FR")}
                <span className="text-base font-normal text-muted-foreground"> FCFA</span>
              </p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Billet NFT infalsifiable
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-accent" />
                {"V\u00e9rification Merkle Proof"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="h-4 w-4 text-primary" />
                QR Code unique
              </div>
            </div>
            <Button
              className="btn-press w-full"
              size="lg"
              onClick={() => onBuyTicket(site)}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Acheter Billet NFT
            </Button>
          </div>
        </div>
      </div>

      {/* Tour Booking Dialog */}
      <TourBookingDialog
        tour={selectedTour}
        open={!!selectedTour}
        onClose={() => setSelectedTour(null)}
        ticketPrice={site.price}
      />
    </div>
  )
}

/* ── Tour Booking Dialog ── */
function TourBookingDialog({
  tour,
  open,
  onClose,
  ticketPrice,
}: {
  tour: Tour | null
  open: boolean
  onClose: () => void
  ticketPrice: number
}) {
  const { user } = useAuth()
  const [booking, setBooking] = useState(false)
  const [selectedCraftIds, setSelectedCraftIds] = useState<string[]>([])
  const [result, setResult] = useState<{
    packageId: string
    bookingId: string
    date: string
    time: string
    totalAmount: number
    ticketQrCode?: string
    craftCount: number
  } | null>(null)

  const { data: crafts } = useSWR<CraftMini[]>(
    "/api/crafts",
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: true, dedupingInterval: 5000 }
  )

  const craftOptions = useMemo(() => {
    const list = (crafts ?? []).filter((c) => c.inStock !== false)
    return list.slice(0, 8)
  }, [crafts])

  const selectedCraftTotal = useMemo(() => {
    if (!crafts || selectedCraftIds.length === 0) return 0
    const set = new Set(selectedCraftIds)
    return crafts.reduce((sum, c) => (set.has(c.craftId) ? sum + Number(c.price ?? 0) : sum), 0)
  }, [crafts, selectedCraftIds])

  const estimatedTotal = useMemo(() => {
    return Number(tour?.price ?? 0) + Number(ticketPrice ?? 0) + Number(selectedCraftTotal ?? 0)
  }, [tour?.price, ticketPrice, selectedCraftTotal])

  const toggleCraft = useCallback((craftId: string) => {
    setSelectedCraftIds((prev) =>
      prev.includes(craftId) ? prev.filter((id) => id !== craftId) : [...prev, craftId]
    )
  }, [])

  const handleBook = async () => {
    if (!tour || !user) return
    setBooking(true)
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: tour.tourId,
          participantEmail: user.email,
          participantName: user.name,
          includeTicket: true,
          craftIds: selectedCraftIds,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({
          packageId: data.packageId,
          bookingId: data.bookingId,
          date: data.date,
          time: data.time,
          totalAmount: data.totalAmount ?? tour.price,
          ticketQrCode: data.ticket?.qrCode,
          craftCount: Array.isArray(data.craftOrders) ? data.craftOrders.length : selectedCraftIds.length,
        })
        mutate((key: string) => typeof key === "string" && key.startsWith("/api/tours"))
        mutate("/api/tickets")
        mutate("/api/crafts")
      }
    } finally {
      setBooking(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setSelectedCraftIds([])
    onClose()
  }

  if (!tour) return null

  const dateFormatted = new Date(tour.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {result ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle>{"R\u00e9servation confirm\u00e9e"}</DialogTitle>
              <DialogDescription>{"Votre package a \u00e9t\u00e9 cr\u00e9\u00e9 avec succ\u00e8s."}</DialogDescription>
            </DialogHeader>
            <div className="w-full space-y-2 rounded-lg bg-secondary p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-mono text-xs text-foreground">{result.packageId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{"R\u00e9servation"}</span>
                <span className="font-mono text-xs text-foreground">{result.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{dateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heure</span>
                <span className="text-foreground">{result.time}</span>
              </div>
              {result.ticketQrCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billet (QR)</span>
                  <span className="font-mono text-xs text-foreground">{result.ticketQrCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artisanat</span>
                <span className="text-foreground">{result.craftCount} objet(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">
                  {Number(result.totalAmount ?? 0).toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
            <Button onClick={handleClose} className="btn-press w-full">Fermer</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{tour.title}</DialogTitle>
              <DialogDescription>{tour.siteName}</DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-muted-foreground">{tour.description}</p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-sm font-semibold text-foreground">Votre package inclut</p>
                <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <span>Billet NFT du site</span>
                  </div>
                  <div className="flex items-center">
                    <span>Visite guidée</span>
                  </div>
                  <div className="flex items-center">
                    <span>Artisanat</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guide</span>
                <span className="font-medium text-foreground">{tour.guide}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{dateFormatted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium text-foreground">{tour.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{"Dur\u00e9e"}</span>
                <span className="font-medium text-foreground">{tour.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Langue</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Languages className="h-3.5 w-3.5" /> {tour.language}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Inclus :</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tour.includes.map((item, i) => (
                    <Badge key={`${item}-${i}`} variant="secondary" className="text-xs">
                      <CircleCheck className="mr-1 h-3 w-3" />{item}
                    </Badge>
                  ))}
                </div>
              </div>
              
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ── Purchase Dialog ── */
function PurchaseDialog({
  site,
  open,
  onClose,
}: {
  site: CulturalSite | null
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form")
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [ticketResult, setTicketResult] = useState<{
    tokenId: string
    merkleRoot: string
    qrCode: string
  } | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (open && user?.name) setName(user.name)
  }, [open, user?.name])

  const [selectedCraftIds, setSelectedCraftIds] = useState<string[]>([])
  const { data: crafts } = useSWR<CraftMini[]>(
    "/api/crafts",
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: true, dedupingInterval: 5000 }
  )

  const craftOptions = useMemo(() => {
    const list = (crafts ?? []).filter((c) => c.inStock !== false)
    return list.slice(0, 6)
  }, [crafts])

  const toggleCraft = useCallback((craftId: string) => {
    setSelectedCraftIds((prev) =>
      prev.includes(craftId) ? prev.filter((id) => id !== craftId) : [...prev, craftId]
    )
  }, [])

  const craftsTotal = useMemo(() => {
    if (!crafts || selectedCraftIds.length === 0) return 0
    const set = new Set(selectedCraftIds)
    return crafts.reduce(
      (sum, c) => (set.has(c.craftId) ? sum + Number(c.price ?? 0) : sum),
      0
    )
  }, [crafts, selectedCraftIds])

  const totalWithCrafts = useMemo(() => {
    if (!site) return craftsTotal
    return Number(site.price ?? 0) + craftsTotal
  }, [site, craftsTotal])

  const handlePurchase = async () => {
    if (!site || !user) return
    setStep("processing")

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site.id,
          siteName: site.name,
          ownerEmail: user.email,
          ownerName: name || user.name,
          visitDate: date,
          price: site.price,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setTicketResult({
          tokenId: data.tokenId,
          merkleRoot: data.merkleRoot,
          qrCode: data.qrCode,
        })
        mutate("/api/sites")

        // Créer les commandes artisanales sélectionnées
        if (selectedCraftIds.length > 0) {
          const chosen = (crafts ?? []).filter((c) =>
            selectedCraftIds.includes(c.craftId)
          )
          await Promise.all(
            chosen.map((c) =>
              fetch("/api/crafts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  craftId: c.craftId,
                  buyerEmail: user.email,
                  buyerName: name || user.name,
                }),
              })
            )
          )
          mutate("/api/crafts")
        }
      }
    } catch {
      setTicketResult({
        tokenId: "0x7f3a...8b2c",
        merkleRoot: "0xabc1...f456",
        qrCode: `QR-${site.id.substring(0, 2).toUpperCase()}-${Date.now().toString(36)}`,
      })
    }

    setStep("success")
  }

  const handleClose = () => {
    setStep("form")
    setName("")
    setDate("")
    setTicketResult(null)
    setSelectedCraftIds([])
    onClose()
  }

  if (!site) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Billet NFT Cree !" : "Acheter un Billet NFT"}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? "Votre billet a ete enregistre sur la blockchain."
              : `${site.name} - ${site.price.toLocaleString("fr-FR")} FCFA`}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nom complet</label>
              <Input
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Date de visite</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                {"S\u00e9curit\u00e9 Blockchain"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {"Votre billet sera mint\u00e9 comme NFT sur Polygon avec v\u00e9rification Merkle Proof."}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="text-sm font-semibold text-foreground">Suggestions d'artisanat</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajoutez des objets artisanaux à votre billet pour soutenir les artisans locaux.
              </p>
              <div className="mt-2 flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
                {craftOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun objet disponible pour le moment.</p>
                ) : (
                  craftOptions.map((c) => (
                    <div
                      key={c.craftId}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCraft(c.craftId)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCraft(c.craftId); } }}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background px-2.5 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedCraftIds.includes(c.craftId)} />
                        {c.image && (
                          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border/60 bg-muted">
                            <Image
                              src={c.image}
                              alt={c.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground line-clamp-1">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {Number(c.price ?? 0).toLocaleString("fr-FR")} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total artisanat</span>
                <span className="font-semibold text-foreground">
                  {craftsTotal.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
            <Button onClick={handlePurchase} disabled={!name || !date} className="btn-press w-full">
              {"Confirmer l'achat"} - {totalWithCrafts.toLocaleString("fr-FR")} FCFA
            </Button>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in-0 duration-300">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDuration: "1s" }} />
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-accent/20 border-b-accent" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
            </div>
            <p className="text-sm font-medium text-foreground">{"Cr\u00e9ation du NFT sur la blockchain..."}</p>
            <div className="w-full space-y-2.5">
              {["Signature du Smart Contract...", "G\u00e9n\u00e9ration de l'arbre de Merkle...", "Stockage IPFS des m\u00e9tadonn\u00e9es..."].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-left-2" style={{ animationDelay: `${i * 400}ms`, animationDuration: "400ms", animationFillMode: "both" }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "success" && ticketResult && (
          <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in-0 zoom-in-95 duration-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 animate-in zoom-in-50 duration-500">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Token ID</p>
              <p className="font-mono text-sm font-semibold text-foreground">{ticketResult.tokenId}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Merkle Root</p>
              <p className="font-mono text-sm font-semibold text-foreground">{ticketResult.merkleRoot}</p>
            </div>
            <div className="w-full rounded-lg border border-border bg-secondary/50 p-4 text-center">
              <p className="font-mono text-3xl font-bold text-primary">{ticketResult.qrCode}</p>
              <p className="mt-1 text-xs text-muted-foreground">{"Pr\u00e9sentez ce code \u00e0 l'entr\u00e9e du site"}</p>
            </div>
            <Button onClick={handleClose} className="btn-press w-full">Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ── Main Page ── */
export default function SitesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedSite, setSelectedSite] = useState<CulturalSite | null>(null)
  const [purchaseSite, setPurchaseSite] = useState<CulturalSite | null>(null)
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>()

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (category !== "all") p.set("category", category)
    if (search) p.set("search", search)
    return p.toString()
  }, [category, search])

  const { data: sites, isLoading } = useSWR<CulturalSite[]>(
    `/api/sites${params ? `?${params}` : ""}`,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true, dedupingInterval: 3000 }
  )

  const handleSelectSite = useCallback((site: CulturalSite) => {
    setSelectedSite(site)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleBack = useCallback(() => {
    setSelectedSite(null)
  }, [])

  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {selectedSite ? (
          <SiteDetail
            site={selectedSite}
            onBack={handleBack}
            onBuyTicket={setPurchaseSite}
          />
        ) : (
          <>
            <div
              ref={headerRef}
              className={`animate-on-scroll mb-8 ${headerVisible ? "is-visible" : ""}`}
            >
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Sites Culturels</h1>
              <p className="mt-2 text-muted-foreground">
                {"D\u00e9couvrez le patrimoine culturel de la C\u00f4te d'Ivoire et r\u00e9servez vos visites guid\u00e9es"}
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un site..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 transition-shadow duration-200 focus:shadow-md"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(sites ?? []).map((site, i) => (
                    <SiteCard key={site.id} site={site} onSelect={handleSelectSite} index={i} />
                  ))}
                </div>
                {sites && sites.length === 0 && (
                  <div className="py-20 text-center animate-in fade-in-0 duration-500">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-lg text-muted-foreground">
                      {"Aucun site trouv\u00e9 pour cette recherche."}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <PurchaseDialog
          site={purchaseSite}
          open={!!purchaseSite}
          onClose={() => setPurchaseSite(null)}
        />
      </main>
      <Footer />
    </AuthGuard>
  )
}
