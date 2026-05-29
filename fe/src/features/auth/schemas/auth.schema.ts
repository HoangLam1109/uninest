import { z } from '@/lib/zod'

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  remember: z.boolean(),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.email('Email không hợp lệ'),
    phone: z
      .string()
      .min(10, 'Số điện thoại không hợp lệ')
      .regex(/^0\d{9,10}$/, 'Số điện thoại phải bắt đầu bằng 0'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    terms: z.boolean().refine((v) => v === true, {
      message: 'Bạn cần đồng ý điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
