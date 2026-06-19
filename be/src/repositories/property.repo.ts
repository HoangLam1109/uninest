import { PropertyModel } from "../models/Property.model.js";
import mongoose from "mongoose";

export const PropertyRepository = {
  create: (data: any) => PropertyModel.create(data),

  findAll: (filter: any, skip: number, limit: number) =>
    PropertyModel.find(filter)
      .populate("landlordId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  count: (filter: any) => PropertyModel.countDocuments(filter),

  findById: (id: string, landlordId: string) =>
    PropertyModel.findOne({ _id: id, landlordId, deletedAt: null }),

  findByIdPublic: (id: string) =>
    PropertyModel.findOne({ _id: id, isActive: true, deletedAt: null }),

  update: (id: string, landlordId: string, data: any) =>
    PropertyModel.findOneAndUpdate(
      { _id: id, landlordId, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string, landlordId: string) =>
    PropertyModel.findOneAndUpdate(
      { _id: id, landlordId, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    ),

  search: (keyword: any, skip: number, limit: number) =>
    PropertyModel.find({ ...keyword, deletedAt: null })
      .populate("landlordId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countSearch: (keyword: any) =>
    PropertyModel.countDocuments({ ...keyword, deletedAt: null }),
};
