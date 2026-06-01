import { DashboardSidebar } from '@/components/common/dashboard-sidebar'
import { landlordSidebarConfig } from '../data'

type LandlordSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function LandlordSidebar({
  mobileOpen,
  onMobileClose,
}: LandlordSidebarProps) {
  return (
    <DashboardSidebar
      config={landlordSidebarConfig}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  )
}
