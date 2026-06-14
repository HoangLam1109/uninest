import express from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import {
  payInvoice,
  payDeposit,
  getPaymentById,
  getMyPayments,
  getReceivedPayments,
  getPaymentsByInvoice,
  requestRefund,
  getPaymentStats,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes are protected
router.use(authenticateMiddleware.authenticateUser);

// ── Payment Routes ──

// Pay invoice
router.post("/pay-invoice/:invoiceId", payInvoice);

// Pay deposit
router.post("/pay-deposit/:bookingId", payDeposit);

// Payment stats
router.get("/stats", getPaymentStats);

// My payments (as payer/tenant)
router.get("/my", getMyPayments);

// Received payments (as receiver/landlord)
router.get("/received", getReceivedPayments);

// Payments by invoice (landlord)
router.get("/invoice/:invoiceId", getPaymentsByInvoice);

// Request refund
router.post("/:id/refund", requestRefund);

// Get payment by ID (must be after all specific routes)
router.get("/:id", getPaymentById);

export default router;