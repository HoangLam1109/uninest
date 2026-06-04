import { Schema, model, Document, Types } from "mongoose";

export interface IRoomImage extends Document {
  roomId: Types.ObjectId;
  url: string;
  publicId?: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
  uploadedAt: Date;
}

const RoomImageSchema = new Schema<IRoomImage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
      index: true,
    },
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
    collection: "room_images",
  }
);

// Compound index for roomId and order
RoomImageSchema.index({ roomId: 1, order: 1 });

export const RoomImageModel = model<IRoomImage>("RoomImage", RoomImageSchema);
