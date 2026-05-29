import { MainLayout } from '@/layouts/main-layout'
import { CtaSection } from '@/features/home/components/cta-section'
import { FeaturedRoomsSection } from '@/features/home/components/featured-room-section'
import { HeroSection } from '@/features/home/components/hero-section'
import { LandlordSection } from '@/features/home/components/landlord-section'
import { WhyChooseSection } from '@/features/home/components/why-choose-section'

export function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedRoomsSection />
      <WhyChooseSection />
      <LandlordSection />
      <CtaSection />
    </MainLayout>
  )
}
