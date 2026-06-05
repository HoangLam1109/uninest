import { api } from "@/lib/api-client";
import type { LandlordTenantListResponse } from "@/types/tenant";
import type {
  RoomImageListResponse,
  RoomListResponse,
  RoomPayload,
  RoomResponse,
  RoomStatus,
} from "@/types/room";

export type RoomListParams = {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  status?: RoomStatus;
  minPrice?: number;
  maxPrice?: number;
};

function buildRoomQuery(params?: RoomListParams) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  if (params?.city) query.set("city", params.city);
  if (params?.district) query.set("district", params.district);
  if (params?.status) query.set("status", params.status);
  if (params?.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  return query.toString();
}

export const roomApi = {
  list: (params?: RoomListParams) =>
    api.get<RoomListResponse>(`/rooms/getAll?${buildRoomQuery(params)}`),

  listMy: (params?: RoomListParams) =>
    api.get<RoomListResponse>(`/rooms/my?${buildRoomQuery(params)}`),

  getById: (roomId: string) =>
    api.get<RoomResponse>(`/rooms/getById/${roomId}`),

  create: (payload: RoomPayload) =>
    api.post<RoomResponse>("/rooms/create", payload),

  update: (roomId: string, payload: Partial<RoomPayload>) =>
    api.put<RoomResponse>(`/rooms/update/${roomId}`, payload),

  delete: (roomId: string) =>
    api.delete<RoomResponse>(`/rooms/delete/${roomId}`),

  publish: (roomId: string) =>
    api.patch<RoomResponse>(`/rooms/${roomId}/publish`),

  unpublish: (roomId: string) =>
    api.patch<RoomResponse>(`/rooms/${roomId}/unpublish`),

  listImages: (roomId: string) =>
    api.get<RoomImageListResponse>(`/rooms/${roomId}/images`),

  /** GET /api/rooms/tenants */
  listTenants: () => api.get<LandlordTenantListResponse>("/rooms/tenants"),
};
