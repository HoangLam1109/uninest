import { BookingModel } from "../models/Booking.model.js";
import mongoose from "mongoose";

export const BookingRepository = {
  create: (data: any) => BookingModel.create(data),

  findById: (id: string) =>
    BookingModel.findOne({ _id: id, deletedAt: null })
      .populate("roomId", "title address pricePerMonth landlordId status")
      .populate("tenantId", "fullName email phone")
      .populate("identityIds")
      .populate("contractId"),

  findByTenantId: (tenantId: string, skip: number, limit: number) =>
    BookingModel.find({ tenantId, deletedAt: null })
      .populate("roomId", "title address pricePerMonth city district")
      .populate("tenantId", "fullName email phone")
      .populate("identityIds")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByTenantId: (tenantId: string) =>
    BookingModel.countDocuments({ tenantId, deletedAt: null }),

  findByLandlordRoomIds: (roomIds: string[], skip: number, limit: number) =>
    BookingModel.find({ roomId: { $in: roomIds }, deletedAt: null })
      .populate("roomId", "title address landlordId")
      .populate("tenantId", "fullName email phone")
      .populate("identityIds")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByLandlordRoomIds: (roomIds: string[]) =>
    BookingModel.countDocuments({ roomId: { $in: roomIds }, deletedAt: null }),

  findByRoomIdAndStatus: (roomId: string, status: string) =>
    BookingModel.findOne({ roomId, status, deletedAt: null }),

  findCurrentBookingByRoom: (roomId: string) =>
    BookingModel.findOne({ roomId, isCurrent: true, deletedAt: null }),

  update: (id: string, data: any) =>
    BookingModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string) =>
    BookingModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    ),

  findByRoomAndTenant: (roomId: string, tenantId: string) =>
    BookingModel.findOne({
      roomId,
      tenantId,
      status: { $in: ["PENDING", "APPROVED"] },
      deletedAt: null,
    }),

  countActiveBookingsByRoom: (roomId: string) =>
    BookingModel.countDocuments({
      roomId,
      status: "APPROVED",
      isCurrent: true,
      deletedAt: null,
    }),

  deleteByRoomId: (roomId: string) =>
    BookingModel.updateMany(
      { roomId, deletedAt: null },
      { deletedAt: new Date() }
    ),

  findByIdentityIds: (identityIds: string[]) =>
    BookingModel.find({
      identityIds: { $in: identityIds },
      deletedAt: null,
    })
      .populate("roomId", "title address landlordId"),
};
