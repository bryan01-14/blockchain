import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const filter: Record<string, unknown> = {}
    if (category && category !== "all") {
      filter.category = category
    }

    const crafts = await db.collection("crafts").find(filter).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(crafts)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()
    const { craftId, buyerEmail, buyerName } = body

    const craft = await db.collection("crafts").findOne({ craftId })
    if (!craft) {
      return NextResponse.json({ error: "Objet introuvable" }, { status: 404 })
    }
    if (!craft.inStock) {
      return NextResponse.json({ error: "Objet indisponible" }, { status: 400 })
    }

    const orderId = `order-${Date.now()}`
    const tokenId = `0xnft${Date.now().toString(16)}`

    await db.collection("craft_orders").insertOne({
      orderId,
      craftId,
      craftName: craft.name,
      artisan: craft.artisan,
      buyerEmail,
      buyerName,
      price: craft.price,
      tokenId,
      nftCertified: true,
      status: "confirmed",
      createdAt: new Date(),
    })

    // Record transaction
    await db.collection("transactions").insertOne({
      id: `tx-craft-${Date.now()}`,
      type: "craft_purchase",
      amount: craft.price,
      from: buyerEmail,
      to: craft.artisan,
      hash: `0x${Date.now().toString(16)}...craft`,
      timestamp: new Date().toISOString(),
      blockNumber: 45892301 + Math.floor(Math.random() * 1000),
      status: "confirmed",
    })

    return NextResponse.json({
      success: true,
      orderId,
      tokenId,
      craftName: craft.name,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
