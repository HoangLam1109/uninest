import { CtaSection } from './CtaSection'
import { FeaturedRoomsSection } from './FeaturedRoomsSection'
import { FooterSection } from './FooterSection'
import { Header } from './Header'
import { HeroSection } from './HeroSection'
import { LandlordSection } from './LandlordSection'
import { WhyChooseSection } from './WhyChooseSection'

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

export { Header } from './Header'
export { HeroSection } from './HeroSection'
export { FeaturedRoomsSection } from './FeaturedRoomsSection'
export { WhyChooseSection } from './WhyChooseSection'
export { LandlordSection } from './LandlordSection'
export { CtaSection } from './CtaSection'
export { FooterSection } from './FooterSection'
