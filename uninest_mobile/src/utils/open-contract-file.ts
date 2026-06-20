import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

import { env } from "@/config/env";
import { getAccessToken } from "@/lib/auth-session";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(binary);
  }
  throw new Error("Không thể mã hóa file PDF.");
}

export async function openContractFile(
  contractId: string,
  fallbackUrl?: string,
) {
  if (fallbackUrl?.startsWith("http")) {
    const canOpen = await Linking.canOpenURL(fallbackUrl);
    if (canOpen) {
      await Linking.openURL(fallbackUrl);
      return;
    }
  }

  const token = getAccessToken();
  const response = await fetch(`${env.apiBaseUrl}/contracts/${contractId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Không tải được file hợp đồng.");
  }

  const buffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  await WebBrowser.openBrowserAsync(
    `data:application/pdf;base64,${base64}`,
  );
}
