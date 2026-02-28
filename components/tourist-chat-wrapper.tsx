"use client"

import { FloatingChatBubble } from "@/components/chat-bubble"
import { useAuth } from "@/lib/auth-context"

export function TouristChatWrapper() {
  const { isTourist } = useAuth()

  if (!isTourist) return null
  return <FloatingChatBubble />
}

