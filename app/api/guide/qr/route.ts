import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import QRCode from "qrcode"

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
    let guide = await db.collection("guides").findOne({ email })
    if (!guide) {
      return NextResponse.json({ error: "Guide non trouvé" }, { status: 404 })
    }

    let permanentId = guide.permanentId as string | undefined
    if (!permanentId) {
      permanentId = `VS-G-${randomAlphanum(8)}`
      await db.collection("guides").updateOne(
        { email },
        { $set: { permanentId, updatedAt: new Date() } }
      )
    }

    const pngBuffer = await QRCode.toBuffer(permanentId, {
      type: "png",
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (err) {
    console.error("QR generation error", err)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
