import { AdminDashboardContent } from './admin-dashboard/admin-dashboard-content'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'

export function AdminDashboard() {
  const dashboard = useAdminDashboard()

  return <AdminDashboardContent dashboard={dashboard} />
}
