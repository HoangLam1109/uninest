import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paths } from '@/config/constants'
import { loginSchema } from '../schemas/auth.schema'
import type { LoginFormValues } from '../types/auth.type'
import { useLogin } from '../hooks/use-login'
import { AuthField } from './auth-field'
import { authInputClassName } from './auth-input-class'
import { PasswordInput } from './password-input'

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <>
      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => login.mutate(values))}
        noValidate
      >
        <AuthField
          id="login-email"
          label="Email"
          error={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            className={authInputClassName(!!errors.email)}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </AuthField>

        <AuthField
          id="login-password"
          label="Mật khẩu"
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-password"
            placeholder="••••••••"
            autoComplete="current-password"
            hasError={!!errors.password}
            {...register('password')}
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
          <Link
            to={paths.forgotPassword}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={login.isPending}
        >
          {login.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border" />
        </div>
      </div>
    </>
  )
}
