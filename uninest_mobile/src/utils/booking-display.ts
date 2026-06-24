import type { Booking, BookingRoomRef, BookingStatus, BookingUser } from "@/types/booking";

export function bookingStatusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
  };
  return map[status] ?? status;
}

export function bookingStatusBadgeStyle(status: BookingStatus) {
  if (status === "PENDING") return "pending" as const;
  if (status === "APPROVED") return "approved" as const;
  if (status === "REJECTED") return "rejected" as const;
  return "cancelled" as const;
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

export function formatBookingCurrency(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatRoomLocationParts(
  address?: string,
  district?: string,
  city?: string,
) {
  return [address, district, city].filter(Boolean).join(", ") || "Chưa có thông tin phòng";
}
