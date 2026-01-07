import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { PricingSection } from "@/components/PricingSection"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main>
        <HeroSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
