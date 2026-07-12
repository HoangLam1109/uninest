import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { paths } from '@/config/constants'
import { authApi } from '../api/auth.api'
import type { ResetPasswordFormValues } from '../types/auth.type'

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await authApi.forgotPassword({ email })
      return data
    },
    onSuccess: () => {
      toast.success('Đã gửi mã xác nhận', {
        description: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được OTP trong ít phút.',
      })
    },
    onError: (error) => {
      toast.error('Không thể gửi mã xác nhận', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại email và thử lại.'),
      })
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      const { data } = await authApi.resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      })
      return data
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công', {
        description: 'Bạn có thể đăng nhập lại bằng mật khẩu mới.',
      })
      navigate(paths.login, { replace: true })
    },
    onError: (error) => {
      toast.error('Không thể đổi mật khẩu', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại mã OTP và thử lại.'),
      })
    },
  })
}
