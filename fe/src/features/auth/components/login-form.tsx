import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema } from '../schemas/auth.schema'
import type { LoginFormValues } from '../types/auth.type'
import { useLogin } from '../hooks/use-login'
import { AuthField } from './auth-field'
import { PasswordInput, authInputClassName } from './password-input'

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      remember: false,
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
          id="login-identifier"
          label="Email hoặc số điện thoại"
          error={errors.identifier?.message}
        >
          <Input
            id="login-identifier"
            type="text"
            placeholder="name@email.com hoặc 09xx xxx xxx"
            autoComplete="username"
            className={authInputClassName(!!errors.identifier)}
            aria-invalid={!!errors.identifier}
            {...register('identifier')}
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
              {...register('remember')}
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

        {login.isError ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            Đăng nhập thất bại. Vui lòng thử lại.
          </p>
        ) : null}

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
    </>
  )
}
