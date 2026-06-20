import { api } from "@/lib/api-client";
import type {
  InvoicePaymentResponse,
  PayOSPaymentStatusResponse,
  RoleUpgradePayload,
  RoleUpgradePaymentResponse,
} from "@/types/payment";

export const paymentApi = {
  createRoleUpgradePayment: (payload: RoleUpgradePayload) =>
    api.post<RoleUpgradePaymentResponse>("/payments/upgrade-role", {
      ...payload,
      method: "PAYOS",
    }),

  getPayOSPaymentStatus: (orderCode: string) =>
    api.get<PayOSPaymentStatusResponse>(`/payos/status/${orderCode}`),

  cancelPayOSPayment: (orderCode: string) =>
    api.post<{ success: boolean; message?: string }>(
      `/payos/cancel/${orderCode}`,
    ),

  /** POST /api/payments/pay-invoice/:invoiceId */
  payInvoice: (invoiceId: string) =>
    api.post<InvoicePaymentResponse>(`/payments/pay-invoice/${invoiceId}`, {
      method: "PAYOS",
    }),

  /** GET /api/payments/invoice/:invoiceId */
  getPaymentsByInvoice: (invoiceId: string) =>
    api.get<{ success: boolean; data: unknown[] }>(
      `/payments/invoice/${invoiceId}`,
    ),
};
