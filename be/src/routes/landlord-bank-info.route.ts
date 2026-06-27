import express from "express";
import { createBankInfo, getAdminBankInfos, getBankList, getLandlordBankInfo, getMyBankInfos, getMyVerifiedBankInfo, rejectBankInfo, updateBankInfo, verifyBankInfo } from "../controllers/landlord-bank-info.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();
router.get("/banks", getBankList);
router.get("/landlord/:landlordId", getLandlordBankInfo);
router.use(authenticateMiddleware.authenticateUser);
router.post("/", createBankInfo);
router.get("/my", getMyBankInfos);
router.get("/my/verified", getMyVerifiedBankInfo);
router.put("/:id", updateBankInfo);
router.get("/admin", authorizeRoles(USER_ROLES.ADMIN), getAdminBankInfos);
router.patch("/admin/:id/verify", authorizeRoles(USER_ROLES.ADMIN), verifyBankInfo);
router.patch("/admin/:id/reject", authorizeRoles(USER_ROLES.ADMIN), rejectBankInfo);
export default router;
