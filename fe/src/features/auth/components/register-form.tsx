import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema } from '../schemas/auth.schema'
import type { RegisterFormValues } from '../types/auth.type'
import { useRegister } from '../hooks/use-register'
import { AuthField } from './auth-field'
import { PasswordInput, authInputClassName } from './password-input'

export function RegisterForm() {
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
      noValidate
    >
      <AuthField
        id="register-name"
        label="Họ và tên"
        error={errors.fullName?.message}
      >
        <Input
          id="register-name"
          type="text"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          className={authInputClassName(!!errors.fullName)}
          aria-invalid={!!errors.fullName}
          {...register('fullName')}
        />
      </AuthField>

      <AuthField id="register-email" label="Email" error={errors.email?.message}>
        <Input
          id="register-email"
          type="email"
          placeholder="name@email.com"
          autoComplete="email"
          className={authInputClassName(!!errors.email)}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
      </AuthField>

      <AuthField
        id="register-phone"
        label="Số điện thoại"
        error={errors.phone?.message}
      >
        <Input
          id="register-phone"
          type="tel"
          placeholder="09xx xxx xxx"
          autoComplete="tel"
          className={authInputClassName(!!errors.phone)}
          aria-invalid={!!errors.phone}
          {...register('phone')}
        />
      </AuthField>

      <AuthField
        id="register-password"
        label="Mật khẩu"
        hint={errors.password ? undefined : 'Tối thiểu 8 ký tự'}
        error={errors.password?.message}
      >
        <PasswordInput
          id="register-password"
          placeholder="••••••••"
          autoComplete="new-password"
          hasError={!!errors.password}
          {...register('password')}
        />
      </AuthField>

      <AuthField
        id="register-confirm"
        label="Xác nhận mật khẩu"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="register-confirm"
          placeholder="••••••••"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </AuthField>

      <div className="space-y-2">
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
            aria-invalid={!!errors.terms}
            {...register('terms')}
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
        {errors.terms ? (
          <p className="text-xs font-medium text-red-600" role="alert">
            {errors.terms.message}
          </p>
        ) : null}
      </div>

      {registerMutation.isError ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          Đăng ký thất bại. Vui lòng thử lại.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </Button>
    </form>
  )
}
