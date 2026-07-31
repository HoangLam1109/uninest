import { authApi } from "@/api/auth.api";
import { paymentApi } from "@/api/payment.api";
import type { AuthUser } from "@/types/auth";

export async function verifyUpgradePayment(
  orderCode: string,
  result: "success" | "cancel",
): Promise<
  | { status: "cancelled" }
  | { status: "completed"; user: AuthUser }
  | { status: "pending" }
  | { status: "error"; message: string }
> {
  try {
    if (result === "cancel") {
      await paymentApi.cancelPayOSPayment(orderCode).catch(() => undefined);
      return { status: "cancelled" };
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const statusRes = await paymentApi.getPayOSPaymentStatus(orderCode);
      const paymentStatus = statusRes.data.payment.status;

      if (paymentStatus === "COMPLETED") {
        const me = await authApi.getMe();
        return { status: "completed", user: me.data.user };
      }

      if (paymentStatus === "CANCELLED") {
        return { status: "cancelled" };
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    return { status: "pending" };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Không xác minh được thanh toán.",
    };
  }
}
