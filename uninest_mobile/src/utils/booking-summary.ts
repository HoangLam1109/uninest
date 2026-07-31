import type { Booking, BookingStatus } from "@/types/booking";

export type BookingSummaryCounts = Record<BookingStatus, number>;

const EMPTY_SUMMARY: BookingSummaryCounts = {
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
};

export function computeBookingSummary(bookings: Booking[]): BookingSummaryCounts {
  return bookings.reduce(
    (acc, booking) => {
      acc[booking.status] += 1;
      return acc;
    },
    { ...EMPTY_SUMMARY },
  );
}

export type BookingSummaryItem = {
  id: string;
  label: string;
  value: number;
  icon: string;
  valueColor: string;
  iconBackground: string;
};

export function buildBookingSummaryItems(
  bookings: Booking[],
  totalCount?: number,
): BookingSummaryItem[] {
  const summary = computeBookingSummary(bookings);

  return [
    {
      id: "total",
      label: "Kết quả hiện có",
      value: totalCount ?? bookings.length,
      icon: "📄",
      valueColor: "#1F2940",
      iconBackground: "#FFF0DF",
    },
    {
      id: "pending",
      label: "Chờ duyệt",
      value: summary.PENDING,
      icon: "⏱",
      valueColor: "#C47A10",
      iconBackground: "#FFF4E0",
    },
    {
      id: "approved",
      label: "Đã duyệt",
      value: summary.APPROVED,
      icon: "✓",
      valueColor: "#2E8B57",
      iconBackground: "#E8F6EE",
    },
    {
      id: "ended",
      label: "Đã kết thúc",
      value: summary.REJECTED + summary.CANCELLED,
      icon: "✕",
      valueColor: "#D14343",
      iconBackground: "#FDECEC",
    },
  ];
}

export const BOOKING_STATUS_FILTERS: {
  id: "ALL" | BookingStatus;
  label: string;
}[] = [
  { id: "ALL", label: "Tất cả trạng thái" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Từ chối" },
  { id: "CANCELLED", label: "Đã hủy" },
];
