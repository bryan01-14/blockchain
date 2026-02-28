"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR, { mutate } from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { CardSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Shield,
  Star,
  ShoppingCart,
  CheckCircle,
  Hash,
  Palette,
  Loader2,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Craft {
  craftId: string
  name: string
  description: string
  artisan: string
  origin: string
  culture: string
  category: string
  image: string
  price: number
  rating: number
  reviews: number
  nftCertified: boolean
  tokenId: string
  merkleRoot: string
  inStock: boolean
}

const categories = [
  { value: "all", label: "Toutes les categories" },
  { value: "masque", label: "Masques" },
  { value: "textile", label: "Textiles" },
  { value: "poterie", label: "Poteries" },
  { value: "sculpture", label: "Sculptures" },
  { value: "bijoux", label: "Bijoux" },
  { value: "instrument", label: "Instruments" },
]

function CraftCard({ craft, onSelect, index, priority }: { craft: Craft; onSelect: (c: Craft) => void; index: number; priority?: boolean }) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Card className="card-hover-lift group cursor-pointer overflow-hidden" onClick={() => onSelect(craft)}>
        <div className="relative h-56 overflow-hidden">
          <Image
            src={craft.image}
            alt={craft.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={priority}
          />
          {craft.nftCertified && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              <Shield className="mr-1 h-3 w-3" /> NFT
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 rounded-lg bg-background/90 px-2.5 py-1 text-sm font-bold text-foreground backdrop-blur">
            {craft.price.toLocaleString("fr-FR")} FCFA
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-semibold text-card-foreground">{craft.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">par {craft.artisan}</p>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {craft.rating}
            </span>
            <span>{craft.reviews} avis</span>
            <Badge variant="outline" className="text-xs">{craft.culture}</Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {craft.description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function PurchaseDialog({ craft, open, onClose }: { craft: Craft | null; open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const [buying, setBuying] = useState(false)
  const [result, setResult] = useState<{ orderId: string; tokenId: string } | null>(null)

  const handleBuy = async () => {
    if (!craft || !user) return
    setBuying(true)
    try {
      const res = await fetch("/api/crafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          craftId: craft.craftId,
          buyerEmail: user.email,
          buyerName: user.name,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ orderId: data.orderId, tokenId: data.tokenId })
        mutate("/api/crafts")
      }
    } finally {
      setBuying(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    onClose()
  }

  if (!craft) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {result ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle>Achat confirme</DialogTitle>
              <DialogDescription>
                {"Votre objet artisanal est certifie sur la blockchain."}
              </DialogDescription>
            </DialogHeader>
            <div className="w-full space-y-2 rounded-lg bg-secondary p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commande</span>
                <span className="font-mono text-xs text-foreground">{result.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token NFT</span>
                <span className="font-mono text-xs text-foreground">{result.tokenId}</span>
              </div>
            </div>
            <Button onClick={handleClose} className="btn-press w-full">Fermer</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{craft.name}</DialogTitle>
              <DialogDescription>
                {"Certificat d'authenticite NFT inclus"}
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-48 overflow-hidden rounded-lg">
              <Image src={craft.image} alt={craft.name} fill className="object-cover" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Artisan</span>
                <span className="font-medium text-foreground">{craft.artisan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Origine</span>
                <span className="font-medium text-foreground">{craft.origin}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Culture</span>
                <Badge variant="outline">{craft.culture}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Certification</span>
                <span className="flex items-center gap-1 font-mono text-xs text-primary">
                  <Hash className="h-3 w-3" />{craft.tokenId}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{craft.price.toLocaleString("fr-FR")} FCFA</span>
                  <Button onClick={handleBuy} disabled={buying} className="btn-press">
                    {buying ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Achat en cours...</>
                    ) : (
                      <><ShoppingCart className="mr-2 h-4 w-4" /> Acheter</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedCraft, setSelectedCraft] = useState<Craft | null>(null)

  const { data: crafts, isLoading } = useSWR<Craft[]>("/api/crafts", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const filtered = (crafts ?? []).filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.artisan.toLowerCase().includes(search.toLowerCase()) ||
      c.culture.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "all" || c.category === category
    return matchSearch && matchCategory
  })

  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Artisanat Ivoirien</h1>
              <p className="text-muted-foreground">
                {"Objets artisanaux certifi\u00e9s avec des NFT blockchain"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un objet, artisan, culture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((craft, i) => (
              <CraftCard
                key={craft.craftId ?? craft.tokenId ?? `craft-${i}`}
                craft={craft}
                onSelect={setSelectedCraft}
                index={i}
                priority={i < 6}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center animate-in fade-in-0 duration-500">
            <Palette className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg text-muted-foreground">{"Aucun objet trouv\u00e9 pour cette recherche."}</p>
          </div>
        )}

        <PurchaseDialog
          craft={selectedCraft}
          open={!!selectedCraft}
          onClose={() => setSelectedCraft(null)}
        />
      </main>
      <Footer />
    </AuthGuard>
  )
}
