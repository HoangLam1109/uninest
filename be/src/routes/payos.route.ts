import { Router } from "express";
import { handlePayOSWebhook, getPayOSPaymentStatus } from "../controllers/payos.controller.js";

const router = Router();

router.post("/webhook", handlePayOSWebhook);
router.get("/status/:orderCode", getPayOSPaymentStatus);

export default router;