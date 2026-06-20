import "./env.js";
import { PayOS, type PayOSOptions } from "@payos/node";

export const payosClient = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "",
} as PayOSOptions);

export const PAYOS_CONFIG = {
  returnUrl: process.env.PAYOS_RETURN_URL || "http://localhost:5173/payment/success",
  cancelUrl: process.env.PAYOS_CANCEL_URL || "http://localhost:5173/payment/cancel",
};
