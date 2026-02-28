import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const targetId = searchParams.get("targetId")
    const targetType = searchParams.get("targetType")

    // Stories endpoint
    if (!targetType) {
      const filter: Record<string, unknown> = {}
      if (category && category !== "all") filter.category = category

      const stories = await db.collection("stories").find(filter).sort({ publishedAt: -1 }).toArray()
      return NextResponse.json(stories)
    }

    // Reviews endpoint
    const reviewFilter: Record<string, unknown> = { targetType }
    if (targetId) reviewFilter.targetId = targetId

    const reviews = await db.collection("reviews").find(reviewFilter).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()
    const { targetType, targetId, targetName, authorName, authorEmail, rating, comment } = body

    if (!targetType || !targetId || !authorName || !rating || !comment) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const reviewId = `rev-${Date.now()}`
    await db.collection("reviews").insertOne({
      reviewId,
      targetType,
      targetId,
      targetName,
      authorName,
      authorEmail,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, reviewId })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
