"use client"

import { useEffect, useRef, useState, type RefObject } from "react"

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = "0px 0px -40px 0px", once = true } = options
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}

export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean, (index: number) => string] {
  const [ref, isVisible] = useScrollAnimation<T>(options)

  const getDelay = (index: number) => {
    const delay = Math.min(index * 80, 600)
    return `${delay}ms`
  }

  return [ref, isVisible, getDelay]
}

export function useCountUp(
  target: number,
  duration: number = 1800,
  shouldStart: boolean = true
): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart || target === 0) {
      setCount(0)
      return
    }

    let startTime: number | null = null
    let rafId: number

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = easeOutCubic(progress)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, shouldStart])

  return count
}
