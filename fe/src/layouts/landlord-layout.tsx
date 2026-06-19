import { DashboardLayout } from '@/layouts/dashboard-layout'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { landlordSidebarConfig } from '@/features/landlord/data'

export function LandlordLayout() {
  const logout = useLogout()

  return (
    <DashboardLayout
      sidebar={{
        ...landlordSidebarConfig,
        ctaOnClick: () => logout.mutate(),
      }}
    />
  )
}
