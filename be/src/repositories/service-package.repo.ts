import { ServicePackageModel } from "../models/ServicePackage.model.js";

export const ServicePackageRepository = {
  create: (data: any) => ServicePackageModel.create(data),

  findById: (id: string) =>
    ServicePackageModel.findOne({ _id: id, isActive: true }),

  findAllActive: (skip: number, limit: number) =>
    ServicePackageModel.find({ isActive: true })
      .sort({ price: 1 })
      .skip(skip)
      .limit(limit),

  countAllActive: () =>
    ServicePackageModel.countDocuments({ isActive: true }),

  findAll: (skip: number, limit: number) =>
    ServicePackageModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countAll: () =>
    ServicePackageModel.countDocuments(),

  update: (id: string, data: any) =>
    ServicePackageModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string) =>
    ServicePackageModel.findByIdAndUpdate(id, { isActive: false }),
};