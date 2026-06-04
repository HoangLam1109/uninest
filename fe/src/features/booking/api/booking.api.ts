import { api } from '@/lib/axios'
import type {
  BookingListParams,
  BookingListResponse,
  BookingResponse,
  CreateBookingPayload,
} from '../types/booking.type'

export const bookingApi = {
  create: (payload: CreateBookingPayload) =>
    api.post<BookingResponse>('/bookings', payload),

  my: (params: Pick<BookingListParams, 'page' | 'limit'>) =>
    api.get<BookingListResponse>('/bookings/my', { params }),

  landlord: (params: BookingListParams) =>
    api.get<BookingListResponse>('/bookings/landlord', { params }),

  getById: (id: string) => api.get<BookingResponse>(`/bookings/${id}`),

  approve: (id: string) => api.patch<BookingResponse>(`/bookings/${id}/approve`),

  reject: (id: string) => api.patch<BookingResponse>(`/bookings/${id}/reject`),

  cancel: (id: string) => api.patch<BookingResponse>(`/bookings/${id}/cancel`),
}
