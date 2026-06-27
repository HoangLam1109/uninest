import "./env.js";
import { PayOS, type PayOSOptions } from "@payos/node";

/** Default PayOS client (system account — used for role upgrades) */
export const payosClient = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "",
} as PayOSOptions);

/** Create a PayOS client with custom merchant keys (for landlord-specific payments) */
export function createPayOSClient(keys: {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}) {
  return new PayOS({
    clientId: keys.clientId,
    apiKey: keys.apiKey,
    checksumKey: keys.checksumKey,
  } as PayOSOptions);
}

export const PAYOS_CONFIG = {
  returnUrl: process.env.PAYOS_RETURN_URL || "http://localhost:5173/payment/success",
  cancelUrl: process.env.PAYOS_CANCEL_URL || "http://localhost:5173/payment/cancel",
};

/** Payout (Chi hộ) feature — requires separate activation on PayOS dashboard */
export const PAYOS_PAYOUT_CONFIG = {
  enabled: process.env.PAYOS_PAYOUT_ENABLED === "true",
  clientId: process.env.PAYOS_PAYOUT_CLIENT_ID || process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_PAYOUT_API_KEY || process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_PAYOUT_CHECKSUM_KEY || process.env.PAYOS_CHECKSUM_KEY || "",
};

/** PayOS client dành riêng cho Payout (có thể khác với payment link client) */
export const payoutClient = new PayOS({
  clientId: PAYOS_PAYOUT_CONFIG.clientId,
  apiKey: PAYOS_PAYOUT_CONFIG.apiKey,
  checksumKey: PAYOS_PAYOUT_CONFIG.checksumKey,
} as PayOSOptions);
