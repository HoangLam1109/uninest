import { api } from "@/lib/api-client";
import { appendImageToFormData } from "@/utils/upload-image";
import type { LandlordTenantListResponse } from "@/types/tenant";
import type {
  AmenityListResponse,
  RoomImageListResponse,
  RoomImageResponse,
  RoomListResponse,
  RoomPayload,
  RoomResponse,
  RoomStatus,
  RoomType,
} from "@/types/room";

export type RoomImageUploadInput = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  isPrimary?: boolean;
  caption?: string;
  order?: number;
};

export type RoomListParams = {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  status?: RoomStatus;
  minPrice?: number;
  maxPrice?: number;
  roomType?: RoomType;
};

export type RoomSearchParams = RoomListParams & {
  q?: string;
};

function appendRoomFilters(
  query: URLSearchParams,
  params?: RoomListParams,
) {
  if (params?.city) query.set("city", params.city);
  if (params?.district) query.set("district", params.district);
  if (params?.status) query.set("status", params.status);
  if (params?.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params?.roomType) query.set("roomType", params.roomType);
}

function buildRoomQuery(params?: RoomListParams) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  appendRoomFilters(query, params);
  return query.toString();
}

function buildSearchQuery(params?: RoomSearchParams) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  appendRoomFilters(query, params);
  if (params?.q) query.set("q", params.q);
  return query.toString();
}

export const roomApi = {
  listAmenities: () => api.get<AmenityListResponse>("/amenities"),

  list: (params?: RoomListParams) =>
    api.get<RoomListResponse>(`/rooms/getAll?${buildRoomQuery(params)}`),

  search: (params?: RoomSearchParams) =>
    api.get<RoomListResponse>(`/rooms/search?${buildSearchQuery(params)}`),

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

  uploadImage: async (roomId: string, input: RoomImageUploadInput) => {
    const formData = new FormData();

    await appendImageToFormData(formData, "image", {
      uri: input.uri,
      fileName: input.fileName ?? `room-${Date.now()}.jpg`,
      mimeType: input.mimeType ?? "image/jpeg",
    });

    if (input.caption) formData.append("caption", input.caption);
    if (input.order != null) formData.append("order", String(input.order));
    if (input.isPrimary) formData.append("isPrimary", "true");

    return api.postForm<RoomImageResponse>(`/rooms/${roomId}/images`, formData);
  },

  setPrimaryImage: (roomId: string, imageId: string) =>
    api.patch<RoomImageResponse>(`/rooms/${roomId}/images/${imageId}/primary`),

  deleteImage: (roomId: string, imageId: string) =>
    api.delete<{ success: boolean; message?: string }>(
      `/rooms/${roomId}/images/${imageId}`,
    ),

  /** GET /api/rooms/tenants */
  listTenants: () => api.get<LandlordTenantListResponse>("/rooms/tenants"),
};
