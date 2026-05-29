import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'
import type { RegisterFormValues } from '../types/auth.type'

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const { data } = await authApi.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
      return data.data
    },
    onSuccess: (auth) => {
      setAuth(auth.user, auth.accessToken)
      navigate(paths.home)
    },
  })
}
