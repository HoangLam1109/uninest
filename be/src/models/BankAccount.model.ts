import { Schema, model, Document, Types } from "mongoose";

export enum BANK_ACCOUNT_STATUS {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface IBankAccount extends Document {
  userId: Types.ObjectId;
  /** PayOS Client ID — landlord registers at payos.vn */
  payosClientId: string;
  /** PayOS API Key */
  payosApiKey: string;
  /** PayOS Checksum Key */
  payosChecksumKey: string;
  status: BANK_ACCOUNT_STATUS;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    payosClientId: {
      type: String,
      required: [true, "PayOS Client ID is required"],
      trim: true,
    },
    payosApiKey: {
      type: String,
      required: [true, "PayOS API Key is required"],
      trim: true,
    },
    payosChecksumKey: {
      type: String,
      required: [true, "PayOS Checksum Key is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(BANK_ACCOUNT_STATUS),
      default: BANK_ACCOUNT_STATUS.PENDING_VERIFICATION,
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "bank_accounts",
  }
);

BankAccountSchema.index({ userId: 1, status: 1 });
BankAccountSchema.index({ deletedAt: 1 });

export const BankAccountModel = model<IBankAccount>("BankAccount", BankAccountSchema);
