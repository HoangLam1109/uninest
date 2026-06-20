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
  dueDate?: string;
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

export type CreateInvoicePayload = {
  bookingId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: number;
  electricityAmount?: number;
  waterAmount?: number;
  additionalFees?: number;
  notes?: string;
};

export type CreateUtilityInvoicePayload = {
  bookingId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: number;
  electricityNewIndex?: number;
  waterNewIndex?: number;
  electricityRate?: number;
  waterRate?: number;
  additionalFees?: number;
  notes?: string;
};

export type UtilityInvoiceMutationResponse = {
  success: boolean;
  message?: string;
  data: {
    invoice: Invoice;
    detail: InvoiceDetail;
  };
};

export type UpdateInvoicePayload = {
  rentAmount?: number;
  electricityAmount?: number;
  waterAmount?: number;
  additionalFees?: number;
  notes?: string;
  dueDate?: string;
};

export type InvoiceMutationResponse = {
  success: boolean;
  message?: string;
  data: Invoice;
};

export type CreateInitialReadingPayload = {
  contractId: string;
  roomId?: string;
  electricityReading?: number;
  waterReading?: number;
  photoUrls?: { electricity?: string; water?: string };
  notes?: string;
};

export type UpdateInvoiceDetailPayload = {
  electricityOldIndex?: number;
  electricityNewIndex?: number;
  electricityRate?: number;
  waterOldIndex?: number;
  waterNewIndex?: number;
  waterRate?: number;
  otherDetails?: Record<string, unknown>;
};

export type MeterReadingMutationResponse = {
  success: boolean;
  message?: string;
  data: import("@/types/meter").MeterReading | import("@/types/meter").MeterReading[];
};
