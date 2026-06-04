import { RoomRepository } from "../repositories/room.repo.js";
import { RoomImageRepository } from "../repositories/room-image.repo.js";
import { ROOM_STATUS } from "../models/Room.model.js";

export const RoomService = {
  createRoom: async (data: any, landlordId: string) => {
    return await RoomRepository.create({
      ...data,
      landlordId,
      status: ROOM_STATUS.AVAILABLE,
    });
  },

  getAllRooms: async (filter: any, skip: number, limit: number) => {
    const [rooms, total] = await Promise.all([
      RoomRepository.findAll(filter, skip, limit),
      RoomRepository.count(filter),
    ]);

    return { rooms, total };
  },

  searchRooms: async (keyword: any, skip: number, limit: number) => {
    const [rooms, total] = await Promise.all([
      RoomRepository.search(keyword, skip, limit),
      RoomRepository.countSearch(keyword),
    ]);

    return { rooms, total };
  },

  getRoomById: async (id: string, landlordId: string) => {
    return await RoomRepository.findById(id, landlordId);
  },

  updateRoom: async (id: string, landlordId: string, data: any) => {
    return await RoomRepository.update(id, landlordId, data);
  },

  deleteRoom: async (id: string, landlordId: string) => {
    return await RoomRepository.delete(id, landlordId);
  },

  // Publish/Unpublish
  publishRoom: async (id: string, landlordId: string) => {
    return await RoomRepository.update(id, landlordId, { isPublished: true });
  },

  unpublishRoom: async (id: string, landlordId: string) => {
    return await RoomRepository.update(id, landlordId, { isPublished: false });
  },

  // Room Images
  uploadRoomImage: async (roomId: string, imageData: any) => {
    return await RoomImageRepository.create({
      roomId,
      url: imageData.url,
      caption: imageData.caption,
      order: imageData.order || 0,
      isPrimary: imageData.isPrimary || false,
    });
  },

  getRoomImages: async (roomId: string) => {
    return await RoomImageRepository.findByRoomId(roomId);
  },

  deleteRoomImage: async (imageId: string, roomId: string) => {
    return await RoomImageRepository.delete(imageId, roomId);
  },

  updateRoomImage: async (imageId: string, roomId: string, updateData: any) => {
    return await RoomImageRepository.update(imageId, roomId, updateData);
  },

  setPrimaryImage: async (imageId: string, roomId: string) => {
    const result = await RoomImageRepository.setPrimaryImage(roomId, imageId);
    return result[1];
  },
};
