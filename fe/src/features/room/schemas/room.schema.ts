import { z } from '@/lib/zod'

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().nonnegative('Giá trị không được âm').optional(),
)

export const roomSchema = z.object({
  title: z.string().trim().min(2, 'Tên phòng phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  address: z.string().trim().min(3, 'Vui lòng nhập địa chỉ'),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  pricePerMonth: z.coerce.number().positive('Giá thuê phải lớn hơn 0'),
  depositAmount: optionalNumber,
  areaSqm: optionalNumber,
  maxOccupants: z.coerce.number().int().min(1, 'Tối thiểu 1 người'),
  roomType: z.enum(['STUDIO', 'SINGLE', 'SHARED', 'APARTMENT']).optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
  isPublished: z.boolean(),
})

export type RoomFormInput = z.input<typeof roomSchema>
export type RoomFormValues = z.output<typeof roomSchema>
