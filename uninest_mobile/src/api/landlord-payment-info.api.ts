import { api } from "@/lib/api-client";
import type {
  LandlordPaymentInfoCheckResponse,
  LandlordPaymentInfoPayload,
  LandlordPaymentInfoResponse,
} from "@/types/landlord-payment-info";

export const landlordPaymentInfoApi = {
  getMy: () =>
    api.get<LandlordPaymentInfoResponse>("/landlord-payment-info/my"),

  upsertMy: (payload: LandlordPaymentInfoPayload) =>
    api.put<LandlordPaymentInfoResponse>("/landlord-payment-info/my", payload),

  checkMy: () =>
    api.get<LandlordPaymentInfoCheckResponse>(
      "/landlord-payment-info/my/check",
    ),
};
