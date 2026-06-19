import { api } from "@/lib/api-client";
import type {
  FavoriteCheckResponse,
  FavoriteCountResponse,
  FavoriteListResponse,
  FavoriteMutationResponse,
} from "@/types/favorite";

/**
 * Swagger: /api/favorites
 * - GET  /           → danh sách phòng đã lưu (auth)
 * - GET  /:roomId/check → đã lưu chưa (auth)
 * - GET  /:roomId/count → số lượt lưu (public)
 * - POST /:roomId    → thêm vào danh sách (auth)
 * - DELETE /:roomId  → xóa khỏi danh sách (auth)
 */
export const favoriteApi = {
  /** GET /api/favorites/ */
  list: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 100));
    const qs = query.toString();
    return api.get<FavoriteListResponse>(`/favorites/?${qs}`);
  },

  /** GET /api/favorites/{roomId}/check */
  check: (roomId: string) =>
    api.get<FavoriteCheckResponse>(`/favorites/${roomId}/check`),

  /** GET /api/favorites/{roomId}/count */
  count: (roomId: string) =>
    api.get<FavoriteCountResponse>(`/favorites/${roomId}/count`),

  /** POST /api/favorites/{roomId} */
  add: (roomId: string) =>
    api.post<FavoriteMutationResponse>(`/favorites/${roomId}`),

  /** DELETE /api/favorites/{roomId} */
  remove: (roomId: string) =>
    api.delete<FavoriteMutationResponse>(`/favorites/${roomId}`),
};
