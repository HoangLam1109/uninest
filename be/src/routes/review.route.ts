import express from "express";
import {
  addLandlordReply,
  createReview,
  deleteReview,
  getMyReviews,
  getPendingReviews,
  getRoomRatingStats,
  getReviewById,
  getReviewsByRoom,
  updateReview,
  verifyReview,
} from "../controllers/review.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// Public endpoints - specific paths before param routes
router.get("/stats", getRoomRatingStats);
router.get("/room", getReviewsByRoom);

// Protected middleware applied after public routes
router.use(authenticateMiddleware.authenticateUser);

// Specific protected routes before param routes
router.get("/pending", getPendingReviews);

// Tenant endpoints
router.post("/", createReview);
router.get("/", getMyReviews);

// Routes with params - come last
router.get("/:id", getReviewById);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.patch("/:id/reply", addLandlordReply);
router.patch("/:id/verify", verifyReview);

export default router;
