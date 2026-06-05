import type {
  Booking,
  BookingRoom,
  BookingStatus,
  BookingUser,
} from '../types/booking.type'

export const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

export const bookingStatusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  APPROVED: 'bg-green-500/10 text-green-700',
  REJECTED: 'bg-red-500/10 text-red-600',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

export function getBookingRoom(booking: Booking): BookingRoom | null {
  return typeof booking.roomId === 'string' ? null : booking.roomId
}

export function getBookingTenant(booking: Booking): BookingUser | null {
  return typeof booking.tenantId === 'string' ? null : booking.tenantId
}

export function formatBookingDate(value?: string) {
  if (!value) return 'Chua cap nhat'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chua cap nhat'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatBookingCurrency(value?: number) {
  if (typeof value !== 'number') return 'Chua cap nhat'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
