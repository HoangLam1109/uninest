import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema'
import type {
  ForgotPasswordEmailFormValues,
  ResetPasswordFormValues,
} from '../types/auth.type'
import { useForgotPassword, useResetPassword } from '../hooks/use-forgot-password'
import { AuthField } from './auth-field'
import { authInputClassName } from './auth-input-class'
import { PasswordInput } from './password-input'

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const resetPassword = useResetPassword()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const emailForm = useForm<ForgotPasswordEmailFormValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: {
      email: '',
    },
  })

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleSendOtp = emailForm.handleSubmit(async ({ email }) => {
    await forgotPassword.mutateAsync(email)
    setSubmittedEmail(email)
    resetForm.setValue('email', email, { shouldDirty: false })
    resetForm.setFocus('otp')
  })

  const handleUseDifferentEmail = () => {
    setSubmittedEmail(null)
    resetForm.reset({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSendOtp} noValidate>
        <AuthField
          id="forgot-password-email"
          label="Email"
          error={emailForm.formState.errors.email?.message}
        >
          <Input
            id="forgot-password-email"
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            disabled={forgotPassword.isPending || !!submittedEmail}
            className={authInputClassName(!!emailForm.formState.errors.email)}
            aria-invalid={!!emailForm.formState.errors.email}
            {...emailForm.register('email')}
          />
        </AuthField>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant={submittedEmail ? 'outline' : 'default'}
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending
              ? 'Đang gửi mã...'
              : submittedEmail
                ? 'Gửi lại mã OTP'
                : 'Gửi mã OTP'}
          </Button>

          {submittedEmail ? (
            <Button type="button" variant="ghost" onClick={handleUseDifferentEmail}>
              Dùng email khác
            </Button>
          ) : null}
        </div>
      </form>

      {submittedEmail ? (
        <form
          className="space-y-5 border-t border-border pt-6"
          onSubmit={resetForm.handleSubmit((values) => resetPassword.mutate(values))}
          noValidate
        >
          <div className="rounded-xl bg-surface p-4 text-sm text-muted-foreground">
            Mã OTP đã được gửi đến <span className="font-semibold text-foreground">{submittedEmail}</span>.
          </div>

          <input type="hidden" {...resetForm.register('email')} />

          <AuthField
            id="reset-password-otp"
            label="Mã OTP"
            error={resetForm.formState.errors.otp?.message}
          >
            <Input
              id="reset-password-otp"
              inputMode="numeric"
              placeholder="Nhập 6 chữ số"
              autoComplete="one-time-code"
              className={authInputClassName(!!resetForm.formState.errors.otp)}
              aria-invalid={!!resetForm.formState.errors.otp}
              {...resetForm.register('otp')}
            />
          </AuthField>

          <AuthField
            id="reset-password-new"
            label="Mật khẩu mới"
            error={resetForm.formState.errors.newPassword?.message}
          >
            <PasswordInput
              id="reset-password-new"
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              hasError={!!resetForm.formState.errors.newPassword}
              {...resetForm.register('newPassword')}
            />
          </AuthField>

          <AuthField
            id="reset-password-confirm"
            label="Xác nhận mật khẩu mới"
            error={resetForm.formState.errors.confirmPassword?.message}
          >
            <PasswordInput
              id="reset-password-confirm"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              hasError={!!resetForm.formState.errors.confirmPassword}
              {...resetForm.register('confirmPassword')}
            />
          </AuthField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
