import { BANK_ACCOUNT_STATUS, BankAccountModel } from "../models/BankAccount.model.js";

export const BankAccountRepository = {
  create: (data: any) => BankAccountModel.create(data),

  findById: (id: string) =>
    BankAccountModel.findOne({ _id: id, deletedAt: null })
      .populate("userId", "fullName email phone role")
      .populate("verifiedBy", "fullName email"),

  findByUserId: (userId: string) =>
    BankAccountModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 }),

  findVerifiedByUserId: (userId: string) =>
    BankAccountModel.findOne({
      userId,
      status: BANK_ACCOUNT_STATUS.VERIFIED,
      deletedAt: null,
    }).sort({ createdAt: -1 }),

  findPendingByUserId: (userId: string) =>
    BankAccountModel.findOne({
      userId,
      status: BANK_ACCOUNT_STATUS.PENDING_VERIFICATION,
      deletedAt: null,
    }).sort({ createdAt: -1 }),

  findAll: (filter: any = {}) =>
    BankAccountModel.find({ ...filter, deletedAt: null })
      .populate("userId", "fullName email phone role")
      .populate("verifiedBy", "fullName email")
      .sort({ createdAt: -1 }),

  update: (id: string, data: any) =>
    BankAccountModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    )
      .populate("userId", "fullName email phone role")
      .populate("verifiedBy", "fullName email"),

  softDelete: (id: string) =>
    BankAccountModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { returnDocument: "after" }
    ),
};
