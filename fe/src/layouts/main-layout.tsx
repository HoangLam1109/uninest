import type { ReactNode } from 'react'
import { Navbar } from '@/components/common/navbar'
import { FooterSection } from '@/features/home/components/FooterSection'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      <Navbar />
      <main>{children}</main>
      <FooterSection />
    </div>
  )
}
