import express from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  subscribe,
  getMySubscriptions,
  getActiveSubscription,
  getSubscriptionById,
  cancelSubscription,
  checkExpiredSubscriptions,
} from "../controllers/service-subscription.controller.js";

const router = express.Router();

router.use(authenticateMiddleware.authenticateUser);

router.post("/packages/:packageId/subscribe", subscribe);
router.get("/my", getMySubscriptions);
router.get("/active", getActiveSubscription);
router.post("/check-expiry", authorizeRoles("ADMIN"), checkExpiredSubscriptions);
router.get("/:id", getSubscriptionById);
router.post("/:id/cancel", cancelSubscription);

export default router;