import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoiceDetail,
  getLandlordInvoices,
  getTenantInvoices,
  markInvoiceAsPaid,
  sendInvoice,
  updateInvoice,
  updateInvoiceDetail,
} from "../controllers/invoice.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// All invoice routes are protected
router.use(authenticateMiddleware.authenticateUser);

// Create invoice
router.post("/", createInvoice);

// Specific paths before param routes
router.get("/landlord", getLandlordInvoices);
router.get("/tenant", getTenantInvoices);

// Get invoice by ID
router.get("/:id", getInvoiceById);

// Invoice actions
router.put("/:id", updateInvoice);
router.patch("/:id/send", sendInvoice);
router.patch("/:id/mark-paid", markInvoiceAsPaid);
router.delete("/:id", deleteInvoice);

// Invoice details
router.get("/:id/detail", getInvoiceDetail);
router.put("/:id/detail", updateInvoiceDetail);

export default router;
