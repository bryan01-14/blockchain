"use client"

import { useState } from "react"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { TicketSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth-context"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { NFTTicket, CulturalSite } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Ticket,
  Shield,
  QrCode,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Sparkles,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function statusConfig(status: NFTTicket["status"]) {
  switch (status) {
    case "valid":
      return {
        label: "Valide",
        icon: CheckCircle,
        className: "bg-accent/10 text-accent border-accent/30",
      }
    case "used":
      return {
        label: "Utilise",
        icon: Clock,
        className: "bg-muted text-muted-foreground border-border",
      }
    case "expired":
      return {
        label: "Expire",
        icon: XCircle,
        className: "bg-destructive/10 text-destructive border-destructive/30",
      }
  }
}

function TicketCard({
  ticket,
  onSelect,
}: {
  ticket: NFTTicket
  onSelect: (t: NFTTicket) => void
}) {
  const config = statusConfig(ticket.status)
  const Icon = config.icon

  return (
    <Card
      className="card-hover-lift cursor-pointer"
      onClick={() => onSelect(ticket)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{ticket.siteName}</CardTitle>
            <CardDescription>{ticket.ownerName}</CardDescription>
          </div>
          <Badge variant="outline" className={config.className}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date de visite</span>
            <span className="font-medium text-foreground">{ticket.visitDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Token ID</span>
            <span className="font-mono text-xs text-foreground">{ticket.tokenId}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-semibold text-foreground">
              {ticket.qrCode}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TicketDetailDialog({
  ticket,
  open,
  onClose,
}: {
  ticket: NFTTicket | null
  open: boolean
  onClose: () => void
}) {
  if (!ticket) return null
  const config = statusConfig(ticket.status)
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {"D\u00e9tails du Billet NFT"}
          </DialogTitle>
          <DialogDescription>{ticket.siteName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Statut</p>
              <Badge variant="outline" className={config.className}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{"V\u00e9rifi\u00e9"}</p>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Oui</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Propri\u00e9taire", value: ticket.ownerName },
              { label: "Date d'achat", value: ticket.purchaseDate },
              { label: "Date de visite", value: ticket.visitDate },
              { label: "QR Code", value: ticket.qrCode },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">Blockchain</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token ID</span>
                <span className="font-mono text-xs text-foreground">{ticket.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merkle Root</span>
                <span className="font-mono text-xs text-foreground">{ticket.merkleRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{"R\u00e9seau"}</span>
                <span className="text-foreground">Polygon</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RecommendationSection() {
  const [preferences, setPreferences] = useState<string[]>([])
  const allCategories = ["patrimoine", "nature", "religieux", "historique"]

  const { data: allSites } = useSWR<CulturalSite[]>("/api/sites", fetcher)

  const togglePref = (cat: string) => {
    setPreferences((prev) =>
      prev.includes(cat) ? prev.filter((p) => p !== cat) : [...prev, cat]
    )
  }

  const recommended =
    preferences.length > 0
      ? (allSites ?? []).filter((s) => preferences.includes(s.category))
      : (allSites ?? []).slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {"Recommandations IA Personnalis\u00e9es"}
        </CardTitle>
        <CardDescription>
          {"S\u00e9lectionnez vos centres d'int\u00e9r\u00eat pour recevoir des suggestions adapt\u00e9es."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <Button
              key={cat}
              variant={preferences.includes(cat) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePref(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {recommended.map((site) => (
            <div
              key={site.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{site.name}</p>
                <p className="text-xs text-muted-foreground">
                  {site.price.toLocaleString("fr-FR")} FCFA - Score:{" "}
                  {(site.rating * 20).toFixed(0)}%
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {site.category}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TicketsPage() {
  const [search, setSearch] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<NFTTicket | null>(null)
  const { user } = useAuth()

  const { data: tickets, isLoading } = useSWR<NFTTicket[]>(
    user?.email ? `/api/tickets?email=${encodeURIComponent(user.email)}` : null,
    fetcher
  )

  const filtered = (tickets ?? []).filter(
    (t) =>
      t.siteName.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      t.qrCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Billets NFT</h1>
          <p className="mt-2 text-muted-foreground">
            {"G\u00e9rez vos billets NFT et d\u00e9couvrez des recommandations personnalis\u00e9es"}
          </p>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList className="mb-6">
            <TabsTrigger value="tickets">Mes Billets</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations IA</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un billet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TicketSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onSelect={setSelectedTicket}
                    />
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="col-span-full py-16 text-center animate-in fade-in-0 duration-500">
                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">Aucun billet trouve.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationSection />
          </TabsContent>
        </Tabs>

        <TicketDetailDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      </main>
      <Footer />
    </AuthGuard>
  )
}
