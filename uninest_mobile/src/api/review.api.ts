import { api } from "@/lib/api-client";
import type { RoomReviewsResponse } from "@/types/review";

export const reviewApi = {
  listByRoom: (roomId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    query.set("roomId", roomId);
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 20));
    return api.get<RoomReviewsResponse>(`/reviews/room?${query.toString()}`);
  },
};
