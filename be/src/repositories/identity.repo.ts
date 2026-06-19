import { IDENTITY_STATUS, IdentityModel } from "../models/Identity.model.js";

export const IdentityRepository = {
  create: (data: any) => IdentityModel.create(data),

  findById: (id: string) =>
    IdentityModel.findOne({ _id: id, deletedAt: null })
      .populate("userId", "fullName email phone")
      .populate("verifiedBy", "fullName email"),

  findByCccdNumber: (cccdNumber: string) =>
    IdentityModel.findOne({ cccdNumber, deletedAt: null }),

  /** Search identity by CCCD for booking (only non-rejected, limited fields) */
  findByCccdNumberPublic: (cccdNumber: string) =>
    IdentityModel.findOne({
      cccdNumber,
      status: { $ne: IDENTITY_STATUS.REJECTED },
      deletedAt: null,
    }).select("_id fullName cccdNumber status userId"),

  findByUserId: (userId: string) =>
    IdentityModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 }),

  findAll: (filter: any = {}) =>
    IdentityModel.find({ ...filter, deletedAt: null })
      .populate("userId", "fullName email phone role")
      .populate("verifiedBy", "fullName email")
      .sort({ createdAt: -1 }),

  findLatestByUserId: (userId: string) =>
    IdentityModel.findOne({ userId, deletedAt: null })
      .sort({ createdAt: -1 }),

  findVerifiedByUserId: (userId: string) =>
    IdentityModel.findOne({ userId, status: IDENTITY_STATUS.VERIFIED, deletedAt: null })
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
