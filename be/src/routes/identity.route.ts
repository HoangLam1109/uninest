import express from "express";
import {
  createIdentity,
  getIdentitiesByUserId,
  getIdentityById,
  getMyIdentities,
  searchIdentityByCccd,
  updateIdentity,
} from "../controllers/identity.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
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
