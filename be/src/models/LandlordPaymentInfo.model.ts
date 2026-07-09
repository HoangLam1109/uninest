import { Schema, model, Document, Types } from "mongoose";

export enum PAYMENT_INFO_STATUS {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * LandlordPaymentInfo — Banking info that the landlord enters manually
 * so that tenants can see it on the invoice and transfer money externally.
 * Must be APPROVED by admin before landlord can create invoices.
 */
export interface ILandlordPaymentInfo extends Document {
  userId: Types.ObjectId;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  paymentQrUrl?: string;
  paymentNoteTemplate?: string;
  isPaymentInfoCompleted: boolean;
  status: PAYMENT_INFO_STATUS;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LandlordPaymentInfoSchema = new Schema<ILandlordPaymentInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    bankName: {
      type: String,
      required: [true, "Tên ngân hàng là bắt buộc"],
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      required: [true, "Số tài khoản là bắt buộc"],
      trim: true,
    },
    bankAccountHolder: {
      type: String,
      required: [true, "Tên chủ tài khoản là bắt buộc"],
      trim: true,
    },
    paymentQrUrl: {
      type: String,
      trim: true,
      default: "",
    },
    paymentNoteTemplate: {
      type: String,
      trim: true,
      default: "THANHTOAN {invoiceCode}",
    },
    isPaymentInfoCompleted: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_INFO_STATUS),
      default: PAYMENT_INFO_STATUS.PENDING,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "landlord_payment_infos",
  }
);

export const LandlordPaymentInfoModel = model<ILandlordPaymentInfo>(
  "LandlordPaymentInfo",
  LandlordPaymentInfoSchema
);
