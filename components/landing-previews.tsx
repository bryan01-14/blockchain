"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Shield, Star, BookOpen, User, Clock } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const craftsPreview = [
  {
    name: "Masque Baoule Goli",
    artisan: "Maitre Kouassi Yao",
    culture: "Baoule",
    price: 75000,
    rating: 4.9,
    image: "/images/artisan-mask.jpg",
    nft: true,
  },
  {
    name: "Tissu Kente Senoufo",
    artisan: "Coulibaly Naminata",
    culture: "Senoufo",
    price: 45000,
    rating: 4.7,
    image: "/images/artisan-textile.jpg",
    nft: true,
  },
  {
    name: "Bijoux en Or Akan",
    artisan: "Konan Affoue",
    culture: "Akan",
    price: 95000,
    rating: 4.6,
    image: "/images/artisan-jewelry.jpg",
    nft: true,
  },
]

const storiesPreview = [
  {
    title: "Les Masques Sacres du Peuple Baoule",
    author: "Dr. Kouame N'Guessan",
    culture: "Baoule",
    readTime: 8,
    image: "/images/artisan-mask.jpg",
    featured: true,
  },
  {
    title: "L'Or des Akan : Orfevrerie et Pouvoir Royal",
    author: "Pr. Konan Ahou",
    culture: "Akan",
    readTime: 9,
    image: "/images/artisan-jewelry.jpg",
    featured: true,
  },
]

export function MarketplacePreview() {
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>()
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 })

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={headerRef}
          className={`animate-on-scroll mb-12 flex items-end justify-between ${headerVisible ? "is-visible" : ""}`}
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Artisanat
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {"Objets Artisanaux Certifi\u00e9s"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {"Achetez des objets artisanaux authentiques avec certificat NFT sur la blockchain."}
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:inline-flex btn-press">
            <Link href="/marketplace">Voir la boutique</Link>
          </Button>
        </div>
        <div
          ref={gridRef}
          className={`stagger-children grid gap-6 md:grid-cols-3 ${gridVisible ? "is-visible" : ""}`}
        >
          {craftsPreview.map((craft, i) => (
            <Link
              key={craft.name}
              href="/marketplace"
              className="card-hover-lift group overflow-hidden rounded-xl border border-border bg-card"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={craft.image}
                  alt={craft.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {craft.nft && (
                  <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                    <Shield className="mr-1 h-3 w-3" /> NFT
                  </Badge>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-card-foreground">{craft.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">par {craft.artisan}</p>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    {craft.rating}
                  </span>
                  <Badge variant="outline" className="text-xs">{craft.culture}</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {craft.price.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild className="btn-press">
            <Link href="/marketplace">Voir la boutique</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function StoriesPreview() {
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>()
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 })

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={headerRef}
          className={`animate-on-scroll mb-12 flex items-end justify-between ${headerVisible ? "is-visible" : ""}`}
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Histoires
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {"R\u00e9cits & Traditions Culturelles"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {"Plongez dans les histoires fascinantes du patrimoine culturel ivoirien."}
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:inline-flex btn-press">
            <Link href="/stories">Lire les histoires</Link>
          </Button>
        </div>
        <div
          ref={gridRef}
          className={`stagger-children grid gap-6 md:grid-cols-2 ${gridVisible ? "is-visible" : ""}`}
        >
          {storiesPreview.map((story, i) => (
            <Link
              key={story.title}
              href="/stories"
              className="card-hover-lift group flex overflow-hidden rounded-xl border border-border bg-card"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative w-40 shrink-0 overflow-hidden md:w-52">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-5">
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{story.culture}</Badge>
                  {story.featured && <Badge className="bg-primary text-primary-foreground text-xs">{"A la une"}</Badge>}
                </div>
                <h3 className="font-semibold text-card-foreground line-clamp-2">{story.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />{story.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />{story.readTime} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild className="btn-press">
            <Link href="/stories">Lire les histoires</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
