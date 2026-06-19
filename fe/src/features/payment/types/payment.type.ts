import type { UserRole } from '@/constants/roles'

export type RoleUpgradeTarget = Extract<UserRole, 'TENANT' | 'LANDLORD'>

export type RoleUpgradePayload = {
  targetRole: RoleUpgradeTarget
}

export type RoleUpgradePayment = {
  payment: {
    _id: string
    amount: number
    currency: string
    type: string
    method: string
    status: string
    note?: string
    transactionRef?: string
  }
  checkoutUrl: string
  orderCode: number
  status: 'PENDING'
}

export type RoleUpgradePaymentResponse = {
  success: boolean
  message: string
  data: RoleUpgradePayment
}

export type PayOSPaymentStatus = {
  payosStatus: string
  payment: {
    _id: string
    amount: number
    currency: string
    type: string
    method: string
    status: string
    note?: string
    transactionRef?: string
  }
}

export type PayOSPaymentStatusResponse = {
  success: boolean
  data: PayOSPaymentStatus
}

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'PAYOS'

export type PaymentType =
  | 'RENT'
  | 'DEPOSIT'
  | 'UTILITY'
  | 'SERVICE_FEE'
  | 'TENANT_PACKAGE'
  | 'LANDLORD_PACKAGE'
  | 'REFUND'

export type PaymentUser = {
  _id: string
  fullName?: string
  email?: string
  phone?: string
}

export type AdminPayment = {
  _id: string
  bookingId?: unknown
  payerId: string | PaymentUser
  receiverId: string | PaymentUser
  invoiceId?: unknown
  amount: number
  currency: string
  type: PaymentType
  method?: PaymentMethod
  status: PaymentStatus
  transactionRef?: string
  note?: string
  paidAt?: string
  createdAt?: string
  updatedAt?: string
}

export type PaymentPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AdminPaymentsResponse = {
  success: boolean
  data: AdminPayment[]
  pagination: PaymentPagination
}

export type AdminPaymentStats = {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  completedAmount: number
  pendingCount: number
  completedCount: number
  failedCount: number
  refundedCount: number
}

export type AdminPaymentStatsResponse = {
  success: boolean
  data: AdminPaymentStats
}
