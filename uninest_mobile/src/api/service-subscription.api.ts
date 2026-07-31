import { api } from "@/lib/api-client";
import type {
  ActiveSubscriptionResponse,
  ServiceSubscribeResponse,
} from "@/types/service-package";

export const serviceSubscriptionApi = {
  subscribe: (
    packageId: string,
    payload: { method: "PAYOS"; autoRenew?: boolean } = { method: "PAYOS" },
  ) =>
    api.post<ServiceSubscribeResponse>(
      `/service-subscriptions/packages/${packageId}/subscribe`,
      payload,
    ),

  getActiveSubscription: () =>
    api.get<ActiveSubscriptionResponse>("/service-subscriptions/active"),
};
