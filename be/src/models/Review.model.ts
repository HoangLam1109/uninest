import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  reviewerId: Types.ObjectId;
  roomId: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  imageUrls?: string[];
  landlordReply?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer ID is required"],
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    landlordReply: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Unique compound index: one review per room per reviewer
ReviewSchema.index({ roomId: 1, reviewerId: 1 }, { unique: true, sparse: true });

// Indexes for filtering
ReviewSchema.index({ roomId: 1, rating: 1 });
ReviewSchema.index({ deletedAt: 1 });

export const ReviewModel = model<IReview>("Review", ReviewSchema);
