import { z } from '@/lib/zod'

const dateInputSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng chọn ngày')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ')

function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const bookingRequestSchema = z
  .object({
    roomId: z.string().trim().min(1, 'Không tìm thấy thông tin phòng'),
    identityIds: z
      .array(z.string().trim().min(1))
      .min(1, 'Vui lòng chọn ít nhất một hồ sơ định danh đã xác minh'),
    checkInDate: dateInputSchema,
    notes: z
      .string()
      .trim()
      .max(500, 'Ghi chú tối đa 500 ký tự')
      .optional(),
  })
  .refine(({ checkInDate }) => checkInDate >= getTodayDateString(), {
    path: ['checkInDate'],
    message: 'Không được đặt phòng trong quá khứ',
  })
