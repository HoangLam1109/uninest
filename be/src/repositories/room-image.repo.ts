import { RoomImageModel } from "../models/RoomImage.model.js";
import mongoose from "mongoose";

export const RoomImageRepository = {
  create: (data: any) => RoomImageModel.create(data),

  findByRoomId: (roomId: string) =>
    RoomImageModel.find({ roomId })
      .sort({ order: 1, uploadedAt: -1 })
      .lean(),

  findByIdAndRoomId: (imageId: string, roomId: string) =>
    RoomImageModel.findOne({ _id: imageId, roomId }),

  update: (imageId: string, roomId: string, data: any) =>
    RoomImageModel.findOneAndUpdate(
      { _id: imageId, roomId },
      { $set: data },
      { returnDocument: "after" }
    ),

  delete: (imageId: string, roomId: string) =>
    RoomImageModel.findOneAndDelete({ _id: imageId, roomId }),

  deleteByRoomId: (roomId: string) =>
    RoomImageModel.deleteMany({ roomId }),

  setPrimaryImage: (roomId: string, imageId: string) =>
    Promise.all([
      RoomImageModel.updateMany({ roomId }, { isPrimary: false }),
      RoomImageModel.findOneAndUpdate(
        { _id: imageId, roomId },
        { isPrimary: true },
        { returnDocument: "after" }
      ),
    ]),

  countByRoomId: (roomId: string) =>
    RoomImageModel.countDocuments({ roomId }),
};
