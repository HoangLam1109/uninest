import { RoomRepository } from "../repositories/room.repo.js";
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
};
