import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { authApi } from '../api/auth.api'
import type { RegisterFormValues } from '../types/auth.type'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const { data } = await authApi.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
      return data
    },
    onSuccess: () => {
      navigate(paths.login)
      toast.success('Đăng ký thành công')
    },
    onError: (error) => {
      toast.error('Đăng ký thất bại', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin'),
      })
    },
  })
}
