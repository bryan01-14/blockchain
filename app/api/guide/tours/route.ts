import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const guide = req.nextUrl.searchParams.get("guide")
    if (!guide) {
      return NextResponse.json({ error: "Guide requis" }, { status: 400 })
    }

    const db = await getDb()
    const tours = await db
      .collection("guided_tours")
      .find({ guide })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(tours)
  } catch (error) {
    console.error("Error fetching tours:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      site,
      guide,
      guideEmail,
      description,
      date,
      time,
      duration,
      price,
      maxSpots,
      language,
      includes,
    } = body

    if (!title || !site || !guide) {
      return NextResponse.json({ error: "Donnees manquantes" }, { status: 400 })
    }

    const db = await getDb()
    const tourId = `tour-${Date.now()}`

    const includesArray =
      typeof includes === "string"
        ? includes
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : Array.isArray(includes)
          ? includes
          : []

    await db.collection("guided_tours").insertOne({
      tourId,
      title,
      site,
      guide,
      guideEmail,
      description: description || "",
      date,
      time,
      duration,
      price: Number(price),
      maxSpots: Number(maxSpots),
      availableSpots: Number(maxSpots),
      language: language || "Français",
      includes: includesArray,
      status: "active",
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, tourId })
  } catch (error) {
    console.error("Error creating tour:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
