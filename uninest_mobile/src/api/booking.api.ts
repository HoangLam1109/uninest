import { api } from "@/lib/api-client";
import type {
  BookingListResponse,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/types/booking";

export const bookingApi = {
  /** POST /api/bookings/ */
  create: (payload: CreateBookingPayload) =>
    api.post<CreateBookingResponse>("/bookings/", payload),

  /** GET /api/bookings/my */
  listMine: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 20));
    return api.get<BookingListResponse>(`/bookings/my?${query.toString()}`);
  },
};
