import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const db = await getDb()
    const orders = await db
      .collection("craft_orders")
      .find({ sellerEmail: email })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json()
    if (!orderId || !status) {
      return NextResponse.json({ error: "Donnees manquantes" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("craft_orders").updateOne(
      { orderId },
      { $set: { status, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
