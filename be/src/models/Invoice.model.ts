import { Schema, model, Document, Types } from "mongoose";

export enum INVOICE_STATUS {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

/** Payment status for manual bank transfer flow */
export enum INVOICE_PAYMENT_STATUS {
  UNPAID = "unpaid",
  PENDING_CONFIRMATION = "pending_confirmation",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export interface IInvoice extends Document {
  bookingId: Types.ObjectId;
  /** Reference to the active contract at the time of billing */
  contractId?: Types.ObjectId;
  landlordId: Types.ObjectId;
  tenantId: Types.ObjectId;
  /** Reference to landlord's verified bank account (snapshot at creation time) */
  bankAccountId?: Types.ObjectId;
  billingMonth: string; // YYYY-MM format
  dueDate: Date;
  rentAmount: number;
  electricityAmount?: number;
  waterAmount?: number;
  additionalFees?: number;
  /** Phí giải ngân tự động (PayOS Payout) - landlord chịu (DEPRECATED: không dùng PayOS nữa) */
  payoutFee?: number;
  totalAmount: number;
  status: INVOICE_STATUS;
  notes?: string;
  sentAt?: Date;
  paidAt?: Date;
  deletedAt?: Date;

  // === Manual Bank Transfer Payment Fields ===
  /** Snapshot of landlord's bank info at invoice creation time */
  paymentBankName?: string;
  paymentAccountNumber?: string;
  paymentAccountHolder?: string;
  paymentQrUrl?: string;
  paymentNote?: string;
  paymentMethodType?: string; // "manual_bank_transfer"
  /** Payment tracking for manual flow */
  paymentStatus?: INVOICE_PAYMENT_STATUS;
  /** Who marked as paid (landlordId) */
  markedPaidBy?: Types.ObjectId;
  /** Internal note from landlord when confirming payment */
  landlordPaymentNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID is required"],
      index: true,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      default: null,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Landlord ID is required"],
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
    },
    billingMonth: {
      type: String,
      required: [true, "Billing month is required"], // YYYY-MM
      match: [/^\d{4}-\d{2}$/, "Billing month must be in YYYY-MM format"],
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    rentAmount: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: 0,
    },
    electricityAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    waterAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalFees: {
      type: Number,
      default: 0,
      min: 0,
    },
    payoutFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.DRAFT,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // === Manual Bank Transfer Payment Fields ===
    paymentBankName: {
      type: String,
      trim: true,
      default: "",
    },
    paymentAccountNumber: {
      type: String,
      trim: true,
      default: "",
    },
    paymentAccountHolder: {
      type: String,
      trim: true,
      default: "",
    },
    paymentQrUrl: {
      type: String,
      trim: true,
      default: "",
    },
    paymentNote: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethodType: {
      type: String,
      trim: true,
      default: "manual_bank_transfer",
    },
    paymentStatus: {
      type: String,
      enum: Object.values(INVOICE_PAYMENT_STATUS),
      default: INVOICE_PAYMENT_STATUS.UNPAID,
      index: true,
    },
    markedPaidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    landlordPaymentNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "invoices",
  }
);

// Compound index for booking and billing month (prevent duplicate invoices)
InvoiceSchema.index({ bookingId: 1, billingMonth: 1 }, { unique: true, sparse: true });

// Indexes for filtering
InvoiceSchema.index({ landlordId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ deletedAt: 1 });

export const InvoiceModel = model<IInvoice>("Invoice", InvoiceSchema);
