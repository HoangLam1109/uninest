import { Schema, model, Document, Types } from "mongoose";

export enum CONTRACT_STATUS {
  DRAFT = "DRAFT",
  PENDING_TENANT_SIGNATURE = "PENDING_TENANT_SIGNATURE",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

export interface IContract extends Document {
  bookingId: Types.ObjectId;
  landlordId: Types.ObjectId;
  tenantId: Types.ObjectId;
  renewalFromId?: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  monthlyRent: number;
  depositAmount?: number;
  terms?: string;
  contractFileUrl?: string;
  contractFileStorageKey?: string;
  signedContractFileUrl?: string;
  signedContractStorageKey?: string;
  tenantSignatureDataUrl?: string;
  tenantConfirmedAt?: Date;
  status: CONTRACT_STATUS;
  signedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID is required"],
      unique: true,
      sparse: true,
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
    renewalFromId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: 0,
    },
    depositAmount: {
      type: Number,
      min: 0,
    },
    terms: {
      type: String,
      trim: true,
    },
    contractFileUrl: {
      type: String,
      trim: true,
    },
    contractFileStorageKey: {
      type: String,
      trim: true,
    },
    signedContractFileUrl: {
      type: String,
      trim: true,
    },
    signedContractStorageKey: {
      type: String,
      trim: true,
    },
    tenantSignatureDataUrl: {
      type: String,
    },
    tenantConfirmedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      default: CONTRACT_STATUS.DRAFT,
      index: true,
    },
    signedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "contracts",
  }
);

// Compound index for landlord and tenant
ContractSchema.index({ landlordId: 1, tenantId: 1 });

// Soft delete index
ContractSchema.index({ deletedAt: 1 });

export const ContractModel = model<IContract>("Contract", ContractSchema);
