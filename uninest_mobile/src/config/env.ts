import { Platform } from "react-native";

/**
 * Trên Android emulator, localhost = chính máy ảo → dùng 10.0.2.2 để tới máy dev.
 * iOS simulator / web có thể dùng localhost.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (fromEnv && !fromEnv.includes("localhost") && !fromEnv.includes("127.0.0.1")) {
    return fromEnv;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return fromEnv || "http://localhost:3000/api";
}

function resolveSocketUrl(): string {
  const apiBase = resolveApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, "");
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  socketUrl: resolveSocketUrl(),
} as const;
