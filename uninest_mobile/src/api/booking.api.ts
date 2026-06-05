import { api } from "@/lib/api-client";
import type {
  BookingListResponse,
  BookingResponse,
  BookingStatus,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/types/booking";

export type BookingListParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
};

function buildBookingQuery(params?: BookingListParams) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  if (params?.status) query.set("status", params.status);
  return query.toString();
}

export const bookingApi = {
  /** POST /api/bookings/ */
  create: (payload: CreateBookingPayload) =>
    api.post<CreateBookingResponse>("/bookings/", payload),

  /** GET /api/bookings/my */
  listMine: (params?: BookingListParams) =>
    api.get<BookingListResponse>(`/bookings/my?${buildBookingQuery(params)}`),

  /** GET /api/bookings/landlord */
  listLandlord: (params?: BookingListParams) =>
    api.get<BookingListResponse>(
      `/bookings/landlord?${buildBookingQuery(params)}`,
    ),

  /** GET /api/bookings/:id */
  getById: (bookingId: string) =>
    api.get<BookingResponse>(`/bookings/${bookingId}`),

  /** PATCH /api/bookings/:id/approve */
  approve: (bookingId: string) =>
    api.patch<BookingResponse>(`/bookings/${bookingId}/approve`),

  /** PATCH /api/bookings/:id/reject */
  reject: (bookingId: string) =>
    api.patch<BookingResponse>(`/bookings/${bookingId}/reject`),
};
