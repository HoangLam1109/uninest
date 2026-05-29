import { Navigate, Outlet } from 'react-router-dom'
import { paths } from '@/config/constants'
import { useAuthStore } from '@/stores/auth.store'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />
  }

  return <Outlet />
}
