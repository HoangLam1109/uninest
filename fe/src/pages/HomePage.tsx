import { CtaSection } from '../components/home/CtaSection'
import { FeaturedRoomsSection } from '../components/home/FeaturedRoomsSection'
import { FooterSection } from '../components/home/FooterSection'
import { Header } from '../components/home/Header'
import { HeroSection } from '../components/home/HeroSection'
import { LandlordSection } from '../components/home/LandlordSection'
import { WhyChooseSection } from '../components/home/WhyChooseSection'

export function HomePage() {
  return (
    <div className="min-h-svh">
      <Header />
      <main>
        <HeroSection />
        <FeaturedRoomsSection />
        <WhyChooseSection />
        <LandlordSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  )
}

export { Header } from '../components/home/Header'
export { HeroSection } from '../components/home/HeroSection'
export { FeaturedRoomsSection } from '../components/home/FeaturedRoomsSection'
export { WhyChooseSection } from '../components/home/WhyChooseSection'
export { LandlordSection } from '../components/home/LandlordSection'
export { CtaSection } from '../components/home/CtaSection'
export { FooterSection } from '../components/home/FooterSection'
