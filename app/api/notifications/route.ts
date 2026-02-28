import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    const email = req.nextUrl.searchParams.get("email")
    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId ou email requis" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const query: Record<string, unknown> = {}
    if (userId) query.userId = userId
    if (email) query.email = email

    const notifications = await db
      .collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    const unreadCount = await db
      .collection("notifications")
      .countDocuments({ ...query, read: false })

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { notificationId, read } = await req.json()
    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId requis" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const { ObjectId } = await import("mongodb")
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: read ?? true } }
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
