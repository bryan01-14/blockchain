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
      .toArray()

    const orders = await db
      .collection("craft_orders")
      .find({ sellerEmail: email })
      .toArray()

    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
    const pendingBookings = bookings.filter((b) => b.status === "pending").length
    const completedBookings = bookings.filter((b) => b.status === "completed").length
    const bookingsRevenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const totalOrders = orders.length
    const confirmedOrders = orders.filter((o) => o.status === "confirmed").length
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const completedOrders = orders.filter((o) => o.status === "completed").length
    const ordersRevenue = orders
      .filter((o) => o.status === "confirmed" || o.status === "completed")
      .reduce((sum, o) => sum + (o.price || 0), 0)

    return NextResponse.json({
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        completed: completedBookings,
        revenue: bookingsRevenue,
      },
      orders: {
        total: totalOrders,
        confirmed: confirmedOrders,
        pending: pendingOrders,
        completed: completedOrders,
        revenue: ordersRevenue,
      },
      totalRevenue: bookingsRevenue + ordersRevenue,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
