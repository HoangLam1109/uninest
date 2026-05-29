import { MainLayout } from '@/layouts/main-layout'
import { CtaSection } from '@/features/home/components/CtaSection'
import { FeaturedRoomsSection } from '@/features/home/components/FeaturedRoomsSection'
import { HeroSection } from '@/features/home/components/HeroSection'
import { LandlordSection } from '@/features/home/components/LandlordSection'
import { WhyChooseSection } from '@/features/home/components/WhyChooseSection'

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
