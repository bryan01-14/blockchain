import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const guideId = req.nextUrl.searchParams.get("guideId")
    if (!guideId) {
      return NextResponse.json({ error: "guideId requis" }, { status: 400 })
    }

    const db = await getDb()
    const guide = await db.collection("guides").findOne({ guideId })

    if (!guide?.documents?.cniDocumentData) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      )
    }

    const buffer = Buffer.from(guide.documents.cniDocumentData, "base64")
    const mimeType =
      guide.documents.cniDocumentType || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": "inline",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
