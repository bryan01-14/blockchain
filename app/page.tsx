"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection, FeaturesSection, AssistantCTA } from "@/components/landing-sections"
import { SitesPreview } from "@/components/sites-preview"
import { MarketplacePreview, StoriesPreview } from "@/components/landing-previews"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SitesPreview />
        <MarketplacePreview />
        <StoriesPreview />
        <AssistantCTA />
      </main>
      <Footer />
    </>
  )
}
