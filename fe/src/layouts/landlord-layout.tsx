import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  LandlordMobileHeader,
  LandlordSidebar,
} from '@/features/landlord'

export function LandlordLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="min-h-svh bg-slate-50">
      <LandlordMobileHeader onOpenMenu={openMobileNav} />
      <LandlordSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <main className="min-h-svh pt-14 md:pt-16 lg:pt-0 lg:pl-64">
        <div className="mx-auto flex max-w-6xl flex-col p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
