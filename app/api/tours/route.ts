import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const siteId = searchParams.get("siteId")

    const filter: Record<string, unknown> = {}
    if (siteId) filter.siteId = siteId

    const tours = await db.collection("tours").find(filter).sort({ date: 1 }).toArray()
    return NextResponse.json(tours)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()
    const { tourId, participantEmail, participantName } = body

    const tour = await db.collection("tours").findOne({ tourId })
    if (!tour) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 })
    }
    if (tour.currentParticipants >= tour.maxParticipants) {
      return NextResponse.json({ error: "Visite complete" }, { status: 400 })
    }

    const bookingId = `book-${Date.now()}`

    await db.collection("tour_bookings").insertOne({
      bookingId,
      tourId,
      tourTitle: tour.title,
      siteName: tour.siteName,
      guide: tour.guide,
      participantEmail,
      participantName,
      date: tour.date,
      time: tour.time,
      price: tour.price,
      status: "confirmed",
      createdAt: new Date(),
    })

    await db.collection("tours").updateOne(
      { tourId },
      { $inc: { currentParticipants: 1 } }
    )

    // Record transaction
    await db.collection("transactions").insertOne({
      id: `tx-tour-${Date.now()}`,
      type: "guide_payment",
      amount: tour.price,
      from: participantEmail,
      to: tour.guide,
      hash: `0x${Date.now().toString(16)}...tour`,
      timestamp: new Date().toISOString(),
      blockNumber: 45892301 + Math.floor(Math.random() * 1000),
      status: "confirmed",
    })

    return NextResponse.json({
      success: true,
      bookingId,
      tourTitle: tour.title,
      date: tour.date,
      time: tour.time,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
