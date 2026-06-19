import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'

export const authSessionQueryKey = ['auth', 'me'] as const

export function useAuthSession() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useQuery({
    queryKey: authSessionQueryKey,
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe()
        const user = data.data.user
        setUser(user)
        return user
      } catch (error) {
        clearAuth()
        throw error
      }
    },
  })
}
