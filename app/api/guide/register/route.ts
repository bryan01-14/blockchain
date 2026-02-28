import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hash } from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      speciality,
      experienceYears,
      bio,
      sites,
      cniNumber,
      cniDocumentUrl,
    } = await req.json()

    if (!name || !email || !password || !speciality) {
      return NextResponse.json(
        { error: "Nom, email, mot de passe et spécialité sont obligatoires" },
        { status: 400 }
      )
    }

    // CNI obligatoire et validation minimale
    if (!cniNumber || typeof cniNumber !== "string" || cniNumber.trim().length < 6) {
      return NextResponse.json(
        { error: "Le numéro de CNI est obligatoire et doit être valide." },
        { status: 400 }
      )
    }

    // Empêcher qu'une même CNI soit utilisée pour plusieurs comptes
    const db = await getDb()
    const existingCni = await db.collection("guides").findOne({
      "documents.cniNumber": cniNumber.trim(),
      email: { $ne: email },
    })

    if (existingCni) {
      return NextResponse.json(
        { error: "Ce numéro de CNI est déjà utilisé pour un autre compte guide." },
        { status: 400 }
      )
    }

    // Vérifier si un user existe déjà
    const existingUser = await db.collection("users").findOne({ email })

    let userId = existingUser?._id

    if (!existingUser) {
      const hashed = await hash(password, 10)
      const res = await db.collection("users").insertOne({
        name,
        email,
        password: hashed,
        role: "tourist", // deviendra "guide" après validation admin
        createdAt: new Date(),
      })
      userId = res.insertedId
    }

    // Créer ou mettre à jour le profil guide (collection guides)
    const existingGuide = await db.collection("guides").findOne({ email })

    const guideId =
      existingGuide?.guideId || `guide-${Date.now().toString(36)}`

    const guideDoc = {
      guideId,
      name,
      email,
      speciality,
      sites: Array.isArray(sites) ? sites : [],
      certified: false,
      rating: existingGuide?.rating ?? 0,
      totalTours: existingGuide?.totalTours ?? 0,
      status: "pending",
      phone: phone || null,
      city: city || null,
      experienceYears: Number(experienceYears ?? 0),
      bio: bio || "",
      documents: {
        cniNumber: cniNumber || "",
        cniDocumentUrl: cniDocumentUrl || "",
      },
      userId,
      createdAt: existingGuide?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (existingGuide) {
      await db.collection("guides").updateOne(
        { email },
        { $set: guideDoc }
      )
    } else {
      await db.collection("guides").insertOne(guideDoc)
    }

    return NextResponse.json({
      success: true,
      guideId,
      status: "pending",
      message:
        "Votre demande a été envoyée. Vous recevrez un email lorsque l'administrateur aura validé votre profil.",
    })
  } catch (err) {
    console.error("Guide register error", err)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

