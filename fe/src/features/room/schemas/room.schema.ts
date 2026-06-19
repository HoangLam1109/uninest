import { z } from '@/lib/zod'

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().nonnegative('Gia tri khong duoc am').optional(),
)

const optionalCoordinate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().optional(),
)

export const maxRoomImages = 12
export const maxRoomImageSize = 8 * 1024 * 1024

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

export const roomImageFileSchema = z
  .custom<File>(
    (value): value is File =>
      typeof File !== 'undefined' && value instanceof File,
    'File anh khong hop le',
  )
  .refine((file) => file.type.startsWith('image/'), 'Vui long chon file anh')
  .refine(
    (file) => file.size <= maxRoomImageSize,
    'Moi anh phai co dung luong toi da 8MB',
  )

export const selectedRoomImageSchema = z.object({
  id: z.string().min(1),
  file: roomImageFileSchema,
  previewUrl: z.string().min(1),
  caption: z.string().max(140, 'Chu thich toi da 140 ky tu'),
  isPrimary: z.boolean(),
})

export const selectedRoomImagesDraftSchema = z
  .array(selectedRoomImageSchema)
  .max(maxRoomImages, `Chi duoc tai toi da ${maxRoomImages} anh`)

export const selectedRoomImagesSubmitSchema = selectedRoomImagesDraftSchema
  .superRefine((images, context) => {
    if (images.length > 0 && !images.some((image) => image.isPrimary)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui long chon anh dai dien',
      })
    }
  })

export type RoomFormInput = z.input<typeof roomSchema>
export type RoomFormValues = z.output<typeof roomSchema>
export type SelectedRoomImage = z.output<typeof selectedRoomImageSchema>
