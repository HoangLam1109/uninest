import { ReviewModel } from "../models/Review.model.js";
import { Types } from "mongoose";

export const ReviewRepository = {
  create: (data: any) => ReviewModel.create(data),

  findById: (id: string) =>
    ReviewModel.findOne({ _id: id, deletedAt: null })
      .populate("reviewerId", "fullName avatar")
      .populate({
        path: "roomId",
        select: "name pricePerMonth landlordId",
        populate: {
          path: "landlordId",
          select: "_id fullName",
        },
      }),

  findByRoomId: (roomId: string, skip: number, limit: number) =>
    ReviewModel.find({ roomId, deletedAt: null })
      .populate("reviewerId", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByRoomId: (roomId: string) =>
    ReviewModel.countDocuments({ roomId, deletedAt: null }),

  findByReviewerId: (reviewerId: string, skip: number, limit: number) =>
    ReviewModel.find({ reviewerId, deletedAt: null })
      .populate("roomId", "name pricePerMonth")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByReviewerId: (reviewerId: string) =>
    ReviewModel.countDocuments({ reviewerId, deletedAt: null }),

  checkIfReviewExists: (roomId: string, reviewerId: string) =>
    ReviewModel.findOne({ roomId, reviewerId, deletedAt: null }),

  update: (id: string, data: any) =>
    ReviewModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string) =>
    ReviewModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    ),

  getAverageRatingByRoom: (roomId: string) =>
    ReviewModel.aggregate([
      { $match: { roomId: new Types.ObjectId(roomId), deletedAt: null } },
      { $group: { _id: "$roomId", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
    ]),

  getRatingDistribution: (roomId: string) =>
    ReviewModel.aggregate([
      { $match: { roomId: new Types.ObjectId(roomId), deletedAt: null } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
};
