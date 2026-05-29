import { Link, useNavigate } from 'react-router-dom'
import { paths } from '@/routes/paths'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthField } from '../components/auth/AuthField'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordInput } from '../components/auth/PasswordInput'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { registerAPI } from '@/api/authApi'

const inputClass =
  'h-12 border border-border bg-surface px-4 text-sm font-medium'

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const res = await registerAPI({ email, fullName, phone, password })
      const userInfo = {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role || 'TENANT'
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      toast.success('Đăng ký thành công')
      navigate(paths.tenant)
    } catch (error) {
      console.log('Register error handled by interceptor:', error)
      // Error toast đã được gọi trong interceptor
    } finally {
      setLoading(false)
    }
  }
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
      <form
        className="space-y-5"
        onSubmit={handleRegister}
      >
        <AuthField id="register-name" label="Họ và tên">
          <Input
            id="register-name"
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </AuthField>

        <AuthField id="register-email" label="Email">
          <Input
            id="register-email"
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>

        <AuthField id="register-phone" label="Số điện thoại">
          <Input
            id="register-phone"
            type="tel"
            placeholder="09xx xxx xxx"
            autoComplete="tel"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </AuthField>

        <AuthField id="register-password" label="Mật khẩu" hint="Tối thiểu 8 ký tự">
          <PasswordInput
            id="register-password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>

        <AuthField id="register-confirm" label="Xác nhận mật khẩu">
          <PasswordInput
            id="register-confirm"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </AuthField>

        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
          />
          <span>
            Tôi đồng ý với{' '}
            <a href="#" className="font-semibold text-primary hover:text-primary/80">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="font-semibold text-primary hover:text-primary/80">
              Chính sách bảo mật
            </a>{' '}
            của UniNest.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full">
          Tạo tài khoản
        </Button>
      </form>
    </AuthLayout>
  )
}
