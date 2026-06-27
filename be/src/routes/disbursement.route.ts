import express from "express";
import { getPendingDisbursements, getAdminDisbursements, getLandlordDisbursements, getDisbursementStats, getDisbursementById, retryDisbursement, syncDisbursement, syncAllDisbursements, manualCompleteDisbursement } from "../controllers/disbursement.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authenticateMiddleware.authenticateUser);
router.get("/landlord", getLandlordDisbursements);
router.get("/stats", authorizeRoles(USER_ROLES.ADMIN), getDisbursementStats);
router.get("/pending", authorizeRoles(USER_ROLES.ADMIN), getPendingDisbursements);
router.get("/admin", authorizeRoles(USER_ROLES.ADMIN), getAdminDisbursements);
router.post("/sync-all", authorizeRoles(USER_ROLES.ADMIN), syncAllDisbursements);
router.get("/:id", getDisbursementById);
router.post("/:id/manual-complete", authorizeRoles(USER_ROLES.ADMIN), manualCompleteDisbursement);
router.post("/:id/retry", authorizeRoles(USER_ROLES.ADMIN), retryDisbursement);
router.post("/:id/sync", authorizeRoles(USER_ROLES.ADMIN), syncDisbursement);
export default router;
