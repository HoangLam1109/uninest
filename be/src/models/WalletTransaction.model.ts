import { Schema, model, Document, Types } from "mongoose";

export enum WALLET_TX_TYPE {
  TOPUP = "TOPUP",
  WITHDRAW = "WITHDRAW",
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
  TRANSFER = "TRANSFER",
}

export interface IWalletTransaction extends Document {
  walletId: Types.ObjectId;
  relatedPaymentId?: Types.ObjectId;
  amount: number;
  balanceAfter: number;
  type: WALLET_TX_TYPE;
  description?: string;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: [true, "Wallet ID is required"],
      index: true,
    },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after is required"],
    },
    type: {
      type: String,
      enum: Object.values(WALLET_TX_TYPE),
      required: [true, "Transaction type is required"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "wallet_transactions",
  }
);

// Indexes for filtering
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ walletId: 1, type: 1 });

export const WalletTransactionModel = model<IWalletTransaction>(
  "WalletTransaction",
  WalletTransactionSchema
);