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

  markPaid: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/mark-paid`),

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

  // ---- Previous Reading (kiểm tra hóa đơn trước) ----

  getPreviousReadingByBooking: (bookingId: string) =>
    api.get<PreviousReadingResponse>(`/invoices/booking/${bookingId}/previous-reading`),
}
