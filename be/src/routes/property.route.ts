import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getPropertyByIdPublic,
  updateProperty,
} from "../controllers/property.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// Protected routes (Landlord only)
router.post("/create", authenticateMiddleware.authenticateUser, createProperty);
router.get("/", authenticateMiddleware.authenticateUser, getAllProperties);
router.get("/:id", authenticateMiddleware.authenticateUser, getPropertyById);
router.put("/:id", authenticateMiddleware.authenticateUser, updateProperty);
router.delete("/:id", authenticateMiddleware.authenticateUser, deleteProperty);

// Public route
router.get("/public/:id", getPropertyByIdPublic);

export default router;
