import { RoomModel } from "../models/Room.model.js";
export const RoomRepository = {
  create: (data: any) => RoomModel.create(data),

  findAll: (filter: any, skip: number, limit: number) =>
    RoomModel.find(filter)
      .populate("landlordId", "fullName email phone")
      .populate("tenants.tenantId", "fullName email phone avatarUrl")
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
      .populate("tenants.tenantId", "fullName email phone avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countSearch: (keyword: any) => RoomModel.countDocuments(keyword),
  
  getTenantListByLandlord: (landlordId: string) => {
    return RoomModel.find({
      landlordId,
      deletedAt: null,
    })
      .populate({
        path: "tenants.tenantId",
        select: "fullName email phone avatarUrl",
      })
      .lean();
  },

  addTenants: (roomId: string, landlordId: string, tenants: { tenantId: any; isPrimaryTenant: boolean }[]) =>
    RoomModel.findOneAndUpdate(
      { _id: roomId, landlordId },
      { $push: { tenants: { $each: tenants } } },
      { returnDocument: "after", runValidators: true }
    ),
};
