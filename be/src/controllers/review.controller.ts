import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ReviewService } from "../services/review.service.js";

/**
 * CREATE REVIEW (Tenant)
 */
export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.userId;
    if (!reviewerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { roomId, bookingId, rating, comment, imageUrls } = req.body;

    if (!roomId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Room ID, booking ID, rating, and comment are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    if (typeof comment !== "string" || comment.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters long",
      });
    }

    const review = await ReviewService.createReview(reviewerId, roomId, {
      bookingId,
      rating,
      comment,
      imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own") ||
      err.message.includes("already reviewed")
      ? 400
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET REVIEW BY ID (Public)
 */
export const getReviewById = async (req: Request, res: Response) => {
  try {
    let { id: reviewId } = req.params;

    if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ success: false, message: "Invalid review id" });

    const review = await ReviewService.getReviewById(reviewId);

    return res.json({ success: true, data: review });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET REVIEWS BY ROOM (Public)
 */
export const getReviewsByRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId as string)) {
      return res.status(400).json({
        success: false,
        message: "Valid room ID is required",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { reviews, total, statistics } = await ReviewService.getReviewsByRoom(
      roomId as string,
      skip,
      limitNumber,
      true // Only verified reviews for public
    );

    return res.json({
      success: true,
      data: reviews,
      statistics,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET MY REVIEWS (Tenant)
 */
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.userId;
    if (!reviewerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { reviews, total } = await ReviewService.getReviewsByTenant(
      reviewerId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE REVIEW (Tenant)
 */
export const updateReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.userId;
    let { id: reviewId } = req.params;

    if (!reviewerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ success: false, message: "Invalid review id" });

    const { rating, comment, imageUrls } = req.body;

    const review = await ReviewService.updateReview(reviewId, reviewerId, {
      rating,
      comment,
      imageUrls,
    });

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    return res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("can only edit")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * DELETE REVIEW (Tenant)
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.userId;
    let { id: reviewId } = req.params;

    if (!reviewerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ success: false, message: "Invalid review id" });

    const review = await ReviewService.deleteReview(reviewId, reviewerId);

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("can only delete")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * ADD LANDLORD REPLY (Landlord)
 */
export const addLandlordReply = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: reviewId } = req.params;
    const { reply } = req.body;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ success: false, message: "Invalid review id" });

    if (!reply || typeof reply !== "string" || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply is required",
      });
    }

    const review = await ReviewService.addLandlordReply(reviewId, landlordId, reply);

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    return res.json({
      success: true,
      message: "Reply added successfully",
      data: review,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * VERIFY REVIEW (Landlord)
 */
export const verifyReview = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: reviewId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ success: false, message: "Invalid review id" });

    const review = await ReviewService.verifyReview(reviewId, landlordId);

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    return res.json({
      success: true,
      message: "Review verified successfully",
      data: review,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET ROOM RATING STATISTICS (Public)
 */
export const getRoomRatingStats = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.query;

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId as string)) {
      return res.status(400).json({
        success: false,
        message: "Valid room ID is required",
      });
    }

    const stats = await ReviewService.getRoomRatingStats(roomId as string);

    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET PENDING REVIEWS (Landlord/Admin)
 */
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { reviews, total } = await ReviewService.getPendingReviews(
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
