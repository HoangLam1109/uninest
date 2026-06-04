import { api } from '@/lib/axios'
import type {
  RoomListParams,
  RoomListResponse,
  RoomImageListResponse,
  RoomImagePayload,
  RoomImageResponse,
  RoomPayload,
  RoomResponse,
} from '../types/room.type'

export const roomApi = {
  list: (params: RoomListParams) =>
    api.get<RoomListResponse>('/rooms/getAll', { params }),

  my: (params: RoomListParams) =>
    api.get<RoomListResponse>('/rooms/my', { params }),

  getById: (id: string) => api.get<RoomResponse>(`/rooms/getById/${id}`),

  create: (payload: RoomPayload) =>
    api.post<RoomResponse>('/rooms/create', payload),

  update: (id: string, payload: RoomPayload) =>
    api.put<RoomResponse>(`/rooms/update/${id}`, payload),

  delete: (id: string) => api.delete<{ success: boolean; message?: string }>(
    `/rooms/delete/${id}`,
  ),

  listImages: (roomId: string) =>
    api.get<RoomImageListResponse>(`/rooms/${roomId}/images`),

  uploadImage: (roomId: string, payload: RoomImagePayload) => {
    const formData = new FormData()
    formData.append('image', payload.image)
    if (payload.caption) formData.append('caption', payload.caption)
    if (typeof payload.order === 'number') formData.append('order', String(payload.order))
    if (typeof payload.isPrimary === 'boolean') {
      formData.append('isPrimary', String(payload.isPrimary))
    }

    return api.post<RoomImageResponse>(`/rooms/${roomId}/images`, formData)
  },

  setPrimaryImage: (roomId: string, imageId: string) =>
    api.patch<RoomImageResponse>(`/rooms/${roomId}/images/${imageId}/primary`),

  deleteImage: (roomId: string, imageId: string) =>
    api.delete<{ success: boolean; message?: string }>(
      `/rooms/${roomId}/images/${imageId}`,
    ),
}
