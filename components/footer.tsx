import Link from "next/link"
import { Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Globe className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">VisitSecure CI</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-70">
              {"Plateforme blockchain pour la tra\u00e7abilit\u00e9 et la promotion du tourisme culturel en C\u00f4te d'Ivoire."}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Plateforme</h4>
            <ul className="flex flex-col gap-2 text-sm opacity-70">
              <li>
                <Link href="/sites" className="hover:opacity-100">
                  Sites Culturels
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:opacity-100">
                  Artisanat
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:opacity-100">
                  Histoires & Culture
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:opacity-100">
                  Billets NFT
                </Link>
              </li>
              <li>
                <Link href="/blockchain" className="hover:opacity-100">
                  Blockchain
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:opacity-100">
                  Assistant IA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Technologies</h4>
            <ul className="flex flex-col gap-2 text-sm opacity-70">
              <li>Smart Contracts (Solidity)</li>
              <li>Arbres de Merkle</li>
              <li>NFT & IPFS</li>
              <li>Intelligence Artificielle</li>
              <li>Zero Knowledge Proofs</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Partenaires</h4>
            <ul className="flex flex-col gap-2 text-sm opacity-70">
              <li>{"Minist\u00e8re du Tourisme"}</li>
              <li>UNESCO</li>
              <li>Office National du Tourisme</li>
              <li>Polygon Network</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
          <p className="text-sm opacity-50">
            {"2026 VisitSecure CI. Tous droits r\u00e9serv\u00e9s."}
          </p>
          <div className="flex gap-4 text-sm opacity-50">
            <span>{"Politique de confidentialit\u00e9"}</span>
            <span>{"Conditions d'utilisation"}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
