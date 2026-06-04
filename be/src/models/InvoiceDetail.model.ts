import { Schema, model, Document, Types } from "mongoose";

export interface IInvoiceDetail extends Document {
  invoiceId: Types.ObjectId;
  electricityOldIndex?: number;
  electricityNewIndex?: number;
  electricityUsage?: number;
  electricityRate?: number;
  electricityAmount?: number;
  waterOldIndex?: number;
  waterNewIndex?: number;
  waterUsage?: number;
  waterRate?: number;
  waterAmount?: number;
  otherDetails?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceDetailSchema = new Schema<IInvoiceDetail>(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: [true, "Invoice ID is required"],
      unique: true,
      index: true,
    },
    electricityOldIndex: {
      type: Number,
      min: 0,
    },
    electricityNewIndex: {
      type: Number,
      min: 0,
    },
    electricityUsage: {
      type: Number,
      min: 0,
    },
    electricityRate: {
      type: Number,
      min: 0,
    },
    electricityAmount: {
      type: Number,
      min: 0,
    },
    waterOldIndex: {
      type: Number,
      min: 0,
    },
    waterNewIndex: {
      type: Number,
      min: 0,
    },
    waterUsage: {
      type: Number,
      min: 0,
    },
    waterRate: {
      type: Number,
      min: 0,
    },
    waterAmount: {
      type: Number,
      min: 0,
    },
    otherDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "invoice_details",
  }
);

export const InvoiceDetailModel = model<IInvoiceDetail>("InvoiceDetail", InvoiceDetailSchema);
