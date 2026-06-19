import { Schema, model, Document, Types } from "mongoose";

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PAYMENT_METHOD {
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  PAYOS = "PAYOS",
}

export enum PAYMENT_TYPE {
  RENT = "RENT",
  DEPOSIT = "DEPOSIT",
  UTILITY = "UTILITY",
  SERVICE_FEE = "SERVICE_FEE",
  TENANT_PACKAGE = "TENANT_PACKAGE",
  LANDLORD_PACKAGE = "LANDLORD_PACKAGE",
  REFUND = "REFUND",
}

export interface IPayment extends Document {
  bookingId?: Types.ObjectId;
  payerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: String;
  type: PAYMENT_TYPE;
  method?: PAYMENT_METHOD;
  status?: PAYMENT_STATUS;
  transactionRef?: String;
  gatewayResponse?: Record<string, any>;
  note?: String;
  paidAt?: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Payer ID is required"],
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
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
  }
);

PaymentSchema.index(
  { bookingId: 1, payerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingId: { $type: "objectId" },
    },
  },
);
PaymentSchema.index({ receiverId: 1, status: 1 });
PaymentSchema.index({ bookingId: 1, status: 1 });
PaymentSchema.index({ paidAt: 1 });

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);
