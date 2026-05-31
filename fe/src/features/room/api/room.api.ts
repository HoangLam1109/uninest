import { api } from '@/lib/axios'
import type {
  RoomListParams,
  RoomListResponse,
  RoomPayload,
  RoomResponse,
} from '../types/room.type'

export const roomApi = {
  list: (params: RoomListParams) =>
    api.get<RoomListResponse>('/rooms/getAll', { params }),

  getById: (id: string) => api.get<RoomResponse>(`/rooms/getById/${id}`),

  create: (payload: RoomPayload) =>
    api.post<RoomResponse>('/rooms/create', payload),

  update: (id: string, payload: RoomPayload) =>
    api.put<RoomResponse>(`/rooms/update/${id}`, payload),

  delete: (id: string) => api.delete<{ success: boolean; message?: string }>(
    `/rooms/delete/${id}`,
  ),
}
