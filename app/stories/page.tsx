"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { CardSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Star,
  BookOpen,
  Clock,
  Share2,
  MessageSquare,
  User,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Story {
  storyId: string
  title: string
  excerpt: string
  content: string
  culture: string
  category: string
  image: string
  author: string
  publishedAt: string
  readTime: number
  rating: number
  reviewCount: number
  featured: boolean
}

interface Review {
  reviewId: string
  targetType: string
  targetId: string
  targetName: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  all: "Toutes",
  traditions: "Traditions",
  artisanat: "Artisanat",
  spiritualite: "Spiritualite",
  musique: "Musique",
}

function StoryCard({ story, onClick, index }: { story: Story; onClick: (s: Story) => void; index: number }) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Card
        className={`card-hover-lift group cursor-pointer overflow-hidden ${story.featured ? "ring-2 ring-primary/20" : ""}`}
        onClick={() => onClick(story)}
      >
        <div className="relative h-48 overflow-hidden">
          <Image
            src={story.image}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {story.featured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              {"A la une"}
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur">
            <Clock className="mr-1 inline h-3 w-3" />
            {story.readTime} min
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">{story.culture}</Badge>
            <Badge variant="secondary" className="text-xs">{categoryLabels[story.category] || story.category}</Badge>
          </div>
          <h3 className="font-semibold text-card-foreground line-clamp-2">{story.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{story.excerpt}</p>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {story.author}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {story.rating} ({story.reviewCount})
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StoryDialog({ story, open, onClose }: { story: Story | null; open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [shareMessage, setShareMessage] = useState("")

  const { data: reviews } = useSWR<Review[]>(
    story ? `/api/stories?targetType=story&targetId=${story.storyId}` : null,
    fetcher
  )

  const handleSubmitReview = async () => {
    if (!story || !user || !reviewText.trim()) return
    setSubmitting(true)
    try {
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "story",
          targetId: story.storyId,
          targetName: story.title,
          authorName: user.name,
          authorEmail: user.email,
          rating: reviewRating,
          comment: reviewText,
        }),
      })
      setSubmitted(true)
      setReviewText("")
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = (platform: string) => {
    if (!story) return
    const text = `${story.title} - ${story.excerpt}`
    const url = typeof window !== "undefined" ? window.location.href : ""

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        break
      default:
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url)
          setShareMessage("Lien copie !")
          setTimeout(() => setShareMessage(""), 2000)
        }
        return
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  const handleClose = () => {
    setSubmitted(false)
    setReviewText("")
    setShareMessage("")
    onClose()
  }

  if (!story) return null

  const publishDate = new Date(story.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="relative h-56 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
          <Image src={story.image} alt={story.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-background/90 text-foreground backdrop-blur">{story.culture}</Badge>
              <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur">{categoryLabels[story.category]}</Badge>
            </div>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl leading-tight">{story.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-3 text-sm">
            <span>{story.author}</span>
            <span>{publishDate}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{story.readTime} min</span>
          </DialogDescription>
        </DialogHeader>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>{story.content}</p>
        </div>

        {/* Share buttons */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Partager cette histoire
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleShare("twitter")} className="btn-press text-xs">
              Twitter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare("facebook")} className="btn-press text-xs">
              Facebook
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare("whatsapp")} className="btn-press text-xs">
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare("copy")} className="btn-press text-xs">
              Copier le lien
            </Button>
          </div>
          {shareMessage && (
            <p className="mt-2 text-xs text-accent animate-in fade-in-0 duration-300">{shareMessage}</p>
          )}
        </div>

        {/* Reviews */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Avis ({reviews?.length || 0})
          </p>

          {reviews && reviews.length > 0 && (
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {reviews.map((rev) => (
                <div key={rev.reviewId} className="rounded-lg bg-secondary p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{rev.authorName}</span>
                    <span className="flex items-center gap-0.5 text-primary">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write a review */}
          {user && !submitted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Votre note :</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setReviewRating(n)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${n} etoile${n > 1 ? "s" : ""}`}
                  >
                    <Star className={`h-5 w-5 ${n <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Partagez votre avis sur cette histoire..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
              />
              <Button
                size="sm"
                onClick={handleSubmitReview}
                disabled={submitting || !reviewText.trim()}
                className="btn-press"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Publier</>
                )}
              </Button>
            </div>
          ) : submitted ? (
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm text-accent animate-in fade-in-0 duration-300">
              <CheckCircle className="h-4 w-4" />
              {"Merci pour votre avis !"}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function StoriesPage() {
  const [category, setCategory] = useState("all")
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  const { data: stories, isLoading } = useSWR<Story[]>("/api/stories", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const filtered = (stories ?? []).filter((s) => {
    return category === "all" || s.category === category
  })

  const featured = filtered.filter((s) => s.featured)
  const regular = filtered.filter((s) => !s.featured)

  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Histoires & Culture</h1>
              <p className="text-muted-foreground">
                {"D\u00e9couvrez les r\u00e9cits et traditions du patrimoine ivoirien"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
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
            {featured.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-foreground">{"A la une"}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featured.map((story, i) => (
                    <StoryCard key={story.storyId} story={story} onClick={setSelectedStory} index={i} />
                  ))}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="mb-4 text-lg font-semibold text-foreground">{"Toutes les histoires"}</h2>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {regular.map((story, i) => (
                    <StoryCard key={story.storyId} story={story} onClick={setSelectedStory} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center animate-in fade-in-0 duration-500">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg text-muted-foreground">{"Aucune histoire trouv\u00e9e dans cette cat\u00e9gorie."}</p>
          </div>
        )}

        <StoryDialog
          story={selectedStory}
          open={!!selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      </main>
      <Footer />
    </AuthGuard>
  )
}
