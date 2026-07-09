import { api } from '@/lib/axios'
import type {
  CreateInitialReadingPayload,
  CreateInvoicePayload,
  CreateUtilityInvoicePayload,
  InvoiceDetailResponse,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceMutationResponse,
  InvoiceResponse,
  MeterReadingListResponse,
  MeterReadingResponse,
  PreviousReadingResponse,
  UpdateInvoicePayload,
  UtilityInvoiceResponse,
} from '../types/invoice.type'
import type {
  LandlordPaymentInfoResponse,
  LandlordPaymentInfoListResponse,
  LandlordPaymentInfoCheckResponse,
  LandlordPaymentInfoPayload,
} from '../types/landlord-payment-info.type'

export const invoiceApi = {
  // ---- Invoice CRUD ----

  create: (payload: CreateInvoicePayload) =>
    api.post<InvoiceMutationResponse>('/invoices', payload),

  listLandlord: (params: InvoiceListParams) =>
    api.get<InvoiceListResponse>('/invoices/landlord', { params }),

  listTenant: (params: InvoiceListParams) =>
    api.get<InvoiceListResponse>('/invoices/tenant', { params }),

  getById: (id: string) =>
    api.get<InvoiceResponse>(`/invoices/${id}`),

  getDetail: (id: string) =>
    api.get<InvoiceDetailResponse>(`/invoices/${id}/detail`),

  update: (id: string, payload: UpdateInvoicePayload) =>
    api.put<InvoiceMutationResponse>(`/invoices/${id}`, payload),

  send: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/send`),

  markPaid: (id: string, landlordPaymentNote?: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/mark-paid`, { landlordPaymentNote }),

  markUnpaid: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/mark-unpaid`),

  cancelInvoice: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/cancel`),

  markPendingConfirmation: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/pending-confirmation`),

  delete: (id: string) =>
    api.delete<InvoiceMutationResponse>(`/invoices/${id}`),

  // ---- Utility Invoice ----

  createUtility: (payload: CreateUtilityInvoicePayload) =>
    api.post<UtilityInvoiceResponse>('/invoices/utility', payload),

  createInitialReading: (payload: CreateInitialReadingPayload) =>
    api.post<MeterReadingResponse>('/invoices/initial-reading', payload),

  // ---- Meter Reading ----

  getMyMeterReadings: (params?: { meterType?: string; page?: number; limit?: number }) =>
    api.get<MeterReadingListResponse>('/meter-readings/my', { params }),

  getMeterReadingsByContract: (contractId: string, params?: { meterType?: string; page?: number; limit?: number }) =>
    api.get<MeterReadingListResponse>(`/meter-readings/contract/${contractId}`, { params }),

  // ---- Previous Reading ----

  getPreviousReadingByBooking: (bookingId: string, billingMonth?: string) =>
    api.get<PreviousReadingResponse>(`/invoices/booking/${bookingId}/previous-reading`, {
      params: billingMonth ? { billingMonth } : undefined,
    }),

  // ---- Landlord Payment Info ----

  getMyPaymentInfo: () =>
    api.get<LandlordPaymentInfoResponse>('/landlord-payment-info/my'),

  upsertMyPaymentInfo: (payload: LandlordPaymentInfoPayload) =>
    api.put<LandlordPaymentInfoResponse>('/landlord-payment-info/my', payload),

  checkPaymentInfo: () =>
    api.get<LandlordPaymentInfoCheckResponse>('/landlord-payment-info/my/check'),

  // ---- Admin: Landlord Payment Info ----
  adminGetPaymentInfos: (params?: { status?: string }) =>
    api.get<LandlordPaymentInfoListResponse>('/landlord-payment-info/admin/all', { params }),

  adminApprovePaymentInfo: (id: string) =>
    api.patch<LandlordPaymentInfoResponse>(`/landlord-payment-info/admin/${id}/approve`),

  adminRejectPaymentInfo: (id: string, reason?: string) =>
    api.patch<LandlordPaymentInfoResponse>(`/landlord-payment-info/admin/${id}/reject`, { reason }),
}
