import { LandlordBankInfoModel, BANK_INFO_STATUS } from "../models/LandlordBankInfo.model.js";

export const LandlordBankInfoRepository = {
  create: (data: any) => LandlordBankInfoModel.create(data),
  findById: (id: string) => LandlordBankInfoModel.findOne({ _id: id, deletedAt: null }).populate("userId", "fullName email phone role").populate("verifiedBy", "fullName email"),
  findByUserId: (userId: string) => LandlordBankInfoModel.find({ userId, deletedAt: null }).sort({ createdAt: -1 }),
  findVerifiedByUserId: (userId: string) => LandlordBankInfoModel.findOne({ userId, status: BANK_INFO_STATUS.VERIFIED, deletedAt: null }).sort({ createdAt: -1 }),
  findPendingByUserId: (userId: string) => LandlordBankInfoModel.findOne({ userId, status: BANK_INFO_STATUS.PENDING_VERIFICATION, deletedAt: null }).sort({ createdAt: -1 }),
  findAll: (filter: any = {}) => LandlordBankInfoModel.find({ ...filter, deletedAt: null }).populate("userId", "fullName email phone role").populate("verifiedBy", "fullName email").sort({ createdAt: -1 }),
  update: (id: string, data: any) => LandlordBankInfoModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: data }, { returnDocument: "after", runValidators: true }).populate("userId", "fullName email phone role").populate("verifiedBy", "fullName email"),
  softDelete: (id: string) => LandlordBankInfoModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { returnDocument: "after" }),
};
