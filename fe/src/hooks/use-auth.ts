import {
  getDashboardLabelForRole,
  getDashboardPathForRole,
} from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken))

  return {
    user,
    accessToken,
    setAuth,
    clearAuth,
    isLoggedIn,
    dashboardPath: getDashboardPathForRole(user?.role),
    dashboardLabel: getDashboardLabelForRole(user?.role),
  }
}
