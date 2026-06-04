import { Schema, model, Document, Types } from "mongoose";

export enum BOOKING_STATUS {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface IBooking extends Document {
  roomId: Types.ObjectId;
  tenantId: Types.ObjectId;
  contractId?: Types.ObjectId;
  checkInDate: Date;
  checkOutDate?: Date;
  status: BOOKING_STATUS;
  totalPrice?: number;
  movedInAt?: Date;
  movedOutAt?: Date;
  isCurrent: boolean;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    movedInAt: {
      type: Date,
    },
    movedOutAt: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

// Compound index for room and tenant
BookingSchema.index({ roomId: 1, tenantId: 1 });

// Soft delete index
BookingSchema.index({ deletedAt: 1 });

export const BookingModel = model<IBooking>("Booking", BookingSchema);
