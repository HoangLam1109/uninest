export type PaymentInfoStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LandlordPaymentInfo = {
  _id?: string;
  userId: string | { _id: string; fullName?: string; email?: string; phone?: string };
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  paymentQrUrl?: string;
  paymentNoteTemplate?: string;
  isPaymentInfoCompleted?: boolean;
  status: PaymentInfoStatus;
  reviewedBy?: string | { _id: string; fullName?: string; email?: string };
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LandlordPaymentInfoPayload = {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  paymentQrUrl?: string;
  paymentNoteTemplate?: string;
};

export type LandlordPaymentInfoCheckResponse = {
  success: boolean;
  data: {
    isComplete: boolean;
    hasPaymentInfo: boolean;
    paymentInfo: LandlordPaymentInfo | null;
  };
};

export type LandlordPaymentInfoResponse = {
  success: boolean;
  message?: string;
  data: LandlordPaymentInfo | null;
};
