"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { TransactionSkeleton, StatCardSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth-context"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import { generateMerkleTree } from "@/lib/data"
import type { Transaction, NFTTicket } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  Search,
  GitBranch,
  Hash,
  Blocks,
  FileCode,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function typeLabel(type: Transaction["type"]) {
  switch (type) {
    case "ticket_purchase":
      return "Achat Billet"
    case "nft_mint":
      return "Mint NFT"
    case "guide_payment":
      return "Paiement Guide"
  }
}

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`animate-on-scroll flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {tx.status === "confirmed" ? (
            <CheckCircle className="h-5 w-5 text-accent" />
          ) : (
            <Clock className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-card-foreground">
              {typeLabel(tx.type)}
            </p>
            <Badge
              variant="outline"
              className={
                tx.status === "confirmed"
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-primary/30 bg-primary/10 text-primary"
              }
            >
              {tx.status === "confirmed" ? "Confirme" : "En attente"}
            </Badge>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {tx.hash.substring(0, 20)}...
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm sm:gap-6">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Montant</p>
          <p className="font-semibold text-card-foreground">
            {tx.amount.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Bloc</p>
          <p className="font-mono text-xs text-card-foreground">#{tx.blockNumber}</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-xs text-card-foreground">
            {new Date(tx.timestamp).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  )
}

function MerkleTreeVisualizer({ tickets }: { tickets: NFTTicket[] }) {
  const ticketData = tickets.map(
    (t) => `${t.id}-${t.siteId}-${t.tokenId}-${t.ownerName}`
  )
  const tree = useMemo(() => generateMerkleTree(ticketData), [ticketData])
  const [verifyInput, setVerifyInput] = useState("")
  const [verifyResult, setVerifyResult] = useState<"idle" | "valid" | "invalid">("idle")

  const handleVerify = () => {
    const isValid = tree.leaves.some((l) => l.includes(verifyInput.slice(0, 4)))
    setVerifyResult(verifyInput.length > 0 ? (isValid ? "valid" : "invalid") : "idle")
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Arbre de Merkle
          </CardTitle>
          <CardDescription>
            {"Visualisation de l'arbre de Merkle garantissant l'int\u00e9grit\u00e9 des billets"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border-2 border-primary bg-primary/10 px-6 py-3 text-center">
              <p className="text-xs font-medium text-primary">Merkle Root</p>
              <p className="font-mono text-sm font-bold text-foreground">{tree.root}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="h-6 w-px bg-border" />
              <div className="h-6 w-px bg-border" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {tree.proof.map((node, i) => (
                <div key={i} className="rounded-lg border border-border bg-secondary/50 px-4 py-2 text-center">
                  <p className="text-[10px] font-medium text-muted-foreground">Noeud {i + 1}</p>
                  <p className="font-mono text-xs text-foreground">{node}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {tree.leaves.map((_, i) => (
                <div key={i} className="h-6 w-px bg-border" />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {tree.leaves.map((leaf, i) => (
                <div key={i} className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-center">
                  <p className="text-[10px] font-medium text-muted-foreground">Billet {i + 1}</p>
                  <p className="font-mono text-xs text-accent">{leaf}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {"V\u00e9rification Merkle Proof"}
          </CardTitle>
          <CardDescription>
            {"Entrez un identifiant pour v\u00e9rifier son inclusion dans l'arbre"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Token ID ou identifiant (ex: 0x7f3a)"
              value={verifyInput}
              onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult("idle") }}
              className="font-mono text-sm"
            />
            <Button onClick={handleVerify}>{"V\u00e9rifier"}</Button>
          </div>
          {verifyResult !== "idle" && (
            <div className={`mt-3 flex items-center gap-2 rounded-lg border p-3 ${
              verifyResult === "valid"
                ? "border-accent/30 bg-accent/5 text-accent"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}>
              {verifyResult === "valid" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {verifyResult === "valid"
                  ? "Preuve valide - Le billet est dans l'arbre de Merkle"
                  : "Non trouv\u00e9 - Cet identifiant n'est pas dans l'arbre"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SmartContractView() {
  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VisitSecureTicket is ERC721 {
    uint256 private _tokenIdCounter;
    bytes32 public merkleRoot;
    
    struct Ticket {
        string siteId;
        uint256 price;
        uint256 visitDate;
        bool used;
    }
    
    mapping(uint256 => Ticket) public tickets;
    
    event TicketMinted(uint256 tokenId, string siteId, address owner);
    event TicketUsed(uint256 tokenId, uint256 timestamp);
    
    constructor(bytes32 _merkleRoot) ERC721("VisitSecure", "VSC") {
        merkleRoot = _merkleRoot;
    }
    
    function mintTicket(
        string memory siteId,
        uint256 price,
        uint256 visitDate,
        bytes32[] calldata proof
    ) external payable {
        require(msg.value >= price, "Insufficient payment");
        
        bytes32 leaf = keccak256(abi.encodePacked(
            msg.sender, siteId, price, visitDate
        ));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle proof"
        );
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        tickets[tokenId] = Ticket(siteId, price, visitDate, false);
        
        emit TicketMinted(tokenId, siteId, msg.sender);
    }
    
    function useTicket(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!tickets[tokenId].used, "Already used");
        tickets[tokenId].used = true;
        emit TicketUsed(tokenId, block.timestamp);
    }
    
    function verifyTicket(
        uint256 tokenId,
        bytes32[] calldata proof
    ) external view returns (bool) {
        Ticket memory t = tickets[tokenId];
        bytes32 leaf = keccak256(abi.encodePacked(
            ownerOf(tokenId), t.siteId, t.price, t.visitDate
        ));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          Smart Contract
        </CardTitle>
        <CardDescription>
          {"Contrat intelligent Solidity d\u00e9ploy\u00e9 sur Polygon pour la gestion des billets NFT"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border bg-foreground p-4">
          <pre className="text-xs leading-relaxed text-background">
            <code>{contractCode}</code>
          </pre>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Reseau", value: "Polygon" },
            { label: "Standard", value: "ERC-721" },
            { label: "Verification", value: "Merkle Proof" },
            { label: "Stockage", value: "IPFS" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function BlockchainPage() {
  const [search, setSearch] = useState("")
  const { user } = useAuth()

  const { data: transactions, isLoading: txLoading } = useSWR<Transaction[]>(
    "/api/transactions",
    fetcher
  )

  const { data: tickets } = useSWR<NFTTicket[]>(
    user?.email ? `/api/tickets?email=${encodeURIComponent(user.email)}` : null,
    fetcher
  )

  const filtered = (transactions ?? []).filter(
    (tx) =>
      tx.hash.toLowerCase().includes(search.toLowerCase()) ||
      typeLabel(tx.type).toLowerCase().includes(search.toLowerCase())
  )

  const allTx = transactions ?? []

  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blockchain</h1>
          <p className="mt-2 text-muted-foreground">
            {"Explorez les transactions, l'arbre de Merkle et le Smart Contract"}
          </p>
        </div>

        {txLoading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Blocks, label: "Transactions", value: allTx.length.toString() },
              { icon: Shield, label: "Confirmees", value: allTx.filter((t) => t.status === "confirmed").length.toString() },
              { icon: Hash, label: "Dernier Bloc", value: allTx.length > 0 ? `#${Math.max(...allTx.map((t) => t.blockNumber))}` : "-" },
              { icon: LinkIcon, label: "Reseau", value: "Polygon" },
            ].map((stat) => (
              <Card key={stat.label} className="card-hover-lift">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="transactions">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="merkle">Arbre de Merkle</TabsTrigger>
            <TabsTrigger value="contract">Smart Contract</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une transaction..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {txLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((tx, i) => (
                  <TransactionRow key={tx.id} tx={tx} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="merkle">
            <MerkleTreeVisualizer tickets={tickets ?? []} />
          </TabsContent>

          <TabsContent value="contract">
            <SmartContractView />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </AuthGuard>
  )
}
