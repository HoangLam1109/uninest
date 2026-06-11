import { Schema, model, Document, Types } from "mongoose";

export enum IDENTITY_STATUS {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface ICoTenant {
  fullName: string;
  dateOfBirth?: Date;
  phone?: string;
  cccdNumber?: string;
}

export interface IIdentity extends Document {
  userId: Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  phone: string;
  cccdNumber: string;
  cccdFrontImage: string;
  cccdBackImage: string;
  coTenants: ICoTenant[];
  status: IDENTITY_STATUS;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoTenantSchema = new Schema<ICoTenant>(
  {
    fullName: {
      type: String,
      required: [true, "Co-tenant full name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    cccdNumber: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const IdentitySchema = new Schema<IIdentity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    cccdNumber: {
      type: String,
      required: [true, "CCCD/CMND number is required"],
      trim: true,
      unique: true,
    },
    cccdFrontImage: {
      type: String,
      required: [true, "CCCD front image is required"],
    },
    cccdBackImage: {
      type: String,
      required: [true, "CCCD back image is required"],
    },
    coTenants: {
      type: [CoTenantSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(IDENTITY_STATUS),
      default: IDENTITY_STATUS.PENDING_VERIFICATION,
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
    collection: "identities",
  }
);

// Indexes
IdentitySchema.index({ userId: 1, status: 1 });
IdentitySchema.index({ deletedAt: 1 });

export const IdentityModel = model<IIdentity>("Identity", IdentitySchema);
