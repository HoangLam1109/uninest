import { DashboardLayout } from '@/layouts/dashboard-layout'
import { landlordSidebarConfig } from '@/features/landlord/data'

export function LandlordLayout() {
  return <DashboardLayout sidebar={landlordSidebarConfig} />
}
