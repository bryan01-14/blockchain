"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Send,
  User,
  Loader2,
  ChevronDown,
  X,
  Bot,
  MapPin,
  Palette,
  UtensilsCrossed,
  Landmark,
} from "lucide-react"

const suggestedQuestions = [
  {
    icon: MapPin,
    label: "Sites UNESCO",
    question: "Quels sont les sites classes UNESCO en Cote d'Ivoire ?",
  },
  {
    icon: Palette,
    label: "Artisanat",
    question: "Quels objets artisanaux puis-je acheter avec certificat NFT ?",
  },
  {
    icon: UtensilsCrossed,
    label: "Gastronomie",
    question: "Quels sont les plats incontournables de la cuisine ivoirienne ?",
  },
  {
    icon: Landmark,
    label: "Histoire",
    question: "Raconte-moi l'histoire de Grand-Bassam.",
  },
]

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && !!p.text)
    .map((p) => p.text)
    .join("")
}

function formatInline(text: string): React.ReactNode {
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

function formatContent(text: string) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="my-1.5 ml-3 flex flex-col gap-0.5">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-1.5 text-xs leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
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
    if (line.startsWith("### ")) {
      flushList()
      elements.push(
        <h4 key={`h3-${i}`} className="mt-2 mb-0.5 text-xs font-bold text-foreground">
          {formatInline(line.slice(4))}
        </h4>
      )
    } else if (line.startsWith("## ")) {
      flushList()
      elements.push(
        <h3 key={`h2-${i}`} className="mt-2.5 mb-0.5 text-sm font-bold text-foreground">
          {formatInline(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith("# ")) {
      flushList()
      elements.push(
        <h2 key={`h1-${i}`} className="mt-3 mb-1 text-sm font-bold text-foreground">
          {formatInline(line.slice(2))}
        </h2>
      )
    } else if (/^[-*]\s/.test(line)) {
      listItems.push(line.replace(/^[-*]\s/, ""))
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ""))
    } else if (line.startsWith("---")) {
      flushList()
      elements.push(<hr key={`hr-${i}`} className="my-2 border-border/50" />)
    } else if (line.trim() === "") {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed">
          {formatInline(line)}
        </p>
      )
    }
  }
  flushList()
  return elements
}

const MIN_PANEL_WIDTH = 280
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 320

export function FloatingChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>(() =>
    typeof window !== "undefined"
      ? { x: window.innerWidth - 56, y: window.innerHeight / 2 }
      : { x: 0, y: 0 }
  )
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 60)
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + "px"
    }
  }, [inputValue])

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || isStreaming) return
    if (!hasInteracted) setHasInteracted(true)
    sendMessage({ text: trimmed })
    setInputValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [inputValue, isStreaming, hasInteracted, sendMessage])

  const handleSuggestion = useCallback((question: string) => {
    if (isStreaming) return
    if (!hasInteracted) setHasInteracted(true)
    sendMessage({ text: question })
  }, [isStreaming, hasInteracted, sendMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Drag handlers for bubble
  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDraggedRef.current = true
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      setPosition((p) => {
        const newX = Math.max(24, Math.min(window.innerWidth - 24, p.x + dx))
        const newY = Math.max(24, Math.min(window.innerHeight - 24, p.y + dy))
        return { x: newX, y: newY }
      })
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = "grabbing"
    document.body.style.userSelect = "none"
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleBubbleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isOpen) return
    e.preventDefault()
    hasDraggedRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
  }, [isOpen])

  const handleBubbleClick = useCallback((e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      e.preventDefault()
      return
    }
    setIsOpen((o) => !o)
  }, [])

  // Resize handlers
  useEffect(() => {
    if (!isResizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      const maxW = Math.min(MAX_PANEL_WIDTH, window.innerWidth * 0.9)
      setPanelWidth(Math.min(maxW, Math.max(MIN_PANEL_WIDTH, newWidth)))
    }
    const handleMouseUp = () => setIsResizing(false)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing])

  return (
    <>
      {/* Icône chat déplaçable */}
      <button
        onClick={handleBubbleClick}
        onMouseDown={handleBubbleMouseDown}
        className={`chat-bubble-btn group fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-primary shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
        aria-label={isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant VisitBot"}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-primary-foreground transition-transform duration-200" />
        ) : (
          <Bot className="h-6 w-6 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
        )}

        {/* Notification pulse */}
        {!isOpen && !hasInteracted && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
          </span>
        )}
      </button>

      {/* Panneau chat qui sort de la droite - redimensionnable */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full max-w-[100vw] flex-col overflow-hidden border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: isOpen ? `${panelWidth}px` : undefined }}
      >
        {/* Poignée de redimensionnement (bord gauche) */}
        {isOpen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizing(true)
            }}
            className="absolute -left-1 top-0 z-50 flex h-full w-4 cursor-col-resize items-center justify-center pl-1 transition-colors hover:bg-primary/5"
            aria-label="Redimensionner le panneau"
          >
            <div className="flex h-12 w-1 rounded-full bg-muted-foreground/30 transition-colors hover:bg-primary/60" />
          </div>
        )}
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-primary/5 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">VisitBot</h3>
            <p className="text-xs text-muted-foreground">
              {"Assistant IA \u2022 Gemini"}
            </p>
          </div>
          <div className="flex h-2 w-2 rounded-full bg-accent" title="En ligne" />
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
        >
          <div className="px-4 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {"Salut ! Je suis VisitBot"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {"Posez-moi une question sur la C\u00f4te d'Ivoire"}
                </p>

                <div className="mt-4 grid w-full grid-cols-2 gap-2">
                  {suggestedQuestions.map((sq) => (
                    <button
                      key={sq.label}
                      onClick={() => handleSuggestion(sq.question)}
                      disabled={isStreaming}
                      className="flex flex-col items-start gap-1 rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                    >
                      <sq.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px] font-medium text-foreground">{sq.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const text = getMessageText(message)
                  if (!text) return null
                  const isUser = message.role === "user"

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isUser ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-xs leading-relaxed">{text}</p>
                        ) : (
                          <div className="text-card-foreground">
                            {formatContent(text)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {isStreaming && !getMessageText(messages[messages.length - 1]) && (
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {"R\u00e9flexion..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background p-1.5 shadow-md transition-all hover:bg-muted"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background px-3 py-2.5">
          <div className="flex items-end gap-2 rounded-lg border border-input bg-card p-1.5">
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
              placeholder="Votre question..."
              rows={1}
              className="max-h-[100px] min-h-[32px] flex-1 resize-none bg-transparent px-1.5 py-1 text-xs outline-none placeholder:text-muted-foreground"
              disabled={isStreaming}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming}
              className="h-7 w-7 shrink-0 rounded-md"
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
