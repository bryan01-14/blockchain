import { streamText, convertToModelMessages, tool } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

// Extract keywords from user message for MongoDB text search
function extractSearchTerms(text: string): string[] {
  const stopWords = new Set([
    "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "en", "a",
    "est", "ce", "que", "qui", "dans", "pour", "par", "sur", "avec", "pas",
    "ne", "se", "son", "sa", "ses", "au", "aux", "mon", "ma", "mes", "ton",
    "ta", "tes", "il", "elle", "nous", "vous", "ils", "je", "tu", "on",
    "y", "ça", "ca", "mais", "donc", "car", "ni", "si", "quoi", "comment",
    "quand", "ou", "pourquoi", "quel", "quelle", "quels", "quelles",
    "bonjour", "salut", "merci", "svp", "stp", "oui", "non", "peut",
    "peux", "veux", "voudrais", "aimerais", "dis", "moi", "me", "te",
    "this", "the", "is", "are", "was", "what", "how", "where", "when",
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
}

// Search knowledge base using MongoDB text search + regex fallback
async function searchKnowledgeBase(query: string, limit = 6): Promise<string[]> {
  const db = await getDb()
  const collection = db.collection("knowledge_base")
  const terms = extractSearchTerms(query)

  if (terms.length === 0) {
    // Return general overview documents
    const docs = await collection.find({}).limit(4).toArray()
    return docs.map((d) => `[${d.category}] ${d.title}\n${d.content}${d.practical_info ? `\nInfos pratiques: ${JSON.stringify(d.practical_info)}` : ""}`)
  }

  // Try MongoDB text search first
  const textQuery = terms.join(" ")
  let results = await collection
    .find(
      { $text: { $search: textQuery } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .toArray()

  // If text search returns few results, fallback to regex
  if (results.length < 2) {
    const regexPatterns = terms.map((t) => new RegExp(t, "i"))
    const regexQuery = {
      $or: [
        { content: { $in: regexPatterns } },
        { title: { $in: regexPatterns } },
        { tags: { $in: terms } },
        { location: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
      ],
    }
    const regexResults = await collection.find(regexQuery).limit(limit).toArray()

    // Merge, avoiding duplicates
    const seenIds = new Set(results.map((r) => r._id.toString()))
    for (const doc of regexResults) {
      if (!seenIds.has(doc._id.toString())) {
        results.push(doc)
        seenIds.add(doc._id.toString())
      }
    }
  }

  return results.slice(0, limit).map((d) => {
    let text = `[${d.category}] ${d.title}\n${d.content}`
    if (d.practical_info) {
      const info = d.practical_info
      text += `\n\n--- Informations Pratiques ---`
      if (info.horaires) text += `\nHoraires: ${info.horaires}`
      if (info.tarif) text += `\nTarifs: ${info.tarif}`
      if (info.transport) text += `\nTransport: ${info.transport}`
      if (info.meilleure_periode) text += `\nMeilleure periode: ${info.meilleure_periode}`
      if (info.duree_visite) text += `\nDuree de visite: ${info.duree_visite}`
      if (info.tips) text += `\nConseils: ${info.tips}`
    }
    return text
  })
}

// Also search sites, crafts, tours from the application data
async function searchAppData(query: string): Promise<string[]> {
  const db = await getDb()
  const terms = extractSearchTerms(query)
  if (terms.length === 0) return []

  const regexPatterns = terms.map((t) => new RegExp(t, "i"))
  const results: string[] = []

  // Search sites
  const sites = await db
    .collection("sites")
    .find({
      $or: [
        { name: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
        { location: { $in: regexPatterns } },
      ],
    })
    .limit(3)
    .toArray()

  for (const s of sites) {
    results.push(
      `[Site] ${s.name} (${s.location}) - ${s.description} - Prix: ${s.price?.toLocaleString("fr-FR")} FCFA - UNESCO: ${s.unesco ? "Oui" : "Non"}`
    )
  }

  // Search crafts
  const crafts = await db
    .collection("crafts")
    .find({
      $or: [
        { name: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
        { origin: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
      ],
    })
    .limit(3)
    .toArray()

  for (const c of crafts) {
    results.push(
      `[Artisanat] ${c.name} - Origine: ${c.origin} - ${c.description} - Prix: ${c.price?.toLocaleString("fr-FR")} FCFA - Certifie NFT: ${c.nftCertified ? "Oui" : "Non"}`
    )
  }

  // Search tours
  const tours = await db
    .collection("tours")
    .find({
      $or: [
        { title: { $in: regexPatterns } },
        { site: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
      ],
    })
    .limit(3)
    .toArray()

  for (const t of tours) {
    results.push(
      `[Visite] ${t.title} - Site: ${t.site} - Guide: ${t.guide} - Duree: ${t.duration} - Prix: ${t.price?.toLocaleString("fr-FR")} FCFA - Places: ${t.spots} disponibles`
    )
  }

  return results
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get the user's last message text
  const lastMsg = messages[messages.length - 1]
  const userQuery =
    lastMsg?.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("") ||
    lastMsg?.content ||
    ""

  // RAG: search knowledge base and app data in parallel
  const [kbResults, appResults] = await Promise.all([
    searchKnowledgeBase(userQuery),
    searchAppData(userQuery),
  ])

  const allContext = [...kbResults, ...appResults]
  const contextBlock =
    allContext.length > 0
      ? `\n\n=== CONTEXTE DE LA BASE DE CONNAISSANCES ===\n${allContext.join("\n\n---\n\n")}\n=== FIN DU CONTEXTE ===`
      : ""

  const systemPrompt = `Tu es VisitBot, l'assistant intelligent de VisitSecure CI, la plateforme de tourisme culturel blockchain de Cote d'Ivoire.

TON ROLE:
- Guider les touristes dans la decouverte du patrimoine culturel ivoirien
- Recommander des sites, des visites guidees, et des objets artisanaux
- Fournir des informations pratiques (horaires, tarifs, transport, conseils)
- Expliquer le fonctionnement des billets NFT et de la blockchain dans notre plateforme
- Partager des connaissances sur l'histoire, les traditions, la gastronomie et les cultures de Cote d'Ivoire

REGLES:
- Reponds TOUJOURS en francais
- Sois chaleureux, enthousiaste et accueillant, comme un guide ivoirien passionné
- Base tes reponses UNIQUEMENT sur le contexte fourni par la base de connaissances
- Si tu ne trouves pas l'information dans le contexte, dis-le honnetement et suggere de consulter la plateforme
- Utilise des prix en FCFA
- Formate tes reponses avec des titres, listes et paragraphes pour une bonne lisibilite
- Propose des recommandations personnalisees quand c'est pertinent
- Mentionne les informations pratiques (horaires, tarifs, transport) quand disponibles
- Pour les questions sur la blockchain/NFT, explique simplement comment la plateforme garantit l'authenticite des billets et des objets artisanaux

FONCTIONNALITES DE LA PLATEFORME:
- Sites Culturels: Decouverte et achat de billets NFT pour des sites comme Grand-Bassam, la Basilique de Yamoussoukro, le Parc de Tai, etc.
- Marketplace Artisanat: Achat d'objets artisanaux certifies par NFT (masques, textiles, poteries, sculptures, bijoux, instruments)
- Visites Guidees: Reservation de visites avec des guides certifies directement depuis la page des sites
- Histoires & Culture: Recits multimedia sur les traditions culturelles ivoiriennes
- Blockchain: Tracabilite et verification des billets NFT via QR code et arbres de Merkle
${contextBlock}`

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: modelMessages,
    tools: {
      searchSites: tool({
        description: "Rechercher des sites culturels, artisanat ou visites guidees sur la plateforme VisitSecure",
        inputSchema: z.object({
          query: z.string().describe("La recherche a effectuer"),
        }),
        execute: async ({ query }) => {
          const [kb, app] = await Promise.all([
            searchKnowledgeBase(query, 4),
            searchAppData(query),
          ])
          return { results: [...kb, ...app] }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
