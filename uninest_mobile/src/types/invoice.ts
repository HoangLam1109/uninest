export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

export type InvoiceUserRef = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type InvoiceRoomRef = {
  _id: string;
  title?: string;
};

export type InvoiceBookingRef = {
  _id: string;
  roomId?: string | InvoiceRoomRef;
};

export type Invoice = {
  _id: string;
  bookingId: string | InvoiceBookingRef;
  landlordId: string | InvoiceUserRef;
  tenantId?: string | InvoiceUserRef;
  billingMonth: string;
  dueDate: string;
  rentAmount: number;
  electricityAmount?: number;
  waterAmount?: number;
  additionalFees?: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  sentAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceDetail = {
  _id: string;
  invoiceId: string;
  electricityOldIndex?: number;
  electricityNewIndex?: number;
  electricityUsage?: number;
  electricityRate?: number;
  electricityAmount?: number;
  waterOldIndex?: number;
  waterNewIndex?: number;
  waterUsage?: number;
  waterRate?: number;
  waterAmount?: number;
  otherDetails?: Record<string, unknown>;
};

export type InvoiceListResponse = {
  success: boolean;
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type InvoiceResponse = {
  success: boolean;
  data: Invoice;
};

export type InvoiceDetailResponse = {
  success: boolean;
  data: InvoiceDetail | null;
};
