import { api } from "@/lib/api-client";
import type {
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
};
