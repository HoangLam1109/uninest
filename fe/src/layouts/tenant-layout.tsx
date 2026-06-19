import { useNavigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { tenantSidebarConfig } from '@/features/tenant/data'

export function TenantLayout() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      sidebar={{ ...tenantSidebarConfig, ctaOnClick: () => navigate(paths.home) }}
      contentClassName=""
    />
  )
}
