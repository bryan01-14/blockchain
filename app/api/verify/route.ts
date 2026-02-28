import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const db = await getDb()
    const { qrCode, ticketId } = await req.json()

    const code = qrCode || ticketId
    if (!code) {
      return NextResponse.json(
        { error: "Code QR ou identifiant du billet requis" },
        { status: 400 }
      )
    }

    // Search by qrCode or ticketId
    const ticket = await db.collection("tickets").findOne({
      $or: [{ qrCode: code }, { ticketId: code }],
    })

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: "Billet introuvable - possible contrefacon",
        fraud: true,
      })
    }

    const isExpired = ticket.status === "expired"
    const isUsed = ticket.status === "used"
    const isValid = ticket.status === "valid" && ticket.verified

    // Retrieve the site for extra info
    const site = await db.collection("sites").findOne({ siteId: ticket.siteId })

    return NextResponse.json({
      valid: isValid,
      expired: isExpired,
      used: isUsed,
      fraud: false,
      ticket: {
        id: ticket.ticketId,
        siteId: ticket.siteId,
        siteName: ticket.siteName,
        ownerName: ticket.ownerName,
        ownerEmail: ticket.ownerEmail,
        purchaseDate: ticket.purchaseDate,
        visitDate: ticket.visitDate,
        tokenId: ticket.tokenId,
        merkleRoot: ticket.merkleRoot,
        qrCode: ticket.qrCode,
        status: ticket.status,
      },
      site: site
        ? { name: site.name, location: site.location, image: site.image }
        : null,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
