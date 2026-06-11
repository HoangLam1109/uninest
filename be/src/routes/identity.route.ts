import express from "express";
import {
  createIdentity,
  getIdentityById,
  getMyIdentities,
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
