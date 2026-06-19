import { AmenityModel } from "../models/Amenity.model.js";

export const AmenityRepository = {
  create: (data: { name: string }) => AmenityModel.create(data),

  findAll: () => AmenityModel.find().sort({ name: 1 }),

  findById: (id: string) => AmenityModel.findById(id),

  findByName: (name: string) => AmenityModel.findOne({ name }),

  update: (id: string, data: { name?: string }) =>
    AmenityModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }),

  delete: (id: string) => AmenityModel.findByIdAndDelete(id),
};
