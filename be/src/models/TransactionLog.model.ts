import { Schema, model, Document, Types } from "mongoose";

export enum TX_DIRECTION {
  IN = "IN",   // thu tiền (payment)
  OUT = "OUT", // chi tiền (disbursement/payout)
}

export enum TX_STATUS {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  MANUAL_RESOLVED = "MANUAL_RESOLVED", // admin đã xử lý thủ công
  PENDING = "PENDING",
}

export enum TX_CATEGORY {
  PACKAGE_UPGRADE = "PACKAGE_UPGRADE",     // thu tiền gói nâng cấp (SERVICE_FEE, TENANT_PACKAGE, LANDLORD_PACKAGE)
  INVOICE_RENT = "INVOICE_RENT",           // thu tiền thuê + tiện ích từ tenant
  INVOICE_DISBURSEMENT = "INVOICE_DISBURSEMENT", // chi tiền giải ngân cho landlord
  DEPOSIT = "DEPOSIT",                     // thu tiền đặt cọc
  OTHER = "OTHER",
}

export interface ITransactionLog extends Document {
  direction: TX_DIRECTION;
  category: TX_CATEGORY;
  paymentId?: Types.ObjectId;
  disbursementId?: Types.ObjectId;
  referenceId: string; // PayOS orderCode hoặc payout referenceId
  amount: number;
  netAmount?: number; // số tiền thực nhận (sau khi trừ phí) - chỉ cho OUT
  fee?: number;       // phí giao dịch - chỉ cho OUT
  status: TX_STATUS;
  fromUserId?: Types.ObjectId;   // người gửi tiền (tenant)
  toUserId?: Types.ObjectId;     // người nhận tiền (landlord)
  fromName?: string;
  toName?: string;
  fromBankInfo?: Record<string, any>;
  toBankInfo?: Record<string, any>;
  gatewayResponse?: Record<string, any>; // raw response từ PayOS
  resolvedBy?: Types.ObjectId;  // admin nào đã xử lý thủ công
  resolvedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionLogSchema = new Schema<ITransactionLog>(
  {
    direction: {
      type: String,
      enum: Object.values(TX_DIRECTION),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(TX_CATEGORY),
      required: true,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    disbursementId: {
      type: Schema.Types.ObjectId,
      ref: "Disbursement",
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    netAmount: { type: Number },
    fee: { type: Number },
    status: {
      type: String,
      enum: Object.values(TX_STATUS),
      required: true,
      index: true,
    },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    fromName: { type: String },
    toName: { type: String },
    fromBankInfo: { type: Schema.Types.Mixed },
    toBankInfo: { type: Schema.Types.Mixed },
    gatewayResponse: { type: Schema.Types.Mixed },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    note: { type: String, trim: true },
  },
  { timestamps: true, collection: "transaction_logs" }
);

TransactionLogSchema.index({ direction: 1, status: 1 });
TransactionLogSchema.index({ category: 1, status: 1 });
TransactionLogSchema.index({ createdAt: -1 });
TransactionLogSchema.index({ resolvedBy: 1 });
TransactionLogSchema.index(
  { paymentId: 1, direction: 1 },
  { sparse: true }
);
TransactionLogSchema.index(
  { disbursementId: 1, direction: 1 },
  { sparse: true }
);

export const TransactionLogModel = model<ITransactionLog>(
  "TransactionLog",
  TransactionLogSchema
);
