"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Ticket, QrCode, BarChart3, Map, Brain, Palette, Compass, MessageCircle, Sparkles } from "lucide-react"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"

function AnimatedStat({ label, target, suffix }: { label: string; target: number; suffix: string }) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 })
  const count = useCountUp(target, 1800, isVisible)

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl font-bold text-background md:text-3xl">
        {count.toLocaleString("fr-FR")}{suffix}
      </p>
      <p className="mt-1 text-sm text-background/60">{label}</p>
    </div>
  )
}

export function HeroSection() {
  const [badgeRef, badgeVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const [titleRef, titleVisible] = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })
  const [descRef, descVisible] = useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 })
  const [ctaRef, ctaVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/culture-hero.jpg"
          alt="Patrimoine culturel ivoirien"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center lg:px-8 lg:py-36">
        <div
          ref={badgeRef}
          className={`animate-scale-in mb-4 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-1.5 text-sm text-background backdrop-blur ${badgeVisible ? "is-visible" : ""}`}
        >
          <Shield className="h-4 w-4" />
          {"S\u00e9curis\u00e9 par la Blockchain"}
        </div>
        <h1
          ref={titleRef}
          className={`animate-on-scroll max-w-4xl text-balance text-4xl font-bold tracking-tight text-background md:text-5xl lg:text-6xl ${titleVisible ? "is-visible" : ""}`}
        >
          {"Tourisme Culturel en C\u00f4te d'Ivoire, R\u00e9invent\u00e9"}
        </h1>
        <p
          ref={descRef}
          className={`animate-on-scroll mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-background/80 ${descVisible ? "is-visible" : ""}`}
          style={{ transitionDelay: "120ms" }}
        >
          {"Tra\u00e7abilit\u00e9, s\u00e9curit\u00e9 et promotion du patrimoine ivoirien gr\u00e2ce \u00e0 la Blockchain, l'Intelligence Artificielle et les NFT."}
        </p>
        <div
          ref={ctaRef}
          className={`animate-on-scroll mt-8 flex flex-wrap justify-center gap-3 ${ctaVisible ? "is-visible" : ""}`}
          style={{ transitionDelay: "240ms" }}
        >
          <Button size="lg" className="btn-press animate-pulse-glow" asChild>
            <Link href="/sites">{"D\u00e9couvrir les Sites"}</Link>
          </Button>
          <Button size="lg" variant="outline" className="btn-press border-background/30 bg-background/10 text-background hover:bg-background/20 hover:text-background" asChild>
            <Link href="/tickets">Acheter un Billet NFT</Link>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          <AnimatedStat label="Sites Culturels" target={5} suffix="+" />
          <AnimatedStat label="Visiteurs" target={160000} suffix="+" />
          <AnimatedStat label="Billets NFT" target={8900} suffix="+" />
          <AnimatedStat label="Fraudes Bloqu\u00e9es" target={342} suffix="" />
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: Ticket,
    title: "Billets NFT",
    description:
      "Chaque billet est un token unique sur la blockchain, infalsifiable et tra\u00e7able.",
  },
  {
    icon: Palette,
    title: "Artisanat Certifi\u00e9",
    description:
      "Achetez des objets artisanaux authentiques avec certificat NFT blockchain.",
  },
  {
    icon: Compass,
    title: "Visites Guid\u00e9es",
    description:
      "R\u00e9servez des visites avec des guides experts certifi\u00e9s du patrimoine.",
  },
  {
    icon: Shield,
    title: "Arbres de Merkle",
    description:
      "Int\u00e9grit\u00e9 des donn\u00e9es garantie par preuve cryptographique Merkle.",
  },
  {
    icon: QrCode,
    title: "QR Code V\u00e9rifiable",
    description:
      "Scannez et v\u00e9rifiez instantan\u00e9ment l'authenticit\u00e9 de chaque billet.",
  },
  {
    icon: Brain,
    title: "IA Recommandation",
    description:
      "Suggestions personnalis\u00e9es de sites culturels bas\u00e9es sur vos pr\u00e9f\u00e9rences.",
  },
  {
    icon: BarChart3,
    title: "Tableau de Bord",
    description:
      "Analyse statistique en temps r\u00e9el des flux touristiques et revenus.",
  },
  {
    icon: Map,
    title: "Cartographie",
    description:
      "Visualisation interactive de tous les sites culturels ivoiriens.",
  },
]

export function FeaturesSection() {
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>()
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 })

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div
        ref={headerRef}
        className={`animate-on-scroll mb-12 text-center ${headerVisible ? "is-visible" : ""}`}
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Technologies
        </p>
        <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
          {"Innovation au Service du Patrimoine"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          {"Une combinaison unique de Blockchain, Big Data et Intelligence Artificielle pour transformer le tourisme culturel."}
        </p>
      </div>
      <div
        ref={gridRef}
        className={`stagger-children grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${gridVisible ? "is-visible" : ""}`}
      >
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="card-hover-lift group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AssistantCTA() {
  const [ref, visible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 })

  return (
    <section
      ref={ref}
      className={`animate-on-scroll relative overflow-hidden bg-primary/5 py-20 ${visible ? "is-visible" : ""}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center lg:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Intelligence Artificielle
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            {"Votre Guide Virtuel Intelligent"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            {"VisitBot, notre assistant IA, utilise la technologie RAG (Retrieval-Augmented Generation) connect\u00e9e \u00e0 une base de connaissances riche sur le patrimoine ivoirien pour r\u00e9pondre \u00e0 toutes vos questions."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 text-left">
            <Sparkles className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Recommandations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Suggestions de sites, h\u00e9bergements et itin\u00e9raires adapt\u00e9s \u00e0 vos envies."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-left">
            <Map className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Infos Pratiques</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Horaires, tarifs, transport et conseils pour chaque site culturel."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-left">
            <Brain className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Culture & Histoire</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"D\u00e9couvrez les traditions, la gastronomie et l'histoire de la C\u00f4te d'Ivoire."}
            </p>
          </div>
        </div>
        <Button size="lg" className="btn-press" asChild>
          <Link href="/assistant">
            <MessageCircle className="mr-2 h-5 w-5" />
            {"Parler \u00e0 VisitBot"}
          </Link>
        </Button>
      </div>
    </section>
  )
}
