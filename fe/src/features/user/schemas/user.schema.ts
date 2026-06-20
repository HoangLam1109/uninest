import { USER_ROLES } from '@/constants/roles'
import { z } from '@/lib/zod'

const roleSchema = z.enum([
  USER_ROLES.ADMIN,
  USER_ROLES.STAFF,
  USER_ROLES.LANDLORD,
  USER_ROLES.TENANT,
  USER_ROLES.GUEST,
])

const phoneSchema = z
  .string()
  .trim()
  .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
  .regex(/^0\d{9,10}$/, 'Số điện thoại phải bắt đầu bằng 0')

const userBaseSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email')
    .pipe(z.email({ error: 'Email không hợp lệ' })),
  fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: phoneSchema,
  role: roleSchema,
  isActive: z.boolean(),
})

export const createUserSchema = userBaseSchema.extend({
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})

export const updateUserSchema = userBaseSchema.extend({
  password: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || value === '' || value.length >= 8,
      'Mật khẩu tối thiểu 8 ký tự',
    ),
})
