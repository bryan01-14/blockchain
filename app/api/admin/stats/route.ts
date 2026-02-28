import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()

    // Data-driven stats (fallback to stored stats if needed)
    const [ticketsSold, sitesCount, activeGuides] = await Promise.all([
      db.collection("tickets").countDocuments({}),
      db.collection("sites").countDocuments({}),
      db.collection("guides").countDocuments({ certified: true }),
    ])

    const revenueAgg = await db
      .collection("transactions")
      .aggregate([
        { $match: { type: { $in: ["ticket_purchase", "craft_purchase"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()
    const totalRevenue = revenueAgg?.[0]?.total ?? 0

    const visitorsAgg = await db
      .collection("visit_events")
      .aggregate([
        { $match: { type: "entry" } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ])
      .toArray()
    const totalVisitors = visitorsAgg?.[0]?.total ?? 0

    const fraudsAgg = await db
      .collection("ticket_scan_attempts")
      .aggregate([
        { $match: { fraud: true } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ])
      .toArray()
    const fraudsPrevented = fraudsAgg?.[0]?.total ?? 0

    // Monthly visitors + revenue (last 6 months)
    const now = new Date()
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const key = d.toISOString().slice(0, 7) // YYYY-MM
      const label = d.toLocaleString("fr-FR", { month: "short" })
      months.push({ key, label })
    }

    const visitorsByMonth = await db
      .collection("visit_events")
      .aggregate([
        { $match: { type: "entry" } },
        { $addFields: { month: { $substrBytes: ["$date", 0, 7] } } },
        { $group: { _id: "$month", visitors: { $sum: 1 } } },
      ])
      .toArray()

    const revenueByMonth = await db
      .collection("transactions")
      .aggregate([
        { $match: { type: { $in: ["ticket_purchase", "craft_purchase"] } } },
        { $addFields: { month: { $substrBytes: ["$timestamp", 0, 7] } } },
        { $group: { _id: "$month", revenue: { $sum: "$amount" } } },
      ])
      .toArray()

    const vMap = new Map(visitorsByMonth.map((x) => [x._id, x.visitors]))
    const rMap = new Map(revenueByMonth.map((x) => [x._id, x.revenue]))

    const monthlyData = months.map((m) => ({
      month: m.label,
      visitors: vMap.get(m.key) ?? 0,
      revenue: rMap.get(m.key) ?? 0,
    }))

    const last = monthlyData[monthlyData.length - 1]?.visitors ?? 0
    const prev = monthlyData[monthlyData.length - 2]?.visitors ?? 0
    const monthlyGrowth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0

    // Simple proxy satisfaction: average guide rating (0-5) -> percent
    const ratingAgg = await db
      .collection("guides")
      .aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }])
      .toArray()
    const satisfactionRate = Math.round(((ratingAgg?.[0]?.avg ?? 0) / 5) * 100)

    return NextResponse.json({
      totalVisitors,
      totalRevenue,
      totalTicketsSold: ticketsSold,
      activeGuides,
      sitesCount,
      fraudsPrevented,
      monthlyGrowth,
      satisfactionRate,
      monthlyData,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
