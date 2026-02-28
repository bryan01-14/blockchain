import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const db = await getDb()
    const bookings = await db
      .collection("tour_bookings")
      .find({ guideEmail: email })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, status } = await req.json()
    if (!bookingId || !status) {
      return NextResponse.json({ error: "Donnees manquantes" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("tour_bookings").updateOne(
      { bookingId },
      { $set: { status, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
