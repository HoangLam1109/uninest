import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'
import type { LoginFormValues } from '../types/auth.type'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await authApi.login({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
      })
      return data.data
    },
    onSuccess: (auth) => {
      setAuth(auth.user, auth.accessToken)
      navigate(paths.home)
    },
  })
}
