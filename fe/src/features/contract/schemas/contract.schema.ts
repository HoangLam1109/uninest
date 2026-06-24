import { z } from '@/lib/zod'

const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Ngày không hợp lệ')

const positiveNumberSchema = z
  .number()
  .finite('Giá trị không hợp lệ')
  .positive('Số tiền phải lớn hơn 0')

const optionalNonNegativeNumberSchema = z
  .number()
  .finite('Giá trị không hợp lệ')
  .nonnegative('Giá trị không được âm')
  .optional()

const optionalTextSchema = z
  .string()
  .max(5000, 'Nội dung tối đa 5000 ký tự')
  .optional()

function getTodayStartTime() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.getTime()
}

function validateNotInPast(
  value: string | undefined,
  path: 'startDate' | 'endDate',
  context: z.RefinementCtx,
) {
  if (!value) return

  const time = Date.parse(value)
  if (Number.isNaN(time)) return

  if (time < getTodayStartTime()) {
    context.addIssue({
      code: 'custom',
      path: [path],
      message: 'Không được chọn ngày trong quá khứ',
    })
  }
}

function validateContractDates(
  values: { startDate?: string; endDate?: string },
  context: z.RefinementCtx,
) {
  validateNotInPast(values.startDate, 'startDate', context)
  validateNotInPast(values.endDate, 'endDate', context)

  if (!values.startDate || !values.endDate) return

  if (Date.parse(values.endDate) < Date.parse(values.startDate)) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
    })
  }
}

const contractPayloadSchema = z.object({
  monthlyRent: positiveNumberSchema,
  depositAmount: optionalNonNegativeNumberSchema,
  terms: optionalTextSchema,
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
})

export const createContractSchema = contractPayloadSchema
  .extend({
    bookingId: z.string().trim().min(1, 'Vui lòng chọn booking'),
  })
  .superRefine(validateContractDates)

export const updateContractSchema = contractPayloadSchema.superRefine(
  validateContractDates,
)

export const renewContractSchema = contractPayloadSchema
  .extend({
    startDate: isoDateSchema,
  })
  .superRefine(validateContractDates)
