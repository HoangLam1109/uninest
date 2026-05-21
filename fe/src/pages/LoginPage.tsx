import { Link } from 'react-router-dom'
import { paths } from '@/routes/paths'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthField } from '../components/auth/AuthField'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordInput } from '../components/auth/PasswordInput'

const inputClass =
  'h-12 border border-border bg-surface px-4 text-sm font-medium'

export function LoginPage() {
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
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <AuthField id="login-email" label="Email hoặc số điện thoại">
          <Input
            id="login-email"
            type="text"
            placeholder="name@email.com hoặc 09xx xxx xxx"
            autoComplete="username"
            className={inputClass}
          />
        </AuthField>

        <AuthField id="login-password" label="Mật khẩu">
          <PasswordInput
            id="login-password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </AuthField>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-medium text-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border text-primary accent-primary"
            />
            Ghi nhớ đăng nhập
          </label>
          <a
            href="#"
            className="font-semibold text-primary hover:text-primary/80"
          >
            Quên mật khẩu?
          </a>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Đăng nhập
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          hoặc
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" className="w-full">
          Google
        </Button>
        <Button type="button" variant="outline" className="w-full">
          Facebook
        </Button>
      </div>
    </AuthLayout>
  )
}
