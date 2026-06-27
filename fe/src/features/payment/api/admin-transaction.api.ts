import { api } from '@/lib/axios'

export type TxDirection = 'IN' | 'OUT'
export type TxCategory = 'PACKAGE_UPGRADE' | 'INVOICE_RENT' | 'INVOICE_DISBURSEMENT' | 'DEPOSIT' | 'OTHER'
export type TxStatus = 'SUCCESS' | 'FAILED' | 'MANUAL_RESOLVED' | 'PENDING'

export type TransactionLog = {
  _id: string
  direction: TxDirection
  category: TxCategory
  paymentId?: string | { _id: string; amount: number; type: string; status: string; transactionRef?: string }
  disbursementId?: string | { _id: string; amount: number; netAmount: number; payoutFee: number; state: string }
  referenceId: string
  amount: number
  netAmount?: number
  fee?: number
  status: TxStatus
  fromUserId?: string | { _id: string; fullName: string; email: string; phone: string }
  toUserId?: string | { _id: string; fullName: string; email: string; phone: string }
  fromName?: string
  toName?: string
  fromBankInfo?: Record<string, any>
  toBankInfo?: { bankBin: string; bankName: string; accountNumber: string; accountHolder: string }
  gatewayResponse?: Record<string, any>
  resolvedBy?: string | { _id: string; fullName: string; email: string }
  resolvedAt?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type TransactionDetail = TransactionLog & {
  paymentDetail?: any
  disbursementDetail?: any
}

export type TransactionListResponse = {
  success: boolean
  transactions: TransactionLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type TransactionStats = {
  byDirection: { _id: TxDirection; count: number; totalAmount: number; totalNetAmount?: number; totalFee?: number }[]
  byStatus: { _id: TxStatus; count: number }[]
  failedSummary: { count: number; totalAmount: number }
}

export const adminTransactionApi = {
  /** Lấy danh sách giao dịch thống nhất */
  list: (params?: {
    direction?: TxDirection
    category?: TxCategory
    status?: TxStatus
    fromDate?: string
    toDate?: string
    search?: string
    page?: number
    limit?: number
  }) =>
    api.get<TransactionListResponse>('/admin/transactions', { params }),

  /** Thống kê giao dịch */
  stats: () =>
    api.get<{ success: boolean; data: TransactionStats }>('/admin/transactions/stats'),

  /** Chi tiết giao dịch */
  detail: (id: string) =>
    api.get<{ success: boolean; data: TransactionDetail }>(`/admin/transactions/${id}`),

  /** Đánh dấu payment thất bại */
  markPaymentFailed: (paymentId: string, note?: string) =>
    api.patch<{ success: boolean; message: string }>(`/admin/transactions/payment/${paymentId}/failed`, { note }),

  /** Đánh dấu payment đã chuyển tay */
  markPaymentResolved: (paymentId: string, note?: string) =>
    api.patch<{ success: boolean; message: string }>(`/admin/transactions/payment/${paymentId}/resolved`, { note }),

  /** Đánh dấu disbursement thất bại */
  markDisbursementFailed: (disbursementId: string, note?: string) =>
    api.patch<{ success: boolean; message: string }>(`/admin/transactions/disbursement/${disbursementId}/failed`, { note }),

  /** Đánh dấu disbursement đã chuyển tay */
  markDisbursementResolved: (disbursementId: string, note?: string) =>
    api.patch<{ success: boolean; message: string }>(`/admin/transactions/disbursement/${disbursementId}/resolved`, { note }),
}
