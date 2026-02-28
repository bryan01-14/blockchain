import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

type CheckinType = "entry" | "exit"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb()
    const body = await req.json().catch(() => ({}))

    const code: string = body?.qrCode || body?.ticketId || body?.code || ""
    const type: CheckinType = body?.type === "exit" ? "exit" : "entry"

    if (!code) {
      return NextResponse.json(
        { error: "Code QR ou identifiant du billet requis" },
        { status: 400 }
      )
    }

    const ticket = await db.collection("tickets").findOne({
      $or: [{ qrCode: code }, { ticketId: code }],
    })

    // Log attempt (for fraud/analytics)
    const attemptBase = {
      code,
      type,
      at: new Date().toISOString(),
      date: todayISO(),
    }

    if (!ticket) {
      await db.collection("ticket_scan_attempts").insertOne({
        ...attemptBase,
        result: "not_found",
        fraud: true,
      })
      return NextResponse.json(
        {
          valid: false,
          fraud: true,
          error: "Billet introuvable - possible contrefaçon",
        },
        { status: 404 }
      )
    }

    // Basic validity checks for entry
    const isExpired = ticket.status === "expired"
    const isUsed = ticket.status === "used"
    const isValid = ticket.status === "valid" && ticket.verified

    if (type === "entry") {
      if (!isValid) {
        await db.collection("ticket_scan_attempts").insertOne({
          ...attemptBase,
          ticketId: ticket.ticketId,
          siteId: ticket.siteId,
          result: "rejected",
          expired: isExpired,
          used: isUsed,
        })
        return NextResponse.json(
          {
            valid: false,
            expired: isExpired,
            used: isUsed,
            error: isExpired
              ? "Billet expiré"
              : isUsed
                ? "Billet déjà utilisé"
                : "Billet invalide",
          },
          { status: 400 }
        )
      }
    }

    // Prevent duplicate "entry" scans on same day
    if (type === "entry") {
      const already = await db.collection("visit_events").findOne({
        ticketId: ticket.ticketId,
        type: "entry",
        date: todayISO(),
      })
      if (already) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message: "Entrée déjà enregistrée aujourd'hui",
          event: already,
        })
      }
    }

    const event = {
      ticketId: ticket.ticketId,
      qrCode: ticket.qrCode,
      siteId: ticket.siteId,
      siteName: ticket.siteName,
      ownerEmail: ticket.ownerEmail,
      ownerName: ticket.ownerName,
      type,
      at: new Date().toISOString(),
      date: todayISO(),
      source: "qr",
    }

    await db.collection("visit_events").insertOne(event)

    if (type === "entry") {
      // Mark ticket used at first entry scan
      await db.collection("tickets").updateOne(
        { ticketId: ticket.ticketId },
        { $set: { status: "used", usedAt: event.at } }
      )

      // Update site visitors count based on actual entrances
      await db.collection("sites").updateOne(
        { siteId: ticket.siteId },
        { $inc: { visitors: 1 } }
      )
    }

    await db.collection("ticket_scan_attempts").insertOne({
      ...attemptBase,
      ticketId: ticket.ticketId,
      siteId: ticket.siteId,
      result: "accepted",
    })

    return NextResponse.json({
      success: true,
      event,
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
        status: type === "entry" ? "used" : ticket.status,
      },
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

