import { Link } from 'react-router-dom'
import { paths } from '@/config/constants'
import { AuthLayout } from '@/layouts/auth-layout'
import { RegisterForm } from '../components/register-form'

export function RegisterPage() {
  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản miễn phí để lưu phòng yêu thích và nhận tin mới."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            to={paths.login}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
