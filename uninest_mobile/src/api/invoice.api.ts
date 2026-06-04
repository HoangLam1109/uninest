import { api } from "@/lib/api-client";
import type {
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoiceResponse,
} from "@/types/invoice";

export const invoiceApi = {
  /** GET /api/invoices/tenant */
  listTenant: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 50));
    return api.get<InvoiceListResponse>(`/invoices/tenant?${query.toString()}`);
  },

  /** GET /api/invoices/:id */
  getById: (id: string) => api.get<InvoiceResponse>(`/invoices/${id}`),

  /** GET /api/invoices/:id/detail */
  getDetail: (id: string) =>
    api.get<InvoiceDetailResponse>(`/invoices/${id}/detail`),
};
