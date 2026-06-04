import { RoomModel } from "../models/Room.model.js";
import mongoose from "mongoose";

export const RoomRepository = {
  create: (data: any) => RoomModel.create(data),

  findAll: (filter: any, skip: number, limit: number) =>
    RoomModel.find(filter)
      .populate("landlordId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  count: (filter: any) => RoomModel.countDocuments(filter),

  findById: (id: string, landlordId?: string) => {
    if (landlordId && landlordId.trim() !== "") {
      return RoomModel.findOne({
        _id: id,
        landlordId,
      });
    }

    return RoomModel.findById(id);
  },


  update: (id: string, landlordId: string, data: any) =>
    RoomModel.findOneAndUpdate(
      { _id: id, landlordId },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  delete: (id: string, landlordId: string) =>
    RoomModel.findOneAndDelete({ _id: id, landlordId }),

  search: (keyword: any, skip: number, limit: number) =>
    RoomModel.find(keyword)
      .populate("landlordId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countSearch: (keyword: any) => RoomModel.countDocuments(keyword),
};
