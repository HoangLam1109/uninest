import { z } from '@/lib/zod'

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().nonnegative('Gia tri khong duoc am').optional(),
)

const optionalCoordinate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().optional(),
)

export const roomSchema = z.object({
  propertyId: z.string().trim().optional(),
  amenityIds: z.array(z.string().trim().min(1)).optional(),
  title: z.string().trim().min(2, 'Ten phong phai co it nhat 2 ky tu'),
  description: z.string().trim().optional(),
  address: z.string().trim().min(3, 'Vui long nhap dia chi'),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  ward: z.string().trim().optional(),
  latitude: optionalCoordinate,
  longitude: optionalCoordinate,
  pricePerMonth: z.coerce.number().positive('Gia thue phai lon hon 0'),
  depositAmount: optionalNumber,
  electricityRate: optionalNumber,
  waterRate: optionalNumber,
  areaSqm: optionalNumber,
  maxOccupants: z.coerce.number().int().min(1, 'Toi thieu 1 nguoi'),
  roomType: z.enum(['STUDIO', 'SINGLE', 'SHARED', 'APARTMENT']).optional(),
  status: z.enum(['AVAILABLE', 'DEPOSITED', 'RENTED', 'MAINTENANCE']),
  isPublished: z.boolean(),
})

export type RoomFormInput = z.input<typeof roomSchema>
export type RoomFormValues = z.output<typeof roomSchema>
