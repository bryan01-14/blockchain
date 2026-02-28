"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  Palette,
  UtensilsCrossed,
  Landmark,
  Loader2,
  ChevronDown,
} from "lucide-react"

const suggestedQuestions = [
  {
    icon: MapPin,
    label: "Sites UNESCO",
    question: "Quels sont les sites classes UNESCO en Cote d'Ivoire et comment les visiter ?",
  },
  {
    icon: Palette,
    label: "Artisanat",
    question: "Quels objets artisanaux typiques puis-je acheter avec certificat NFT ?",
  },
  {
    icon: UtensilsCrossed,
    label: "Gastronomie",
    question: "Quels sont les plats incontournables de la cuisine ivoirienne ?",
  },
  {
    icon: Landmark,
    label: "Histoire",
    question: "Raconte-moi l'histoire de Grand-Bassam et son importance culturelle.",
  },
]

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && !!p.text)
    .map((p) => p.text)
    .join("")
}

function ChatContent() {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const isStreaming = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100)
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px"
    }
  }, [inputValue])

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
    setInputValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleSuggestion = (question: string) => {
    if (isStreaming) return
    sendMessage({ text: question })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Format markdown-like content into readable HTML
  function formatContent(text: string) {
    // Split by lines and process
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let listItems: string[] = []
    let listKey = 0

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="my-2 ml-4 flex flex-col gap-1">
            {listItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{formatInline(item)}</span>
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Headers
      if (line.startsWith("### ")) {
        flushList()
        elements.push(
          <h4 key={`h3-${i}`} className="mt-3 mb-1 text-sm font-bold text-foreground">
            {formatInline(line.slice(4))}
          </h4>
        )
      } else if (line.startsWith("## ")) {
        flushList()
        elements.push(
          <h3 key={`h2-${i}`} className="mt-4 mb-1 text-base font-bold text-foreground">
            {formatInline(line.slice(3))}
          </h3>
        )
      } else if (line.startsWith("# ")) {
        flushList()
        elements.push(
          <h2 key={`h1-${i}`} className="mt-4 mb-2 text-lg font-bold text-foreground">
            {formatInline(line.slice(2))}
          </h2>
        )
      }
      // List items
      else if (/^[-*]\s/.test(line)) {
        listItems.push(line.replace(/^[-*]\s/, ""))
      } else if (/^\d+\.\s/.test(line)) {
        listItems.push(line.replace(/^\d+\.\s/, ""))
      }
      // Separator
      else if (line.startsWith("---")) {
        flushList()
        elements.push(<hr key={`hr-${i}`} className="my-3 border-border/50" />)
      }
      // Empty line
      else if (line.trim() === "") {
        flushList()
      }
      // Regular paragraph
      else {
        flushList()
        elements.push(
          <p key={`p-${i}`} className="text-sm leading-relaxed">
            {formatInline(line)}
          </p>
        )
      }
    }
    flushList()
    return elements
  }

  function formatInline(text: string): React.ReactNode {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Chat messages area */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            /* Welcome screen */
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                {"Bienvenue sur VisitBot"}
              </h1>
              <p className="mt-2 max-w-md text-muted-foreground">
                {"Votre assistant intelligent pour d\u00e9couvrir le patrimoine culturel ivoirien. Posez-moi vos questions !"}
              </p>

              {user && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {"Bonjour"} <span className="font-medium text-foreground">{user.name}</span> {"! Comment puis-je vous aider ?"}
                </p>
              )}

              <div className="mt-8 grid w-full max-w-lg gap-3 md:grid-cols-2">
                {suggestedQuestions.map((sq) => (
                  <button
                    key={sq.label}
                    onClick={() => handleSuggestion(sq.question)}
                    disabled={isStreaming}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                  >
                    <sq.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{sq.label}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {sq.question}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const text = getMessageText(message)
                if (!text) return null

                const isUser = message.role === "user"

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed">{text}</p>
                      ) : (
                        <div className="prose-sm text-card-foreground">
                          {formatContent(text)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Streaming indicator */}
              {isStreaming && !getMessageText(messages[messages.length - 1]) && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {"VisitBot r\u00e9fl\u00e9chit..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background p-2 shadow-lg transition-all hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-end gap-3 px-4 py-4">
          <Card className="flex flex-1 items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Posez votre question sur le tourisme en Cote d'Ivoire..."
              rows={1}
              className="max-h-[150px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              disabled={isStreaming}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Envoyer</span>
            </Button>
          </Card>
        </div>
        <p className="mx-auto max-w-3xl px-4 pb-3 text-center text-xs text-muted-foreground">
          {"VisitBot utilise l'IA et la base de connaissances VisitSecure pour r\u00e9pondre a vos questions."}
        </p>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  return (
    <AuthGuard requiredRole="tourist">
      <Navbar />
      <main>
        <ChatContent />
      </main>
    </AuthGuard>
  )
}
