import type { Request, Response } from "express";
import { PayOSService } from "../services/payos.service.js";

export const handlePayOSWebhook = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;

    if (!webhookData) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    await PayOSService.handleWebhook(webhookData);

    return res.json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("PayOS webhook error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getPayOSPaymentStatus = async (req: Request, res: Response) => {
  try {
    const orderCode = req.params.orderCode as string;

    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Order code is required" });
    }

    const status = await PayOSService.getPaymentStatus(orderCode);

    return res.json({ success: true, data: status });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelPayOSPayment = async (req: Request, res: Response) => {
  try {
    const orderCode = req.params.orderCode as string;

    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Order code is required" });
    }

    const payment = await PayOSService.cancelPayment(orderCode);

    return res.json({ success: true, data: payment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
