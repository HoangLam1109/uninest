import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'
import { authSessionQueryKey } from './use-auth-session'
import { getPostAuthPath } from '../lib/navigate-by-role'
import type { LoginFormValues } from '../types/auth.type'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await authApi.login({
        email: values.email,
        password: values.password,
      })
      return data.data
    },
    onSuccess: async (auth) => {
      setAuth(auth.user, auth.accessToken, auth.refreshToken)

      let user = auth.user
      try {
        const { data } = await authApi.getMe()
        user = data.data.user
        setUser(user)
        queryClient.setQueryData(authSessionQueryKey, user)
      } catch {
        // Fallback to login payload if /me fails
      }

      toast.success('Đăng nhập thành công', {
        description: `Xin chào, ${user.fullName}!`,
      })
      navigate(getPostAuthPath(user), { replace: true })
    },
    onError: (error) => {
      toast.error('Đăng nhập thất bại', {
        description: getApiErrorMessage(
          error,
          'Vui lòng kiểm tra email và mật khẩu.',
        ),
      })
    },
  })
}
