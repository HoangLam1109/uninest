import express from "express";
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getBookingById,
  getLandlordBookings,
  getTenantBookings,
  rejectBooking,
} from "../controllers/booking.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();
// All booking routes are protected
router.use(authenticateMiddleware.authenticateUser);

// Create booking
router.post("/", createBooking);

// Specific paths before param routes
router.get("/my", getTenantBookings);
router.get("/landlord", getLandlordBookings);

// Get booking by ID
router.get("/:id", getBookingById);

// Booking actions
router.patch("/:id/approve", approveBooking);
router.patch("/:id/reject", rejectBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
