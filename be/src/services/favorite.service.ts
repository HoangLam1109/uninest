import { FavoriteRepository } from "../repositories/favorite.repo.js";

export const FavoriteService = {
  addFavorite: async (roomId: string, tenantId: string) => {
    // Check if already favorited
    const existing = await FavoriteRepository.findByTenantAndRoom(
      tenantId,
      roomId
    );

    if (existing) {
      throw new Error("Room is already in your favorites");
    }

    return await FavoriteRepository.create({
      tenantId,
      roomId,
    });
  },

  removeFavorite: async (roomId: string, tenantId: string) => {
    return await FavoriteRepository.delete(tenantId, roomId);
  },

  getTenantFavorites: async (tenantId: string, skip: number, limit: number) => {
    const [favorites, total] = await Promise.all([
      FavoriteRepository.findByTenant(tenantId, skip, limit),
      FavoriteRepository.countByTenant(tenantId),
    ]);

    return { favorites, total };
  },

  isFavorited: async (roomId: string, tenantId: string) => {
    return await FavoriteRepository.isFavorited(tenantId, roomId);
  },

  getRoomFavoriteCount: async (roomId: string) => {
    return await FavoriteRepository.findRoomFavoriteCount(roomId);
  },
};
