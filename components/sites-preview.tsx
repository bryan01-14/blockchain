"use client"

import Image from "next/image"
import Link from "next/link"
import { culturalSites } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function SitesPreview() {
  const featured = culturalSites.slice(0, 3)
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>()
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 })

  return (
    <section className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={headerRef}
          className={`animate-on-scroll mb-12 flex items-end justify-between ${headerVisible ? "is-visible" : ""}`}
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              {"D\u00e9couverte"}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Sites Culturels Majeurs
            </h2>
          </div>
          <Button variant="outline" asChild className="hidden md:inline-flex btn-press">
            <Link href="/sites">Voir tous les sites</Link>
          </Button>
        </div>
        <div
          ref={gridRef}
          className={`stagger-children grid gap-6 md:grid-cols-3 ${gridVisible ? "is-visible" : ""}`}
        >
          {featured.map((site, i) => (
            <Link
              key={site.id}
              href={`/sites#${site.id}`}
              className="card-hover-lift group overflow-hidden rounded-xl border border-border bg-card"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={site.image}
                  alt={site.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {site.unesco && (
                  <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
                    UNESCO
                  </Badge>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-card-foreground">
                  {site.name}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
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
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {site.description}
                </p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {site.price.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild className="btn-press">
            <Link href="/sites">Voir tous les sites</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
