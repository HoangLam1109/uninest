import { z } from '@/lib/zod'

const emailSchema = z
  .string()
  .min(1, { error: 'Vui lòng nhập email' })
  .pipe(z.email({ error: 'Email không hợp lệ' }))

const passwordSchema = z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự')
const otpSchema = z.string().regex(/^\d{6}$/, 'Mã OTP phải gồm 6 chữ số')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: emailSchema,
    phone: z
      .string()
      .min(10, 'Số điện thoại không hợp lệ')
      .regex(/^0\d{9,10}$/, 'Số điện thoại phải bắt đầu bằng 0'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    otp: otpSchema,
    terms: z.boolean().refine((v) => v === true, {
      message: 'Bạn cần đồng ý điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
