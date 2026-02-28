import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

function randomAlphanum(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const db = await getDb()
    const guide = await db.collection("guides").findOne({ email })

    if (!guide) {
      return NextResponse.json({
        certified: false,
        status: "pending_cni",
        cniSubmitted: false,
      })
    }

    const cniSubmitted = !!(
      guide.documents?.cniNumber &&
      (guide.documents?.cniDocumentData || guide.documents?.cniDocumentUrl)
    )

    let permanentId = guide.permanentId as string | undefined
    if (!permanentId) {
      permanentId = `VS-G-${randomAlphanum(8)}`
      await db.collection("guides").updateOne(
        { email },
        { $set: { permanentId, updatedAt: new Date() } }
      )
    }

    return NextResponse.json({
      guideId: guide.guideId,
      permanentId,
      name: guide.name,
      email: guide.email,
      certified: guide.certified ?? false,
      status: guide.status ?? "pending_cni",
      cniSubmitted,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
