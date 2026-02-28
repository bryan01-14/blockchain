import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const transactions = await db
      .collection("transactions")
      .find({})
      .sort({ timestamp: -1 })
      .toArray()

    const mapped = transactions.map((t) => ({
      id: t.txId,
      type: t.type,
      amount: t.amount,
      from: t.from,
      to: t.to,
      hash: t.hash,
      timestamp: t.timestamp,
      blockNumber: t.blockNumber,
      status: t.status,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb()
    const body = await req.json()

    const result = await db.collection("transactions").insertOne(body)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...body,
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
