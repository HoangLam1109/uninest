import * as Linking from "expo-linking";

export function buildUpgradePaymentReturnUrls() {
  const returnUrl = Linking.createURL("/sv/payment_result_page", {
    queryParams: { result: "success" },
  });
  const cancelUrl = Linking.createURL("/sv/payment_result_page", {
    queryParams: { result: "cancel" },
  });

  return { returnUrl, cancelUrl };
}
