import { Header } from "./landing/header"
import { HeroSection } from "./landing/hero-section"
import { FeaturesSection } from "./landing/features-section"
import { StatsSection } from "./landing/stats-section"
import { TestimonialsSection } from "./landing/testimonials-section"
import { CTASection } from "./landing/cta-section"
import { Footer } from "./landing/footer"

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default Landing
