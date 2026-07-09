import { LandlordPaymentInfoModel } from "../models/LandlordPaymentInfo.model.js";

export const LandlordPaymentInfoRepository = {
  create: (data: any) => LandlordPaymentInfoModel.create(data),

  findByUserId: (userId: string) =>
    LandlordPaymentInfoModel.findOne({ userId }),

  upsert: (userId: string, data: any) => {
    // When landlord updates, reset status to PENDING for re-approval
    const upsertData = { ...data, status: "PENDING", reviewedBy: null, reviewedAt: null, rejectionReason: "" };
    return LandlordPaymentInfoModel.findOneAndUpdate(
      { userId },
      { $set: upsertData },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
  },

  update: (userId: string, data: any) =>
    LandlordPaymentInfoModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  updateByAdmin: (id: string, data: any) =>
    LandlordPaymentInfoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ).populate("userId", "fullName email phone"),

  findAll: (filter: any = {}) =>
    LandlordPaymentInfoModel.find(filter)
      .populate("userId", "fullName email phone")
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 }),

  delete: (userId: string) =>
    LandlordPaymentInfoModel.findOneAndDelete({ userId }),
};
