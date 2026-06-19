import express from "express";
import {
  createIdentity,
  getAdminIdentities,
  getIdentitiesByUserId,
  getIdentityById,
  getMyIdentities,
  rejectIdentityByAdmin,
  searchIdentityByCccd,
  updateIdentity,
  verifyIdentityByAdmin,
} from "../controllers/identity.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { uploadImageMiddleware } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateMiddleware.authenticateUser);

// Create identity (accepts cccdFront + cccdBack image files)
router.post(
  "/",
  uploadImageMiddleware.fields([
    { name: "cccdFront", maxCount: 1 },
    { name: "cccdBack", maxCount: 1 },
  ]),
  createIdentity
);

// Get my identities (must be before :id)
router.get("/my", getMyIdentities);

// Admin identity verification queue
router.get("/admin", authorizeRoles(USER_ROLES.ADMIN), getAdminIdentities);
router.patch(
  "/admin/:id/verify",
  authorizeRoles(USER_ROLES.ADMIN),
  verifyIdentityByAdmin
);
router.patch(
  "/admin/:id/reject",
  authorizeRoles(USER_ROLES.ADMIN),
  rejectIdentityByAdmin
);

// Get identities by user ID (must be before :id)
router.get("/by-user/:userId", getIdentitiesByUserId);

// Search identity by CCCD (must be before :id)
router.get("/search", searchIdentityByCccd);

// Get identity by ID
router.get("/:id", getIdentityById);

// Update identity (optionally upload new CCCD images)
router.put(
  "/:id",
  uploadImageMiddleware.fields([
    { name: "cccdFront", maxCount: 1 },
    { name: "cccdBack", maxCount: 1 },
  ]),
  updateIdentity
);

export default router;
