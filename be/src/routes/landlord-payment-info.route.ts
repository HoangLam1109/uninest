import express from "express";
import {
  getMyPaymentInfo,
  upsertMyPaymentInfo,
  checkPaymentInfo,
  getAllPaymentInfos,
  approvePaymentInfo,
  rejectPaymentInfo,
} from "../controllers/landlord-payment-info.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../constants/role.constant.js";

const router = express.Router();

// All routes protected
router.use(authenticateMiddleware.authenticateUser);

// Landlord: manage own payment info
router.get("/my", getMyPaymentInfo);
router.put("/my", upsertMyPaymentInfo);
router.get("/my/check", checkPaymentInfo);

// Admin: manage all payment info
router.get("/admin/all", authorizeRoles(USER_ROLES.ADMIN), getAllPaymentInfos);
router.patch("/admin/:id/approve", authorizeRoles(USER_ROLES.ADMIN), approvePaymentInfo);
router.patch("/admin/:id/reject", authorizeRoles(USER_ROLES.ADMIN), rejectPaymentInfo);

export default router;
