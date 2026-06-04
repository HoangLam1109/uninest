import { RoomModel } from "../models/Room.model.js";
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
      }).populate("landlordId", "fullName email phone");
    }

    return RoomModel.findById(id).populate("landlordId", "fullName email phone");
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
