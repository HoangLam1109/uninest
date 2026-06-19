import express from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { USER_ROLES } from "../constants/role.constant.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  payInvoice,
  payDeposit,
  payRoleUpgrade,
  getPaymentById,
  getMyPayments,
  getReceivedPayments,
  getAdminPayments,
  getAdminPaymentStats,
  getPaymentsByInvoice,
  requestRefund,
  getPaymentStats,
  processRefund,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes are protected
router.use(authenticateMiddleware.authenticateUser);

// ── Payment Routes ──

// Pay invoice
router.post("/pay-invoice/:invoiceId", payInvoice);

// Pay deposit
router.post("/pay-deposit/:bookingId", payDeposit);

// Upgrade GUEST role to TENANT or LANDLORD via PayOS
router.post("/upgrade-role", payRoleUpgrade);

// Payment stats
router.get("/stats", getPaymentStats);

// Admin payment management
router.get("/admin", authorizeRoles(USER_ROLES.ADMIN), getAdminPayments);
router.get("/admin/stats", authorizeRoles(USER_ROLES.ADMIN), getAdminPaymentStats);

// My payments (as payer/tenant)
router.get("/my", getMyPayments);

// Received payments (as receiver/landlord)
router.get("/received", getReceivedPayments);

// Payments by invoice (landlord)
router.get("/invoice/:invoiceId", getPaymentsByInvoice);

// Request refund
router.post("/:id/refund", requestRefund);

// Process refund
router.post("/:id/process-refund", processRefund);

// Get payment by ID (must be after all specific routes)
router.get("/:id", getPaymentById);

export default router;
