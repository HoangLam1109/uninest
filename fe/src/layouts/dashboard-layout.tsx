import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardMobileHeader } from '@/components/common/dashboard-mobile-header'
import {
  DashboardSidebar,
  type DashboardSidebarConfig,
} from '@/components/common/dashboard-sidebar'

type DashboardLayoutProps = {
  sidebar: DashboardSidebarConfig
  contentClassName?: string
}

export function DashboardLayout({
  sidebar,
  contentClassName = 'flex w-full flex-col p-4 md:p-6 lg:p-8',
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="min-h-svh bg-slate-50">
      <DashboardMobileHeader href={sidebar.baseHref} onOpenMenu={openMobileNav} />
      <DashboardSidebar
        config={sidebar}
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
      />
      <main className="min-h-svh pt-14 md:pt-16 lg:pt-0 lg:pl-64">
        <div className={contentClassName}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
