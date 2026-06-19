import { z } from 'zod'

export const identityFormSchema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự').max(100),
  dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  cccdNumber: z.string().min(9, 'CCCD/CMND phải có ít nhất 9 ký tự').max(12),
})

export type IdentityFormValues = z.infer<typeof identityFormSchema>
