export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type BookingRoomRef = {
  _id: string;
  title?: string;
  address?: string;
  pricePerMonth?: number;
  city?: string;
  district?: string;
};

export type Booking = {
  _id: string;
  roomId: string | BookingRoomRef;
  status: BookingStatus;
  createdAt: string;
  checkInDate?: string;
};

export type BookingListResponse = {
  success: boolean;
  data: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateBookingPayload = {
  roomId: string;
  checkInDate: string;
  checkOutDate?: string;
  notes?: string;
};

export type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: Booking;
};
