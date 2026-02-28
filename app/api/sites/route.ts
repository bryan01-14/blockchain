import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { culturalSites } from "@/lib/data"

export async function GET(req: NextRequest) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const filter: Record<string, unknown> = { published: true }

    if (category && category !== "all") {
      filter.category = category
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    const sites = await db
      .collection("sites")
      .find(filter)
      .sort({ visitors: -1 })
      .toArray()

    if (sites.length > 0) {
      // Utiliser les images de lib/data.ts (prioritaires sur MongoDB)
      const imageBySiteId = Object.fromEntries(
        culturalSites.map((c) => [c.id, c.image])
      )
      const mapped = sites.map((s) => ({
        id: s.siteId,
        name: s.name,
        description: s.description,
        location: s.location,
        category: s.category,
        image: imageBySiteId[s.siteId] ?? s.image,
        price: s.price,
        rating: s.rating,
        visitors: s.visitors,
        unesco: s.unesco,
        coordinates: s.coordinates,
      }))
      return NextResponse.json(mapped)
    }

    // Fallback: MongoDB vide ou pas de site publié - utiliser les données statiques
    let fallback = [...culturalSites]
    if (category && category !== "all") {
      fallback = fallback.filter((s) => s.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      fallback = fallback.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      )
    }
    fallback.sort((a, b) => b.visitors - a.visitors)
    return NextResponse.json(
      fallback.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        location: s.location,
        category: s.category,
        image: s.image,
        price: s.price,
        rating: s.rating,
        visitors: s.visitors,
        unesco: s.unesco,
        coordinates: s.coordinates,
      }))
    )
  } catch {
    // Fallback en cas d'erreur MongoDB
    const fallback = [...culturalSites].sort((a, b) => b.visitors - a.visitors)
    return NextResponse.json(
      fallback.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        location: s.location,
        category: s.category,
        image: s.image,
        price: s.price,
        rating: s.rating,
        visitors: s.visitors,
        unesco: s.unesco,
        coordinates: s.coordinates,
      }))
    )
  }
}
