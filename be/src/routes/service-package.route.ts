import express from "express";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  createPackage,
  getPackageById,
  getAllPackages,
  getActivePackages,
  updatePackage,
  deletePackage,
} from "../controllers/service-package.controller.js";

const router = express.Router();

// Public read-only routes (specific paths before param routes)
router.get("/active", getActivePackages);
router.get("/", getAllPackages);
router.get("/:id", getPackageById);

// Admin-only write routes
router.post("/", authenticateMiddleware.authenticateUser, authorizeRoles("ADMIN"), createPackage);
router.put("/:id", authenticateMiddleware.authenticateUser, authorizeRoles("ADMIN"), updatePackage);
router.delete("/:id", authenticateMiddleware.authenticateUser, authorizeRoles("ADMIN"), deletePackage);

export default router;