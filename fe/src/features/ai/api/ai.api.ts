import { api } from '@/lib/axios'
import type { AiRoomSearchPayload, AiRoomSearchResponse } from '../types/ai.type'

export const aiApi = {
  searchRooms: (payload: AiRoomSearchPayload) =>
    api.post<AiRoomSearchResponse>('/ai/search-rooms', payload),
}
