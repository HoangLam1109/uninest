import { CONTRACT_STATUS, ContractModel } from "../models/Contract.model.js";
import mongoose from "mongoose";

export const ContractRepository = {
  create: (data: any) => ContractModel.create(data),

  findById: (id: string) =>
    ContractModel.findOne({ _id: id, deletedAt: null })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone")
      .populate("renewalFromId"),

  findByBookingId: (bookingId: string) =>
    ContractModel.findOne({ bookingId, deletedAt: null })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone"),

  findByLandlordId: (landlordId: string, skip: number, limit: number) =>
    ContractModel.find({ landlordId, deletedAt: null })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByLandlordId: (landlordId: string) =>
    ContractModel.countDocuments({ landlordId, deletedAt: null }),

  findByTenantId: (tenantId: string, skip: number, limit: number) =>
    ContractModel.find({ tenantId, deletedAt: null })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByTenantId: (tenantId: string) =>
    ContractModel.countDocuments({ tenantId, deletedAt: null }),

  /** Tìm contract theo tenantId HOẶC theo các bookingId (dành cho người thuê kèm) */
  findByTenantOrBookingIds: (
    tenantId: string,
    bookingIds: string[],
    skip: number,
    limit: number,
  ) =>
    ContractModel.find({
      deletedAt: null,
      $or: [
        { tenantId },
        ...(bookingIds.length > 0 ? [{ bookingId: { $in: bookingIds } }] : []),
      ],
    })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByTenantOrBookingIds: (tenantId: string, bookingIds: string[]) =>
    ContractModel.countDocuments({
      deletedAt: null,
      $or: [
        { tenantId },
        ...(bookingIds.length > 0 ? [{ bookingId: { $in: bookingIds } }] : []),
      ],
    }),

  update: (id: string, data: any) =>
    ContractModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string) =>
    ContractModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    ),

  findByBookingIdAndDelete: (bookingId: string) =>
    ContractModel.updateMany(
      { bookingId, deletedAt: null },
      { deletedAt: new Date() }
    ),

  checkActiveContractByLandlordAndTenant: (
    landlordId: string,
    tenantId: string
  ) =>
    ContractModel.findOne({
      landlordId,
      tenantId,
      status: CONTRACT_STATUS.ACTIVE,
      deletedAt: null,
    }),

  findByStatus: (status: CONTRACT_STATUS, skip: number, limit: number) =>
    ContractModel.find({ status, deletedAt: null })
      .populate({
        path: "bookingId",
        populate: { path: "roomId", select: "title address" },
      })
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByStatus: (status: CONTRACT_STATUS) =>
    ContractModel.countDocuments({ status, deletedAt: null }),
};
