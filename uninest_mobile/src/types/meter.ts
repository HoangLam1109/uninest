export type MeterType = "ELECTRICITY" | "WATER";

export type ReadingSource = "INITIAL" | "MONTHLY" | "TENANT_SELF" | "PHOTO";

export type MeterReading = {
  _id: string;
  roomId?: string;
  contractId: string;
  recordedBy?: string | { _id: string; fullName?: string };
  meterType: MeterType;
  readingValue: number;
  source: ReadingSource;
  billingMonth: string;
  readingDate: string;
  photoUrl?: string;
  notes?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type MeterReadingListResponse = {
  success: boolean;
  data: MeterReading[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
};
