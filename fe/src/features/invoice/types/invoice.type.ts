export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

export type InvoiceUser = {
  _id?: string
  id?: string
  fullName?: string
  email?: string
  phone?: string
}

export type InvoiceRoom = {
  _id?: string
  title?: string
}

export type InvoiceBooking = {
  _id: string
  roomId?: string | InvoiceRoom
}

export type Invoice = {
  _id: string
  bookingId: string | InvoiceBooking
  contractId?: string
  landlordId: string | InvoiceUser
  tenantId: string | InvoiceUser
  billingMonth: string
  dueDate: string
  rentAmount: number
  electricityAmount?: number
  waterAmount?: number
  additionalFees?: number
  totalAmount: number
  status: InvoiceStatus
  notes?: string
  sentAt?: string | null
  paidAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type InvoiceDetail = {
  _id: string
  invoiceId: string
  electricityOldIndex?: number
  electricityNewIndex?: number
  electricityUsage?: number
  electricityRate?: number
  electricityAmount?: number
  waterOldIndex?: number
  waterNewIndex?: number
  waterUsage?: number
  waterRate?: number
  waterAmount?: number
  otherDetails?: Record<string, unknown>
}

// ---- API Responses ----

export type InvoiceListResponse = {
  success: boolean
  data: Invoice[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type InvoiceResponse = {
  success: boolean
  data: Invoice
}

export type InvoiceDetailResponse = {
  success: boolean
  data: InvoiceDetail | null
}

export type InvoiceMutationResponse = {
  success: boolean
  message?: string
  data: Invoice
}

// ---- Payloads ----

export type CreateInvoicePayload = {
  bookingId: string
  billingMonth: string
  dueDate: string
  rentAmount: number
  electricityAmount?: number
  waterAmount?: number
  additionalFees?: number
  notes?: string
}

export type CreateUtilityInvoicePayload = {
  bookingId: string
  billingMonth: string
  dueDate: string
  rentAmount: number
  electricityNewIndex?: number
  waterNewIndex?: number
  electricityOldIndex?: number
  waterOldIndex?: number
  electricityRate?: number
  waterRate?: number
  additionalFees?: number
  notes?: string
}

export type UtilityInvoiceResponse = {
  success: boolean
  message: string
  data: {
    invoice: Invoice
    detail: InvoiceDetail
  }
}

export type UpdateInvoicePayload = {
  rentAmount?: number
  electricityAmount?: number
  waterAmount?: number
  additionalFees?: number
  notes?: string
  dueDate?: string
}

export type InvoiceListParams = {
  page?: number
  limit?: number
}

// ---- MeterReading ----

export type MeterType = 'ELECTRICITY' | 'WATER'

export type ReadingSource = 'INITIAL' | 'MONTHLY' | 'TENANT_SELF' | 'PHOTO'

export type MeterReading = {
  _id: string
  roomId?: string
  contractId: string
  recordedBy: string | InvoiceUser
  meterType: MeterType
  readingValue: number
  source: ReadingSource
  billingMonth: string
  readingDate: string
  photoUrl?: string
  notes?: string
  invoiceId?: string
  createdAt: string
  updatedAt: string
}

export type CreateInitialReadingPayload = {
  contractId: string
  roomId?: string
  electricityReading?: number
  waterReading?: number
  photoUrls?: { electricity?: string; water?: string }
  notes?: string
}

export type MeterReadingListResponse = {
  success: boolean
  data: MeterReading[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type MeterReadingResponse = {
  success: boolean
  message: string
  data: MeterReading | MeterReading[]
}
