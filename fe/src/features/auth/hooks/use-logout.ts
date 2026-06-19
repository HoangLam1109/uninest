import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { paths } from '@/config/constants'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'
import { authSessionQueryKey } from './use-auth-session'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      queryClient.removeQueries({ queryKey: authSessionQueryKey })
      toast.success('Đã đăng xuất')
      navigate(paths.home)
    },
  })
}
