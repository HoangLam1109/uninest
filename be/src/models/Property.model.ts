import { Schema, model, Document, Types } from "mongoose";

export interface IProperty extends Document {
  landlordId: Types.ObjectId;
  name: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  totalRooms: number;
  description?: string;
  coverImageUrl?: string;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Landlord ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      minlength: [3, "Property name must be at least 3 characters long"],
      maxlength: [100, "Property name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    totalRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "properties",
  }
);

// Soft delete index
PropertySchema.index({ deletedAt: 1 });

export const PropertyModel = model<IProperty>("Property", PropertySchema);
