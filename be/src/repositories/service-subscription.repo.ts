import { ServiceSubscriptionModel, SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";

export const ServiceSubscriptionRepository = {
  create: (data: any) => ServiceSubscriptionModel.create(data),

  findById: (id: string) =>
    ServiceSubscriptionModel.findById(id)
      .populate("packageId", "name price durationDays targetRole features")
      .populate("paymentId"),

  findByUserId: (userId: string, skip: number, limit: number) =>
    ServiceSubscriptionModel.find({ userId })
      .populate("packageId", "name price durationDays targetRole features")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByUserId: (userId: string) =>
    ServiceSubscriptionModel.countDocuments({ userId }),

  findActiveByUserId: (userId: string) =>
    ServiceSubscriptionModel.findOne({
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
    })
      .populate("packageId", "name price durationDays targetRole features")
      .sort({ createdAt: -1 }),

  findExpiringSubscriptions: (beforeDate: Date) =>
    ServiceSubscriptionModel.find({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { $lte: beforeDate },
    })
      .populate("packageId", "name price durationDays targetRole"),

  update: (id: string, data: any) =>
    ServiceSubscriptionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  cancel: (id: string) =>
    ServiceSubscriptionModel.findByIdAndUpdate(
      id,
      { status: SUBSCRIPTION_STATUS.CANCELLED },
      { returnDocument: "after" }
    ),
};
