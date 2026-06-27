import { api } from '@/lib/axios'
import type {
  AdminPaymentStatsResponse,
  AdminPaymentsResponse,
  InvoicePaymentResponse,
  RoleUpgradePayload,
  RoleUpgradePaymentResponse,
  PayOSPaymentStatusResponse,
} from '../types/payment.type'

export const paymentApi = {
  createRoleUpgradePayment: (payload: RoleUpgradePayload) =>
    api.post<RoleUpgradePaymentResponse>('/payments/upgrade-role', {
      ...payload,
      method: 'PAYOS',
    }),

  /** Tenant: Pay an invoice via PayOS */
  payInvoice: (invoiceId: string) =>
    api.post<InvoicePaymentResponse>(`/payments/pay-invoice/${invoiceId}`, {
      method: 'PAYOS',
    }),

  getPayOSPaymentStatus: (orderCode: string) =>
    api.get<PayOSPaymentStatusResponse>(`/payos/status/${orderCode}`),

  cancelPayOSPayment: (orderCode: string) =>
    api.post<PayOSPaymentStatusResponse>(`/payos/cancel/${orderCode}`),

  adminListPayments: (params?: { page?: number; limit?: number }) =>
    api.get<AdminPaymentsResponse>('/payments/admin', { params }),

  adminGetPaymentStats: () =>
    api.get<AdminPaymentStatsResponse>('/payments/admin/stats'),
}
