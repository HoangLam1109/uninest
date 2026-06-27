import { Schema, model, Document, Types } from "mongoose";

export enum DISBURSEMENT_STATE {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

export interface IDisbursement extends Document {
  paymentId: Types.ObjectId;
  landlordId: Types.ObjectId;
  amount: number;
  netAmount: number;
  payoutFee: number;
  referenceId: string;
  payoutId?: string;
  state: DISBURSEMENT_STATE;
  bankSnapshot: { bankBin: string; bankName: string; accountNumber: string; accountHolder: string };
  gatewayResponse?: Record<string, any>;
  retryCount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisbursementSchema = new Schema<IDisbursement>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    payoutFee: { type: Number, default: 0, min: 0 },
    referenceId: { type: String, required: true, unique: true, trim: true },
    payoutId: { type: String, trim: true },
    state: { type: String, enum: Object.values(DISBURSEMENT_STATE), default: DISBURSEMENT_STATE.PENDING, index: true },
    bankSnapshot: {
      bankBin: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountHolder: { type: String, required: true },
    },
    gatewayResponse: { type: Schema.Types.Mixed },
    retryCount: { type: Number, default: 0, min: 0 },
    note: { type: String, trim: true },
  },
  { timestamps: true, collection: "disbursements" },
);

DisbursementSchema.index({ landlordId: 1, state: 1 });

export const DisbursementModel = model<IDisbursement>("Disbursement", DisbursementSchema);
