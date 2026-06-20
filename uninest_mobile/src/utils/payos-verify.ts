import { paymentApi } from "@/api/payment.api";

export type PayOSVerifyResult = "completed" | "cancelled" | "pending";

export async function verifyPayOSPayment(
  orderCode: string,
  result: "success" | "cancel" = "success",
): Promise<PayOSVerifyResult> {
  if (result === "cancel") {
    await paymentApi.cancelPayOSPayment(orderCode).catch(() => undefined);
    return "cancelled";
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const statusRes = await paymentApi.getPayOSPaymentStatus(orderCode);
    if (statusRes.data.payment.status === "COMPLETED") {
      return "completed";
    }
    if (statusRes.data.payment.status === "CANCELLED") {
      return "cancelled";
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  return "pending";
}
