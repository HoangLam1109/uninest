import express from "express";
import {
  activateContract,
  confirmContractByTenant,
  createContractFromBooking,
  getContractById,
  getLandlordContracts,
  getTenantContracts,
  renewContract,
  streamContractFile,
  terminateContract,
  updateContract,
} from "../controllers/contract.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { uploadSingleContractPdf } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All contract routes are protected
router.use(authenticateMiddleware.authenticateUser);

// Create contract from booking
router.post("/", uploadSingleContractPdf, createContractFromBooking);

// Specific paths before param routes
router.get("/landlord", getLandlordContracts);
router.get("/tenant", getTenantContracts);
router.get("/:id/file", streamContractFile);

// Get contract by ID
router.get("/:id", getContractById);

// Contract actions
router.put("/:id", uploadSingleContractPdf, updateContract);
router.patch("/:id/activate", activateContract);
router.patch("/:id/tenant-confirm", confirmContractByTenant);
router.patch("/:id/terminate", terminateContract);
router.post("/:id/renew", uploadSingleContractPdf, renewContract);

export default router;
