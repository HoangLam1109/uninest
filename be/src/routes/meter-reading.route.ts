import express from "express";
import {
  getMeterReadingsByContract,
  getMeterReadingsByInvoice,
  getMyMeterReadings,
} from "../controllers/meter-reading.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.use(authenticateMiddleware.authenticateUser);

// Tenant: xem lịch sử chỉ số của chính mình
router.get("/my", getMyMeterReadings);

// Lấy MeterReading theo invoice
router.get("/invoice/:invoiceId", getMeterReadingsByInvoice);

// Landlord: xem lịch sử chỉ số của một hợp đồng
router.get("/contract/:contractId", getMeterReadingsByContract);

export default router;
