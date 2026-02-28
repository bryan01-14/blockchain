import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { sendGuideApprovalEmail } from "@/lib/email"

export async function GET() {
  try {
    const db = await getDb()
    const guides = await db
      .collection("guides")
      .find({})
      .sort({ rating: -1 })
      .toArray()

    const mapped = guides.map((g) => ({
      id: g.guideId,
      name: g.name,
      email: g.email,
      speciality: g.speciality,
      sites: g.sites,
      certified: g.certified,
      rating: g.rating,
      totalTours: g.totalTours,
      status: g.status,
      documents: g.documents || null,
      userId: g.userId,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = await getDb()
    const { guideId, status } = await req.json()

    if (!guideId || !status) {
      return NextResponse.json(
        { error: "guideId et status requis" },
        { status: 400 }
      )
    }

    const certified = status === "approved"

    await db.collection("guides").updateOne(
      { guideId },
      { $set: { status, certified } }
    )

    const guide = await db.collection("guides").findOne({ guideId })

    if (certified) {
      await db.collection("stats").updateOne(
        { key: "dashboard" },
        { $inc: { activeGuides: 1 } }
      )

      // Promouvoir le compte user associé au rôle "guide"
      if (guide?.email) {
        await db.collection("users").updateOne(
          { email: guide.email },
          { $set: { role: "guide" } }
        )

        const user = await db.collection("users").findOne({ email: guide.email })
        const userId = user?._id?.toString()

        // Notification in-app (pas d'email obligatoire)
        await db.collection("notifications").insertOne({
          userId: userId || null,
          email: guide.email,
          type: "guide_approved",
          message: "Félicitations ! Votre profil de guide a été validé par l'administrateur. Vous pouvez maintenant proposer des visites.",
          read: false,
          createdAt: new Date(),
        })

        try {
          await sendGuideApprovalEmail(guide.email, guide.name || "Guide")
        } catch {
          // SMTP non configuré : on ignore
        }
      }
    } else {
      // Refusé : notification in-app
      if (guide?.email) {
        const user = await db.collection("users").findOne({ email: guide.email })
        const userId = user?._id?.toString()
        await db.collection("notifications").insertOne({
          userId: userId || null,
          email: guide.email,
          type: "guide_rejected",
          message: "Votre demande de certification guide n'a pas été acceptée. Contactez l'administrateur pour plus d'informations.",
          read: false,
          createdAt: new Date(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
