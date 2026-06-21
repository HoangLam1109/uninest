import { Schema, model, Document, Types } from "mongoose";
import { USER_ROLES, type UserRole } from "../constants/role.constant.js";

export interface IServicePackage extends Document {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  targetRole: UserRole;
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
    targetRole: {
      type: String,
      enum: [USER_ROLES.TENANT, USER_ROLES.LANDLORD],
      required: [true, "Target role is required"],
      index: true,
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
