import { Link, Navigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { AuthLayout } from '@/layouts/auth-layout'
import { useAuth } from '@/hooks/use-auth'
import { ForgotPasswordForm } from '../components/forgot-password-form'

export function ForgotPasswordPage() {
  const { isLoggedIn, dashboardPath } = useAuth()

  if (isLoggedIn) {
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận mã OTP và đặt lại mật khẩu mới."
      footer={
        <>
          Nhớ mật khẩu rồi?{' '}
          <Link
            to={paths.login}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Quay lại đăng nhập
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
