import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

const MAX_SIZE = 4 * 1024 * 1024 // 4 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]

/** Normalise une chaîne pour comparaison (minuscules, sans accents, espaces réduits). */
function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
}

/** Vérifie que le nom sur la CNI correspond au nom du guide (même personne). */
function namesMatch(guideName: string, nameOnCni: string): boolean {
  const g = normalizeName(guideName)
  const n = normalizeName(nameOnCni)
  if (!n || n.length < 2) return false
  const guideWords = g.split(/\s+|-/).filter(Boolean)
  if (guideWords.length === 0) return false
  return guideWords.every((w) => w.length < 2 || n.includes(w))
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const email = formData.get("email") as string | null
    const cniNumber = formData.get("cniNumber") as string | null
    const nameOnCni = formData.get("nameOnCni") as string | null
    const file = formData.get("cniFile") as File | null

    if (!email || !cniNumber || !file) {
      return NextResponse.json(
        { error: "Email, numéro CNI et fichier sont requis." },
        { status: 400 }
      )
    }

    if (typeof cniNumber !== "string" || cniNumber.trim().length < 6) {
      return NextResponse.json(
        { error: "Le numéro de CNI doit contenir au moins 6 caractères." },
        { status: 400 }
      )
    }

    const nameOnCniStr = typeof nameOnCni === "string" ? nameOnCni.trim() : ""
    if (!nameOnCniStr || nameOnCniStr.length < 3) {
      return NextResponse.json(
        { error: "Le nom tel qu'il apparaît sur la CNI est requis pour vérifier que la pièce vous appartient." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 4 Mo." },
        { status: 400 }
      )
    }

    const mimeType = file.type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Format accepté : image (JPG, PNG, WebP) ou PDF." },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const db = await getDb()

    const existingCni = await db.collection("guides").findOne({
      "documents.cniNumber": cniNumber.trim(),
      email: { $ne: email },
    })
    if (existingCni) {
      return NextResponse.json(
        { error: "Ce numéro de CNI est déjà utilisé pour un autre compte." },
        { status: 400 }
      )
    }

    const guide = await db.collection("guides").findOne({ email })
    if (!guide) {
      return NextResponse.json(
        { error: "Profil guide non trouvé." },
        { status: 404 }
      )
    }

    const guideName = (guide.name as string) || ""
    if (!namesMatch(guideName, nameOnCniStr)) {
      return NextResponse.json(
        {
          error:
            "Le nom indiqué ne correspond pas à votre nom d'inscription. Saisissez le nom exact tel qu'il figure sur votre CNI (prénom et nom).",
        },
        { status: 400 }
      )
    }

    await db.collection("guides").updateOne(
      { email },
      {
        $set: {
          "documents.cniNumber": cniNumber.trim(),
          "documents.cniDocumentData": base64,
          "documents.cniDocumentType": mimeType,
          "documents.nameOnCni": nameOnCniStr,
          status: "pending",
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message:
        "Votre CNI a été soumise. L'administrateur examinera votre demande et vous recevrez un message dans l'application.",
    })
  } catch (err) {
    console.error("Upload CNI error", err)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
