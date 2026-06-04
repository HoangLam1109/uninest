import { api } from "@/lib/api-client";
import type {
  RoomImageListResponse,
  RoomListResponse,
  RoomResponse,
} from "@/types/room";

export type RoomListParams = {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  status?: string;
};

export const roomApi = {
  list: (params?: RoomListParams) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 50));
    if (params?.city) query.set("city", params.city);
    if (params?.district) query.set("district", params.district);
    if (params?.status) query.set("status", params.status);
    return api.get<RoomListResponse>(`/rooms/getAll?${query.toString()}`);
  },

  getById: (roomId: string) =>
    api.get<RoomResponse>(`/rooms/getById/${roomId}`),

  listImages: (roomId: string) =>
    api.get<RoomImageListResponse>(`/rooms/${roomId}/images`),
};
