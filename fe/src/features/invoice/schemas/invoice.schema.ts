import { z } from '@/lib/zod'

const billingMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Ký hóa đơn phải có dạng YYYY-MM')

const dueDateInputSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Hạn thanh toán không hợp lệ')

const requiredPositiveNumberFromString = z.coerce
  .number()
  .finite('Giá trị không hợp lệ')
  .positive('Số tiền phải lớn hơn 0')

const optionalNonNegativeNumberFromString = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value
    const trimmedValue = value.trim()
    return trimmedValue === '' ? undefined : trimmedValue
  },
  z.coerce
    .number()
    .finite('Giá trị không hợp lệ')
    .nonnegative('Giá trị không được âm')
    .optional(),
)

const optionalTextSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value
    const trimmedValue = value.trim()
    return trimmedValue === '' ? undefined : trimmedValue
  },
  z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
)

const invoiceBaseSchema = z.object({
  bookingId: z.string().trim().min(1, 'Vui lòng chọn booking'),
  billingMonth: billingMonthSchema,
  dueDate: dueDateInputSchema,
  rentAmount: requiredPositiveNumberFromString,
  additionalFees: optionalNonNegativeNumberFromString,
  notes: optionalTextSchema,
})

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000`).toISOString()
}

export const manualInvoiceFormSchema = invoiceBaseSchema
  .extend({
    electricityAmount: optionalNonNegativeNumberFromString,
    waterAmount: optionalNonNegativeNumberFromString,
  })
  .transform((values) => ({
    bookingId: values.bookingId,
    billingMonth: values.billingMonth,
    dueDate: toIsoDate(values.dueDate),
    rentAmount: values.rentAmount,
    electricityAmount: values.electricityAmount,
    waterAmount: values.waterAmount,
    additionalFees: values.additionalFees,
    notes: values.notes,
  }))

export const utilityInvoiceFormSchema = invoiceBaseSchema
  .extend({
    electricityNewIndex: optionalNonNegativeNumberFromString,
    waterNewIndex: optionalNonNegativeNumberFromString,
  })
  .transform((values) => ({
    bookingId: values.bookingId,
    billingMonth: values.billingMonth,
    dueDate: toIsoDate(values.dueDate),
    rentAmount: values.rentAmount,
    electricityNewIndex: values.electricityNewIndex,
    waterNewIndex: values.waterNewIndex,
    additionalFees: values.additionalFees,
    notes: values.notes,
  }))
