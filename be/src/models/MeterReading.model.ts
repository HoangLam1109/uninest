import { Schema, model, Document, Types } from "mongoose";

/**
 * MeterReading – Bảng lưu lịch sử chỉ số công tơ điện, nước.
 *
 * Mỗi lần landlord ghi chỉ số mới sẽ tạo một record ở đây.
 * Đây là single source of truth cho việc tính toán tiện ích.
 *
 * Ưu điểm so với lưu trong Contract:
 * - Track được toàn bộ lịch sử ghi chỉ số theo thời gian
 * - Dễ audit khi có tranh chấp
 * - Gia hạn hợp đồng không cần nhập lại startIndex
 * - Tách biệt concern rõ ràng
 */

export enum METER_TYPE {
  ELECTRICITY = "ELECTRICITY",
  WATER = "WATER",
}

export enum READING_SOURCE {
  /** Landlord nhập thủ công khi tenant mới vào */
  INITIAL = "INITIAL",
  /** Landlord nhập hàng tháng khi chốt hóa đơn */
  MONTHLY = "MONTHLY",
  /** Tenant tự ghi (nếu hệ thống cho phép) */
  TENANT_SELF = "TENANT_SELF",
  /** Nhập từ ảnh chụp công tơ */
  PHOTO = "PHOTO",
}

export interface IMeterReading extends Document {
  /** Phòng được ghi chỉ số (có thể null nếu dùng contractId) */
  roomId?: Types.ObjectId;
  /** Hợp đồng đang active tại thời điểm ghi */
  contractId: Types.ObjectId;
  /** Người ghi (landlord hoặc tenant) */
  recordedBy: Types.ObjectId;
  /** Loại công tơ: điện hoặc nước */
  meterType: METER_TYPE;
  /** Chỉ số ghi được */
  readingValue: number;
  /** Nguồn gốc chỉ số */
  source: READING_SOURCE;
  /** Tháng liên quan (YYYY-MM), để mapping với Invoice */
  billingMonth: string;
  /** Ngày ghi thực tế */
  readingDate: Date;
  /** Ảnh chụp công tơ (nếu có) */
  photoUrl?: string;
  /** Ghi chú */
  notes?: string;
  /** Invoice ID được tạo từ reading này (nếu đã tạo) */
  invoiceId?: Types.ObjectId;
  /** Soft delete */
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeterReadingSchema = new Schema<IMeterReading>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      index: true,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: [true, "Contract ID is required"],
      index: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recorded by is required"],
    },
    meterType: {
      type: String,
      enum: Object.values(METER_TYPE),
      required: [true, "Meter type is required"],
    },
    readingValue: {
      type: Number,
      required: [true, "Reading value is required"],
      min: 0,
    },
    source: {
      type: String,
      enum: Object.values(READING_SOURCE),
      default: READING_SOURCE.MONTHLY,
    },
    billingMonth: {
      type: String,
      required: [true, "Billing month is required"],
      match: [/^\d{4}-\d{2}$/, "Billing month must be in YYYY-MM format"],
    },
    readingDate: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "meter_readings",
  }
);

// Compound indexes
MeterReadingSchema.index({ contractId: 1, meterType: 1, billingMonth: 1 });
MeterReadingSchema.index({ roomId: 1, meterType: 1, billingMonth: 1 });
MeterReadingSchema.index({ deletedAt: 1 });

export const MeterReadingModel = model<IMeterReading>(
  "MeterReading",
  MeterReadingSchema
);
