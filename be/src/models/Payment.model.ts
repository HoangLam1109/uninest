import { Schema, model, Document, Types, type JSONSerialized } from "mongoose";

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PAYMENT_METHOD {
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  WALLET = "WALLET",
  VNPAY = "VNPAY",
  MOMO = "MOMO",
  OTHER = "OTHER",
}

export enum PAYMENT_TYPE {
  RENT = "RENT",
  DEPOSIT = "DEPOSIT",
  UTILITY = "UTILITY",
  SERVICE_FEE = "SERVICE_FEE",
  REFUND = "REFUND",
}

export interface IPayment extends Document {
  bookingId?: Types.ObjectId;
  paperId: Types.ObjectId;
  receiverId: Types.ObjectId;
  walletTxId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: String;
  type: PAYMENT_TYPE;
  method?: PAYMENT_METHOD;
  status?: PAYMENT_STATUS;
  transactionRef?: String;
  gatewayResponse?: JSON;
  note?: String;
  paidAt: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: [true, "Paper ID is required"],
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
      index: true,
    },
    walletTxId: {
      type: Schema.Types.ObjectId,
      ref: "WalletTransaction",
      default: null,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(PAYMENT_TYPE),
      required: [true, "Payment type is required"],
      index: true,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.BANK_TRANSFER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    transactionRef: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    note: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  },
);

// Compound index for booking and billing month (prevent duplicate invoices)
PaymentSchema.index(
  { bookingId: 1, paperId: 1 },
  { unique: true, sparse: true },
);

// Indexes for filtering
PaymentSchema.index({ receiverId: 1, status: 1 });
PaymentSchema.index({ bookingId: 1, status: 1 });
PaymentSchema.index({ paidAt: 1 });

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);
