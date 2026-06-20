import * as Linking from "expo-linking";

export function buildUpgradePaymentReturnUrls() {
  const returnUrl = Linking.createURL("/sv/upgrade_package_page", {
    queryParams: { result: "success" },
  });
  const cancelUrl = Linking.createURL("/sv/upgrade_package_page", {
    queryParams: { result: "cancel" },
  });

  return { returnUrl, cancelUrl };
}
