export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type BookingUser = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type BookingRoomRef = {
  _id: string;
  title?: string;
  address?: string;
  pricePerMonth?: number;
  city?: string;
  district?: string;
  landlordId?: string;
};

export type BookingIdentityRef = {
  _id: string;
  fullName?: string;
  cccdNumber?: string;
  phone?: string;
  status?: string;
};

export type Booking = {
  _id: string;
  roomId: string | BookingRoomRef;
  tenantId?: string | BookingUser;
  status: BookingStatus;
  createdAt: string;
  checkInDate?: string;
  checkOutDate?: string;
  notes?: string;
  totalPrice?: number;
  identityIds?: Array<string | BookingIdentityRef>;
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
  notes?: string;
  identityIds: string[];
};

export type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: Booking;
};

export type BookingResponse = {
  success: boolean;
  message?: string;
  data: Booking;
};
