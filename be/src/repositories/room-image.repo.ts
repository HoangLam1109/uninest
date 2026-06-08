import { RoomImageModel } from "../models/RoomImage.model.js";

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

  setPrimaryImage: async (roomId: string, imageId: string) => {
    const selectedImage = await RoomImageModel.findOne({ _id: imageId, roomId });
    if (!selectedImage) return null;

    await RoomImageModel.updateMany(
      { roomId, _id: { $ne: imageId } },
      { $set: { isPrimary: false } }
    );

    return RoomImageModel.findOneAndUpdate(
      { _id: imageId, roomId },
      { $set: { isPrimary: true } },
      { returnDocument: "after" }
    );
  },

  countByRoomId: (roomId: string) =>
    RoomImageModel.countDocuments({ roomId }),
};
