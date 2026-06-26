import { MainLayout } from '@/layouts/main-layout'
import { Seo } from '@/seo/seo'
import {
  createFaqSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from '@/seo/schemas'
import { homeFaqs } from '@/features/home/data'
import { CtaSection } from '@/features/home/components/cta-section'
import { FaqSection } from '@/features/home/components/faq-section'
import { FeaturedRoomsSection } from '@/features/home/components/featured-room-section'
import { HeroSection } from '@/features/home/components/hero-section'
import { LandlordSection } from '@/features/home/components/landlord-section'
import { WhyChooseSection } from '@/features/home/components/why-choose-section'

export function HomePage() {
  return (
    <MainLayout>
      <Seo
        title="UniNest | Tìm phòng trọ, studio và căn hộ tại TP.HCM"
        description="Tìm phòng trọ, phòng ghép, studio và căn hộ uy tín tại TP.HCM với UniNest. So sánh giá, tiện ích, vị trí và gửi yêu cầu đặt phòng nhanh."
        path="/"
        keywords={[
          'tìm phòng trọ TP.HCM',
          'phòng trọ sinh viên',
          'studio cho thuê',
          'căn hộ cho thuê TP.HCM',
          'UniNest',
        ]}
        structuredData={[
          createOrganizationSchema(),
          createWebsiteSchema(),
          createFaqSchema([...homeFaqs]),
        ]}
      />
      <HeroSection />
      <FeaturedRoomsSection />
      <WhyChooseSection />
      <LandlordSection />
      <FaqSection />
      <CtaSection />
    </MainLayout>
  )
}
