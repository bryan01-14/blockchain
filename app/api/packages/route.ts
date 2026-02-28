import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import crypto from "crypto"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb()
    const body = await req.json()

    const {
      tourId,
      participantEmail,
      participantName,
      craftIds = [],
      includeTicket = true,
    } = body as {
      tourId?: string
      participantEmail?: string
      participantName?: string
      craftIds?: string[]
      includeTicket?: boolean
    }

    if (!tourId || !participantEmail || !participantName) {
      return NextResponse.json(
        { error: "tourId, participantEmail et participantName requis" },
        { status: 400 }
      )
    }

    const tour = await db.collection("tours").findOne({ tourId })
    if (!tour) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 })
    }
    if (tour.currentParticipants >= tour.maxParticipants) {
      return NextResponse.json({ error: "Visite complète" }, { status: 400 })
    }

    const packageId = `pkg-${Date.now().toString(36)}`
    const createdAt = new Date().toISOString()

    // Resolve site price for ticket (if included)
    let sitePrice = 0
    if (includeTicket && tour.siteId) {
      const site = await db.collection("sites").findOne({ siteId: tour.siteId })
      sitePrice = Number(site?.price ?? 0)
    }

    // Fetch crafts
    const craftIdList = Array.isArray(craftIds) ? craftIds.filter(Boolean) : []
    const crafts =
      craftIdList.length > 0
        ? await db
            .collection("crafts")
            .find({ craftId: { $in: craftIdList } })
            .toArray()
        : []

    // Validate crafts exist and are in stock
    if (craftIdList.length > 0) {
      const found = new Set(crafts.map((c: any) => c.craftId))
      const missing = craftIdList.filter((id) => !found.has(id))
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Objets introuvables: ${missing.join(", ")}` },
          { status: 404 }
        )
      }
      const outOfStock = crafts.filter((c: any) => !c.inStock)
      if (outOfStock.length > 0) {
        return NextResponse.json(
          { error: `Objets indisponibles: ${outOfStock.map((c: any) => c.name).join(", ")}` },
          { status: 400 }
        )
      }
    }

    // Create tour booking
    const bookingId = `book-${Date.now()}`
    await db.collection("tour_bookings").insertOne({
      bookingId,
      packageId,
      tourId,
      tourTitle: tour.title,
      siteId: tour.siteId,
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

    // Ticket NFT (included in package)
    let ticketResult:
      | {
          id: string
          tokenId: string
          merkleRoot: string
          qrCode: string
          siteId: string
          siteName: string
          visitDate: string
        }
      | null = null

    if (includeTicket && tour.siteId) {
      const ticketId = `tkt-${Date.now().toString(36)}`
      const tokenId = `0x${crypto.randomBytes(4).toString("hex")}...${crypto
        .randomBytes(4)
        .toString("hex")}`
      const merkleRoot = `0x${crypto.randomBytes(8).toString("hex")}...${crypto
        .randomBytes(8)
        .toString("hex")}`
      const qrCode = `QR-${String(tour.siteId).toUpperCase().slice(0, 2)}-${Date.now().toString(36)}-2026`

      const ticket = {
        ticketId,
        packageId,
        siteId: tour.siteId,
        siteName: tour.siteName,
        ownerEmail: participantEmail,
        ownerName: participantName,
        purchaseDate: todayISO(),
        visitDate: tour.date,
        tokenId,
        merkleRoot,
        verified: true,
        qrCode,
        status: "valid",
      }

      await db.collection("tickets").insertOne(ticket)

      ticketResult = {
        id: ticketId,
        tokenId,
        merkleRoot,
        qrCode,
        siteId: tour.siteId,
        siteName: tour.siteName,
        visitDate: tour.date,
      }
    }

    // Craft orders (optional)
    const craftOrders: Array<{ orderId: string; craftId: string; tokenId: string; craftName: string; price: number }> =
      []
    for (const c of crafts as any[]) {
      const orderId = `order-${Date.now()}-${c.craftId}`
      const tokenId = `0xnft${Date.now().toString(16)}`
      await db.collection("craft_orders").insertOne({
        orderId,
        packageId,
        craftId: c.craftId,
        craftName: c.name,
        artisan: c.artisan,
        buyerEmail: participantEmail,
        buyerName: participantName,
        price: c.price,
        tokenId,
        nftCertified: true,
        status: "confirmed",
        createdAt: new Date(),
      })
      craftOrders.push({
        orderId,
        craftId: c.craftId,
        tokenId,
        craftName: c.name,
        price: c.price,
      })
    }

    // Transactions
    const transactions: any[] = []
    if (ticketResult) {
      transactions.push({
        txId: `tx-${Date.now().toString(36)}-ticket`,
        packageId,
        type: "ticket_purchase",
        amount: sitePrice,
        from: participantEmail,
        to: tour.siteName,
        hash: `0x${crypto.randomBytes(16).toString("hex")}`,
        timestamp: createdAt,
        blockNumber: 45892301 + Math.floor(Math.random() * 10000),
        status: "confirmed",
        siteId: ticketResult.siteId,
        siteName: ticketResult.siteName,
        ticketId: ticketResult.id,
      })
    }

    transactions.push({
      txId: `tx-${Date.now().toString(36)}-tour`,
      packageId,
      type: "guide_payment",
      amount: tour.price,
      from: participantEmail,
      to: tour.guide,
      hash: `0x${Date.now().toString(16)}...tour`,
      timestamp: createdAt,
      blockNumber: 45892301 + Math.floor(Math.random() * 1000),
      status: "confirmed",
      tourId,
      bookingId,
      siteId: tour.siteId,
      siteName: tour.siteName,
    })

    for (const o of craftOrders) {
      transactions.push({
        txId: `tx-${Date.now().toString(36)}-${o.orderId}`,
        packageId,
        type: "craft_purchase",
        amount: o.price,
        from: participantEmail,
        to: o.craftName,
        hash: `0x${Date.now().toString(16)}...craft`,
        timestamp: createdAt,
        blockNumber: 45892301 + Math.floor(Math.random() * 1000),
        status: "confirmed",
        orderId: o.orderId,
        craftId: o.craftId,
      })
    }

    const totalAmount =
      (ticketResult ? sitePrice : 0) +
      Number(tour.price ?? 0) +
      craftOrders.reduce((sum, o) => sum + Number(o.price ?? 0), 0)

    transactions.push({
      txId: `tx-${Date.now().toString(36)}-${packageId}`,
      packageId,
      type: "package_purchase",
      amount: totalAmount,
      from: participantEmail,
      to: "VisitSecure",
      hash: `0x${crypto.randomBytes(16).toString("hex")}`,
      timestamp: createdAt,
      blockNumber: 45892301 + Math.floor(Math.random() * 1000),
      status: "confirmed",
      items: {
        ticket: !!ticketResult,
        tour: true,
        crafts: craftOrders.length,
      },
    })

    await db.collection("transactions").insertMany(transactions)

    // Update stored stats (optional compatibility)
    await db.collection("stats").updateOne(
      { key: "dashboard" },
      {
        $inc: {
          totalTicketsSold: ticketResult ? 1 : 0,
          totalRevenue: totalAmount,
        },
      }
    )

    await db.collection("package_orders").insertOne({
      packageId,
      participantEmail,
      participantName,
      siteId: tour.siteId,
      siteName: tour.siteName,
      tourId,
      bookingId,
      ticketId: ticketResult?.id ?? null,
      craftOrderIds: craftOrders.map((o) => o.orderId),
      totalAmount,
      createdAt,
      status: "confirmed",
    })

    return NextResponse.json({
      success: true,
      packageId,
      bookingId,
      ticket: ticketResult,
      craftOrders,
      totalAmount,
      date: tour.date,
      time: tour.time,
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

