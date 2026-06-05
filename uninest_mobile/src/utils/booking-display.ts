import type { Booking, BookingRoomRef, BookingStatus, BookingUser } from "@/types/booking";

export function bookingStatusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    PENDING: "CHỜ DUYỆT",
    APPROVED: "ĐÃ CHẤP NHẬN",
    REJECTED: "TỪ CHỐI",
    CANCELLED: "ĐÃ HỦY",
  };
  return map[status] ?? status;
}

export function getBookingTenant(booking: Booking): BookingUser | null {
  const tenant = booking.tenantId;
  if (typeof tenant === "object" && tenant !== null && "_id" in tenant) {
    return tenant;
  }
  return null;
}

export function getBookingRoom(booking: Booking): BookingRoomRef | null {
  const room = booking.roomId;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return room;
  }
  return null;
}

export function getBookingRoomId(booking: Booking): string | null {
  const room = booking.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

export function formatBookingDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatSubmittedAgo(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Hôm nay";
  return `${days} ngày trước`;
}
