import { Link, Navigate } from 'react-router-dom'
import { paths } from '@/config/constants'
import { AuthLayout } from '@/layouts/auth-layout'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '../components/login-form'

export function LoginPage() {
  const { isLoggedIn, dashboardPath } = useAuth()

  if (isLoggedIn) {
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Đăng nhập để quản lý phòng và tin đăng của bạn."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            to={paths.register}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
