import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { TouristChatWrapper } from '@/components/tourist-chat-wrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisitSecure CI - Tourisme Culturel Blockchain en C\u00f4te d'Ivoire",
  description: "Plateforme innovante combinant Blockchain, Big Data et IA pour la tra\u00e7abilit\u00e9, la s\u00e9curit\u00e9 et la promotion du patrimoine culturel ivoirien.",
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <TouristChatWrapper />
        </AuthProvider>
      </body>
    </html>
  )
}
