import { FavoriteModel } from "../models/Favorite.model.js";
import mongoose from "mongoose";

export const FavoriteRepository = {
  create: (data: any) => FavoriteModel.create(data),

  findByTenantAndRoom: (tenantId: string, roomId: string) =>
    FavoriteModel.findOne({ tenantId, roomId }),

  findByTenant: (tenantId: string, skip: number, limit: number) =>
    FavoriteModel.find({ tenantId })
      .populate("roomId", "title address pricePerMonth city district status isPublished")
      .populate("tenantId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByTenant: (tenantId: string) =>
    FavoriteModel.countDocuments({ tenantId }),

  delete: (tenantId: string, roomId: string) =>
    FavoriteModel.findOneAndDelete({ tenantId, roomId }),

  deleteByRoomId: (roomId: string) =>
    FavoriteModel.deleteMany({ roomId }),

  isFavorited: (tenantId: string, roomId: string) =>
    FavoriteModel.exists({ tenantId, roomId }),

  findRoomFavoriteCount: (roomId: string) =>
    FavoriteModel.countDocuments({ roomId }),
};
