import { Schema, model, Document, Types } from "mongoose";

export enum SUBSCRIPTION_STATUS {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface IServiceSubscription extends Document {
  userId: Types.ObjectId;
  packageId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: SUBSCRIPTION_STATUS;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSubscriptionSchema = new Schema<IServiceSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "ServicePackage",
      required: [true, "Package ID is required"],
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "service_subscriptions",
  }
);

ServiceSubscriptionSchema.index({ userId: 1, status: 1 });
ServiceSubscriptionSchema.index({ endDate: 1, status: 1 });

export const ServiceSubscriptionModel = model<IServiceSubscription>(
  "ServiceSubscription",
  ServiceSubscriptionSchema
);