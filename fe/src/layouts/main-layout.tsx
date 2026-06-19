import type { ReactNode } from 'react'
import { Navbar } from '@/features/home/components/navbar'
import { FooterSection } from '@/features/home/components/footer-section'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      <Navbar />
      <main>{children}</main>
      <FooterSection />
    </div>
  )
}
