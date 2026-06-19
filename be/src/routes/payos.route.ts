import { Router } from "express";
import {
  cancelPayOSPayment,
  getPayOSPaymentStatus,
  handlePayOSWebhook,
} from "../controllers/payos.controller.js";

const router = Router();

router.post("/webhook", handlePayOSWebhook);
router.get("/status/:orderCode", getPayOSPaymentStatus);
router.post("/cancel/:orderCode", cancelPayOSPayment);

export default router;
