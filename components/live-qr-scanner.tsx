"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Scan, X } from "lucide-react"

interface LiveQRScannerProps {
  onScan: (code: string) => void
  onClose?: () => void
}

export function LiveQRScanner({ onScan, onClose }: LiveQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setScanning(false)
  }, [])

  useEffect(() => {
    let mounted = true
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        video.srcObject = stream
        await video.play()
        setScanning(true)
        setError(null)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Impossible d'accéder à la caméra"
        setError(msg)
        setScanning(false)
      }
    }

    startCamera()
    return () => {
      mounted = false
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (!scanning || error) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const tick = async () => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      try {
        const jsQR = (await import("jsqr")).default
        const result = jsQR(imageData.data, imageData.width, imageData.height)
        if (result?.data) {
          onScan(result.data)
          stopCamera()
          return
        }
      } catch {
        // jsQR not loaded or decode failed
      }
      animationRef.current = requestAnimationFrame(tick)
    }
    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [scanning, error, onScan, stopCamera])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Scanner avec la caméra
          </CardTitle>
          <CardDescription>
            Autorisez l'accès à la caméra et visez un QR code
          </CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="relative aspect-square max-h-[320px] w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center border-4 border-primary/50">
            <div className="h-48 w-48 rounded-lg border-2 border-dashed border-primary/70 bg-transparent" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
