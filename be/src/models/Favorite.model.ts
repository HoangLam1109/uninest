import { Schema, model, Document, Types } from "mongoose";

export interface IFavorite extends Document {
  tenantId: Types.ObjectId;
  roomId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "favorites",
  }
);

// Unique constraint: one tenant can favorite one room only once
FavoriteSchema.index({ tenantId: 1, roomId: 1 }, { unique: true });

export const FavoriteModel = model<IFavorite>("Favorite", FavoriteSchema);
