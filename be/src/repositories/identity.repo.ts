import { IdentityModel } from "../models/Identity.model.js";

export const IdentityRepository = {
  create: (data: any) => IdentityModel.create(data),

  findById: (id: string) =>
    IdentityModel.findOne({ _id: id, deletedAt: null })
      .populate("userId", "fullName email phone")
      .populate("verifiedBy", "fullName email"),

  findByCccdNumber: (cccdNumber: string) =>
    IdentityModel.findOne({ cccdNumber, deletedAt: null }),

  findByUserId: (userId: string) =>
    IdentityModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 }),

  findLatestByUserId: (userId: string) =>
    IdentityModel.findOne({ userId, deletedAt: null })
      .sort({ createdAt: -1 }),

  findVerifiedByUserId: (userId: string) =>
    IdentityModel.findOne({ userId, status: "VERIFIED", deletedAt: null })
      .sort({ createdAt: -1 }),

  update: (id: string, data: any) =>
    IdentityModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    )
    .populate("userId", "fullName email phone")
    .populate("verifiedBy", "fullName email"),

  softDelete: (id: string) =>
    IdentityModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { returnDocument: "after" }
    ),
};
