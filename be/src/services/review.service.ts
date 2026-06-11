import { ReviewRepository } from "../repositories/review.repo.js";

export const ReviewService = {
  createReview: async (
    reviewerId: string,
    roomId: string,
    reviewData: {
      rating: number;
      comment: string;
      imageUrls?: string[];
    }
  ) => {
    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if review already exists
    const existingReview = await ReviewRepository.checkIfReviewExists(
      roomId,
      reviewerId
    );
    if (existingReview) {
      throw new Error("You have already reviewed this room");
    }

    // Create review
    const review = await ReviewRepository.create({
      reviewerId,
      roomId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      imageUrls: reviewData.imageUrls || [],
    });

    return review;
  },

  getReviewById: async (id: string) => {
    const review = await ReviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  },

  getReviewsByRoom: async (
    roomId: string,
    skip: number,
    limit: number
  ) => {
    const [reviews, total] = await Promise.all([
      ReviewRepository.findByRoomId(roomId, skip, limit),
      ReviewRepository.countByRoomId(roomId),
    ]);

    // Get rating statistics
    const stats = await ReviewRepository.getAverageRatingByRoom(roomId);
    const distribution = await ReviewRepository.getRatingDistribution(roomId);

    return {
      reviews,
      total,
      statistics: {
        averageRating: stats[0]?.averageRating || 0,
        reviewCount: stats[0]?.reviewCount || 0,
        ratingDistribution: distribution,
      },
    };
  },

  getReviewsByTenant: async (
    reviewerId: string,
    skip: number,
    limit: number
  ) => {
    const [reviews, total] = await Promise.all([
      ReviewRepository.findByReviewerId(reviewerId, skip, limit),
      ReviewRepository.countByReviewerId(reviewerId),
    ]);

    return { reviews, total };
  },

  updateReview: async (
    reviewId: string,
    reviewerId: string,
    updateData: {
      rating?: number;
      comment?: string;
      imageUrls?: string[];
    }
  ) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only reviewer can update
    if (review.reviewerId._id.toString() !== reviewerId) {
      throw new Error("You can only edit your own reviews");
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const updated = await ReviewRepository.update(reviewId, updateData);
    return updated;
  },

  deleteReview: async (reviewId: string, reviewerId: string) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only reviewer can delete
    if (review.reviewerId._id.toString() !== reviewerId) {
      throw new Error("You can only delete your own reviews");
    }

    return await ReviewRepository.softDelete(reviewId);
  },

  addLandlordReply: async (
    reviewId: string,
    landlordId: string,
    reply: string
  ) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Verify landlord owns the room
    if ((review.roomId as any).landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this room");
    }

    const updated = await ReviewRepository.update(reviewId, {
      landlordReply: reply,
    });

    return updated;
  },

  getRoomRatingStats: async (roomId: string) => {
    const stats = await ReviewRepository.getAverageRatingByRoom(roomId);
    const distribution = await ReviewRepository.getRatingDistribution(roomId);

    return {
      averageRating: stats[0]?.averageRating || 0,
      reviewCount: stats[0]?.reviewCount || 0,
      ratingDistribution: distribution,
    };
  },

};
