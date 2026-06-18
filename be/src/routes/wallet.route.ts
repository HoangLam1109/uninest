import express from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getWallet,
  getWalletTransactions,
  topUpWallet,
  withdrawFromWallet,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.use(authenticateMiddleware.authenticateUser);

router.get("/", getWallet);
router.get("/transactions", getWalletTransactions);
router.post("/topup", authorizeRoles("ADMIN"), topUpWallet);
router.post("/withdraw", authorizeRoles("ADMIN"), withdrawFromWallet);

export default router;