import { Schema, model, Document, Types } from "mongoose";

export interface IServicePackage extends Document {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features?: Record<string, any>;
  maxRooms?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServicePackageSchema = new Schema<IServicePackage>(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    durationDays: {
      type: Number,
      required: [true, "Duration in days is required"],
      min: 1,
    },
    features: {
      type: Schema.Types.Mixed,
      default: {},
    },
    maxRooms: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "service_packages",
  }
);

export const ServicePackageModel = model<IServicePackage>(
  "ServicePackage",
  ServicePackageSchema
);