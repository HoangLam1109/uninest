import { Router } from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../constants/role.constant.js";
import {
  getTransactions,
  getTransactionStats,
  getTransactionById,
  markPaymentFailed,
  markPaymentResolved,
  markDisbursementFailed,
  markDisbursementResolved,
} from "../controllers/admin-transaction.controller.js";

const router = Router();

// Tất cả route này yêu cầu ADMIN
router.use(authenticateMiddleware.authenticateUser, authorizeRoles(USER_ROLES.ADMIN));

// Danh sách & thống kê giao dịch
router.get("/", getTransactions);
router.get("/stats", getTransactionStats);
router.get("/:id", getTransactionById);

// Thao tác trên payment (IN)
router.patch("/payment/:paymentId/failed", markPaymentFailed);
router.patch("/payment/:paymentId/resolved", markPaymentResolved);

// Thao tác trên disbursement (OUT)
router.patch("/disbursement/:disbursementId/failed", markDisbursementFailed);
router.patch("/disbursement/:disbursementId/resolved", markDisbursementResolved);

export default router;
