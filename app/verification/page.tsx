"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  QrCode,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Scan,
  FileCheck,
  Lock,
} from "lucide-react"

interface VerifiedTicket {
  id: string
  siteId: string
  siteName: string
  ownerName: string
  ownerEmail: string
  purchaseDate: string
  visitDate: string
  tokenId: string
  merkleRoot: string
  qrCode: string
  status: "valid" | "used" | "expired"
}

type VerificationState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "found"; ticket: VerifiedTicket; valid: boolean; expired: boolean; used: boolean }
  | { status: "not_found"; fraud: boolean }

type CheckinResult =
  | { status: "idle" }
  | { status: "loading"; type: "entry" | "exit" }
  | { status: "done"; type: "entry" | "exit"; duplicate?: boolean; message?: string }
  | { status: "error"; message: string }

const LiveQRScanner = dynamic(
  () => import("@/components/live-qr-scanner").then((m) => m.LiveQRScanner),
  { ssr: false }
)

function QRScanCard({ onScan }: { onScan: (code: string) => void }) {
  const [useCamera, setUseCamera] = useState(false)

  if (useCamera) {
    return (
      <LiveQRScanner
        onScan={onScan}
        onClose={() => setUseCamera(false)}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          Scanner QR Code
        </CardTitle>
        <CardDescription>
          Ouvrez la caméra pour scanner un billet ou utilisez la saisie manuelle à droite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => setUseCamera(true)}
            className="relative flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10"
          >
            <QrCode className="h-16 w-16 text-primary/30" />
            <p className="text-sm font-medium text-primary">
              Cliquer pour ouvrir la caméra
            </p>
            <p className="text-xs text-muted-foreground">
              Positionnez le QR code dans le cadre
            </p>
          </button>
          <Button onClick={() => setUseCamera(true)} size="lg" className="btn-press">
            <Scan className="mr-2 h-4 w-4" />
            Ouvrir la caméra
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ManualVerification({ onVerify }: { onVerify: (code: string) => void }) {
  const [code, setCode] = useState("")

  const sampleCodes = ["QR-GB-001-2026", "QR-BN-002-2026", "QR-PT-003-2026"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          {"V\u00e9rification Manuelle"}
        </CardTitle>
        <CardDescription>
          {"Entrez le code QR ou le Token ID pour v\u00e9rifier un billet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Code QR (ex: QR-GB-001-2026) ou Token ID"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono"
            />
            <Button onClick={() => onVerify(code)} disabled={!code}>
              {"V\u00e9rifier"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-xs text-muted-foreground">
              Exemples de codes valides :
            </p>
            {sampleCodes.map((c) => (
              <Button
                key={c}
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => { setCode(c); onVerify(c) }}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VerificationResult({
  state,
  onReset,
}: {
  state: VerificationState
  onReset: () => void
}) {
  if (state.status === "idle") return null

  if (state.status === "scanning") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 animate-in fade-in-0 duration-300">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDuration: "1s" }} />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-accent/20 border-b-accent" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          </div>
          <p className="font-medium text-foreground">{"V\u00e9rification sur la blockchain..."}</p>
          <div className="flex flex-col gap-2 w-full">
            {["Interrogation du Smart Contract...", "V\u00e9rification Merkle Proof...", "Validation Zero-Knowledge..."].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-left-2" style={{ animationDelay: `${i * 500}ms`, animationDuration: "400ms", animationFillMode: "both" }}>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.status === "not_found") {
    return (
      <Card className="border-destructive/30 animate-in fade-in-0 zoom-in-95 duration-400">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-destructive">Billet Non Valide</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Ce code ne correspond \u00e0 aucun billet dans la blockchain."}
            </p>
          </div>
          {state.fraud && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
              <p className="text-sm font-medium text-destructive">
                {"ALERTE : Possibilit\u00e9 de contrefacon detect\u00e9e"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {"Cet incident a \u00e9t\u00e9 enregistr\u00e9 sur la blockchain pour analyse."}
              </p>
            </div>
          )}
          <Button variant="outline" onClick={onReset}>
            Nouvelle verification
          </Button>
        </CardContent>
      </Card>
    )
  }

  const ticket = state.ticket

  const statusMap = {
    valid: { icon: CheckCircle, label: "VALIDE", color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
    used: { icon: Clock, label: "DEJA UTILISE", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
    expired: { icon: XCircle, label: "EXPIRE", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  }

  const sc = statusMap[ticket.status]
  const StatusIcon = sc.icon

  return (
    <Card className={`${sc.border} animate-in fade-in-0 zoom-in-95 duration-400`}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center gap-6">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${sc.bg} animate-in zoom-in-50 duration-500`}>
            <StatusIcon className={`h-10 w-10 ${sc.color}`} />
          </div>
          <div className="text-center">
            <h3 className={`text-xl font-bold ${sc.color}`}>Billet {sc.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"V\u00e9rification r\u00e9ussie sur la blockchain Polygon"}
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <div className="mb-4 text-center">
                <p className="font-mono text-2xl font-bold text-primary">{ticket.qrCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Site", value: ticket.siteName },
                  { label: "Proprietaire", value: ticket.ownerName },
                  { label: "Date de visite", value: ticket.visitDate },
                  { label: "Date d'achat", value: ticket.purchaseDate },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                {"Preuve Blockchain"}
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token ID</span>
                  <span className="font-mono text-xs text-foreground">{ticket.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merkle Root</span>
                  <span className="font-mono text-xs text-foreground">{ticket.merkleRoot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merkle Proof</span>
                  <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verifie
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reseau</span>
                  <span className="text-foreground">Polygon</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={onReset}>
            Nouvelle verification
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerificationPage() {
  const [state, setState] = useState<VerificationState>({ status: "idle" })
  const [checkin, setCheckin] = useState<CheckinResult>({ status: "idle" })

  const handleVerify = async (code: string) => {
    setState({ status: "scanning" })

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: code }),
      })

      const data = await res.json()

      if (data.fraud || !data.ticket) {
        setState({ status: "not_found", fraud: data.fraud ?? true })
      } else {
        setState({
          status: "found",
          ticket: data.ticket,
          valid: data.valid,
          expired: data.expired,
          used: data.used,
        })
      }
    } catch {
      setState({ status: "not_found", fraud: false })
    }
  }

  const handleReset = () => setState({ status: "idle" })

  const runCheckin = async (type: "entry" | "exit") => {
    if (state.status !== "found") return
    setCheckin({ status: "loading", type })
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: state.ticket.qrCode, type }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCheckin({ status: "error", message: data?.error || "Erreur lors du check-in" })
        return
      }
      setCheckin({
        status: "done",
        type,
        duplicate: !!data?.duplicate,
        message: data?.message,
      })
    } catch {
      setCheckin({ status: "error", message: "Erreur réseau" })
    }
  }

  return (
    <AuthGuard requiredRoles={["admin", "guide"]}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {"V\u00e9rification de Billets"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {"V\u00e9rifiez l'authenticit\u00e9 d'un billet NFT via scan QR ou saisie manuelle"}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Shield, title: "Merkle Proof", desc: "Verification cryptographique de l'integrite du billet" },
            { icon: Lock, title: "Zero Knowledge Proof", desc: "Validation sans reveler les donnees personnelles" },
            { icon: FileCheck, title: "Smart Contract", desc: "Verification automatique via contrat intelligent" },
          ].map((feature) => (
            <Card key={feature.title} className="card-hover-lift">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {state.status === "idle" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <QRScanCard onScan={handleVerify} />
            <ManualVerification onVerify={handleVerify} />
          </div>
        ) : (
          <div className="space-y-6">
            <VerificationResult state={state} onReset={handleReset} />

            {state.status === "found" && state.valid && !state.expired && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Enregistrer une entrée / sortie
                  </CardTitle>
                  <CardDescription>
                    {"Utilisez ce module à l'entrée (ou sortie) du site pour comptabiliser la fréquentation réelle."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Billet: <span className="font-mono text-foreground">{state.ticket.qrCode}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => runCheckin("entry")}
                      disabled={checkin.status === "loading"}
                      className="btn-press"
                    >
                      {checkin.status === "loading" && checkin.type === "entry" ? "Enregistrement..." : "Marquer Entrée"}
                    </Button>
                    <Button
                      onClick={() => runCheckin("exit")}
                      disabled={checkin.status === "loading"}
                      variant="outline"
                      className="btn-press"
                    >
                      {checkin.status === "loading" && checkin.type === "exit" ? "Enregistrement..." : "Marquer Sortie"}
                    </Button>
                  </div>
                </CardContent>
                {checkin.status !== "idle" && (
                  <CardContent className="pt-0">
                    {checkin.status === "done" && (
                      <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                        {checkin.duplicate ? (checkin.message || "Déjà enregistré") : "Enregistré"}
                      </Badge>
                    )}
                    {checkin.status === "error" && (
                      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                        {checkin.message}
                      </Badge>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </AuthGuard>
  )
}
