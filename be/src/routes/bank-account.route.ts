import express from "express";
import {
  createBankAccount,
  getAdminBankAccounts,
  getLandlordBankAccount,
  getMyBankAccounts,
  getMyVerifiedBankAccount,
  rejectBankAccount,
  testPayOSConnection,
  updateBankAccount,
  verifyBankAccount,
} from "../controllers/bank-account.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateMiddleware.authenticateUser);

// Landlord: Create PayOS account
router.post("/", createBankAccount);

// Landlord: Get my bank accounts
router.get("/my", getMyBankAccounts);

// Landlord: Get my verified PayOS account
router.get("/my/verified", getMyVerifiedBankAccount);

// Landlord: Update PayOS account (only when REJECTED)
router.put("/:id", updateBankAccount);

// Landlord: Test PayOS connection with provided keys (no DB save)
router.post("/test-payos", testPayOSConnection);

// Admin: Get all bank accounts for moderation
router.get("/admin", authorizeRoles(USER_ROLES.ADMIN), getAdminBankAccounts);

// Admin: Verify bank account
router.patch(
  "/admin/:id/verify",
  authorizeRoles(USER_ROLES.ADMIN),
  verifyBankAccount
);

// Admin: Reject bank account
router.patch(
  "/admin/:id/reject",
  authorizeRoles(USER_ROLES.ADMIN),
  rejectBankAccount
);

// Public: Get landlord's verified bank account (for invoice display)
router.get("/landlord/:landlordId", getLandlordBankAccount);

export default router;
