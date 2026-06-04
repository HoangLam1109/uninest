import type { Room } from "@/types/room";

export type RoomFavorite = {
  _id: string;
  tenantId: string;
  roomId: string | Room;
  createdAt?: string;
  updatedAt?: string;
};

export type FavoriteListResponse = {
  success: boolean;
  data: RoomFavorite[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
};

export type FavoriteCheckResponse = {
  success: boolean;
  data: {
    roomId: string;
    isFavorited: boolean;
  };
  message?: string;
};

export type FavoriteCountResponse = {
  success: boolean;
  data: {
    roomId: string;
    favoriteCount: number;
  };
  message?: string;
};

export type FavoriteMutationResponse = {
  success: boolean;
  message?: string;
  data?: RoomFavorite;
};
