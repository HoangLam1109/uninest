import { api } from "@/lib/api-client";
import type { AiRoomSearchPayload, AiRoomSearchResponse } from "@/types/ai";

export const aiApi = {
  searchRooms: (payload: AiRoomSearchPayload) =>
    api.post<AiRoomSearchResponse>("/ai/search-rooms", payload),
};
