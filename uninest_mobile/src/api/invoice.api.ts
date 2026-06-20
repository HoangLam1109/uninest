import { api } from "@/lib/api-client";
import type {
  CreateInitialReadingPayload,
  CreateInvoicePayload,
  CreateUtilityInvoicePayload,
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoiceMutationResponse,
  InvoiceResponse,
  MeterReadingMutationResponse,
  UpdateInvoiceDetailPayload,
  UpdateInvoicePayload,
  UtilityInvoiceMutationResponse,
} from "@/types/invoice";

function buildListQuery(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 100));
  return query.toString();
}

export const invoiceApi = {
  /** GET /api/invoices/tenant */
  listTenant: (params?: { page?: number; limit?: number }) =>
    api.get<InvoiceListResponse>(
      `/invoices/tenant?${buildListQuery(params)}`,
    ),

  /** GET /api/invoices/landlord */
  listLandlord: (params?: { page?: number; limit?: number }) =>
    api.get<InvoiceListResponse>(
      `/invoices/landlord?${buildListQuery(params)}`,
    ),

  /** POST /api/invoices/ */
  create: (payload: CreateInvoicePayload) =>
    api.post<InvoiceMutationResponse>("/invoices/", payload),

  /** POST /api/invoices/utility — tự tính điện/nước từ chỉ số công tơ */
  createUtility: (payload: CreateUtilityInvoicePayload) =>
    api.post<UtilityInvoiceMutationResponse>("/invoices/utility", payload),

  /** GET /api/invoices/:id */
  getById: (id: string) => api.get<InvoiceResponse>(`/invoices/${id}`),

  /** PUT /api/invoices/:id */
  update: (id: string, payload: UpdateInvoicePayload) =>
    api.put<InvoiceMutationResponse>(`/invoices/${id}`, payload),

  /** PATCH /api/invoices/:id/send */
  send: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/send`),

  /** PATCH /api/invoices/:id/mark-paid */
  markPaid: (id: string) =>
    api.patch<InvoiceMutationResponse>(`/invoices/${id}/mark-paid`),

  /** DELETE /api/invoices/:id */
  delete: (id: string) =>
    api.delete<InvoiceMutationResponse>(`/invoices/${id}`),

  /** GET /api/invoices/:id/detail */
  getDetail: (id: string) =>
    api.get<InvoiceDetailResponse>(`/invoices/${id}/detail`),

  /** PUT /api/invoices/:id/detail */
  updateDetail: (id: string, payload: UpdateInvoiceDetailPayload) =>
    api.put<InvoiceDetailResponse>(`/invoices/${id}/detail`, payload),

  /** POST /api/invoices/initial-reading */
  createInitialReading: (payload: CreateInitialReadingPayload) =>
    api.post<MeterReadingMutationResponse>(
      "/invoices/initial-reading",
      payload,
    ),

  /** GET /api/meter-readings/my */
  getMyMeterReadings: (params?: {
    meterType?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 100));
    if (params?.meterType) query.set("meterType", params.meterType);
    return api.get<import("@/types/meter").MeterReadingListResponse>(
      `/meter-readings/my?${query.toString()}`,
    );
  },
};
