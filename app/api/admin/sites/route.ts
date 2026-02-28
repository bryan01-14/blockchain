import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const sites = await db
      .collection("sites")
      .find({})
      .sort({ visitors: -1 })
      .toArray()

    const mapped = sites.map((s) => ({
      id: s.siteId,
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
      published: s.published,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
