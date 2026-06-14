import { Schema, model, Document, Types } from "mongoose";

export enum WALLET_STATUS {
  ACTIVE = "ACTIVE",
  FROZEN = "FROZEN",
  CLOSED = "CLOSED",
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  status: WALLET_STATUS;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(WALLET_STATUS),
      default: WALLET_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "wallets",
  }
);

export const WalletModel = model<IWallet>("Wallet", WalletSchema);