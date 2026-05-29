import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return {
    user,
    accessToken,
    setAuth,
    clearAuth,
    isLoggedIn: isAuthenticated(),
  }
}
