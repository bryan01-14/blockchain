import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import crypto from "crypto"

export async function GET(req: NextRequest) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    const tickets = await db
      .collection("tickets")
      .find({ ownerEmail: email })
      .sort({ purchaseDate: -1 })
      .toArray()

    const mapped = tickets.map((t) => ({
      id: t.ticketId,
      siteId: t.siteId,
      siteName: t.siteName,
      ownerEmail: t.ownerEmail,
      ownerName: t.ownerName,
      purchaseDate: t.purchaseDate,
      visitDate: t.visitDate,
      tokenId: t.tokenId,
      merkleRoot: t.merkleRoot,
      verified: t.verified,
      qrCode: t.qrCode,
      status: t.status,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb()
    const body = await req.json()

    const { siteId, siteName, ownerEmail, ownerName, visitDate, price } = body

    if (!siteId || !ownerEmail || !visitDate) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      )
    }

    const ticketId = `tkt-${Date.now().toString(36)}`
    const tokenId = `0x${crypto.randomBytes(4).toString("hex")}...${crypto.randomBytes(4).toString("hex")}`
    const merkleRoot = `0x${crypto.randomBytes(8).toString("hex")}...${crypto.randomBytes(8).toString("hex")}`
    const qrCode = `QR-${siteId.toUpperCase().slice(0, 2)}-${Date.now().toString(36)}-2026`

    const ticket = {
      ticketId,
      siteId,
      siteName,
      ownerEmail,
      ownerName,
      purchaseDate: new Date().toISOString().split("T")[0],
      visitDate,
      tokenId,
      merkleRoot,
      verified: true,
      qrCode,
      status: "valid",
    }

    await db.collection("tickets").insertOne(ticket)

    // Also create a blockchain transaction
    const txId = `tx-${Date.now().toString(36)}`
    await db.collection("transactions").insertOne({
      txId,
      type: "ticket_purchase",
      amount: price || 0,
      from: `0x${crypto.randomBytes(4).toString("hex")}...${crypto.randomBytes(4).toString("hex")}`,
      to: `0x${crypto.randomBytes(4).toString("hex")}...${crypto.randomBytes(4).toString("hex")}`,
      hash: `0x${crypto.randomBytes(16).toString("hex")}`,
      timestamp: new Date().toISOString(),
      blockNumber: 45892301 + Math.floor(Math.random() * 10000),
      status: "confirmed",
      siteId,
      siteName,
      ticketId,
    })
 
    // Note: la fréquentation réelle est comptée au scan d'entrée (voir /api/checkin).
    // Ici on enregistre uniquement l'achat (revenus / tickets vendus).
    await db.collection("stats").updateOne(
      { key: "dashboard" },
      { $inc: { totalTicketsSold: 1, totalRevenue: price || 0 } }
    )

    // Incrémenter immédiatement la fréquentation estimée du site
    await db.collection("sites").updateOne(
      { siteId },
      { $inc: { visitors: 6 } }
    )

    return NextResponse.json({
      ...ticket,
      id: ticket.ticketId,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
