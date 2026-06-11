import { z } from 'zod'

export const coTenantSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  cccdNumber: z.string().optional(),
})

export const identityFormSchema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự').max(100),
  dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  cccdNumber: z.string().min(9, 'CCCD/CMND phải có ít nhất 9 ký tự').max(12),
  coTenants: z.array(coTenantSchema).optional(),
})

export type IdentityFormValues = z.infer<typeof identityFormSchema>
