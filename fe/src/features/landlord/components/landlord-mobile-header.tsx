import { DashboardMobileHeader } from '@/components/common/dashboard-mobile-header'
import { landlordSidebarConfig } from '../data'

type LandlordMobileHeaderProps = {
  onOpenMenu: () => void
}

export function LandlordMobileHeader({ onOpenMenu }: LandlordMobileHeaderProps) {
  return (
    <DashboardMobileHeader
      href={landlordSidebarConfig.baseHref}
      onOpenMenu={onOpenMenu}
    />
  )
}
