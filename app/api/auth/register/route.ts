import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hash } from "bcryptjs"

function randomAlphanum(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caracteres" },
        { status: 400 }
      )
    }

    const selectedRole = role === "guide" ? "guide" : "tourist"

    const db = await getDb()
    const existing = await db.collection("users").findOne({ email })

    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe deja" },
        { status: 409 }
      )
    }

    const hashed = await hash(password, 8)
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashed,
      role: selectedRole,
      createdAt: new Date(),
    })

    // Si guide : créer un profil guide avec identifiant permanent unique
    if (selectedRole === "guide") {
      const guideId = `guide-${Date.now().toString(36)}`
      const permanentId = `VS-G-${randomAlphanum(8)}`
      await db.collection("guides").insertOne({
        guideId,
        permanentId,
        name,
        email,
        speciality: "",
        sites: [],
        certified: false,
        rating: 0,
        totalTours: 0,
        status: "pending_cni",
        phone: null,
        city: null,
        experienceYears: 0,
        bio: "",
        documents: { cniNumber: "", cniDocumentData: null, cniDocumentType: null },
        userId: result.insertedId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
      role: selectedRole,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
