import { api } from "@/lib/api-client";
import type { RoomReviewsResponse } from "@/types/review";

export type CreateReviewPayload = {
  roomId: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
};

export type CreateReviewResponse = {
  success: boolean;
  message?: string;
  data: import("@/types/review").Review;
};

export const reviewApi = {
  listByRoom: (roomId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    query.set("roomId", roomId);
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 20));
    return api.get<RoomReviewsResponse>(`/reviews/room?${query.toString()}`);
  },

  create: (payload: CreateReviewPayload) =>
    api.post<CreateReviewResponse>("/reviews", payload),

  reply: (reviewId: string, payload: { reply: string }) =>
    api.patch<CreateReviewResponse>(`/reviews/${reviewId}/reply`, payload),
};
