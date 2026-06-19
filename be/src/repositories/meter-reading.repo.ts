import { MeterReadingModel, METER_TYPE, READING_SOURCE } from "../models/MeterReading.model.js";

export const MeterReadingRepository = {
  create: (data: {
    roomId?: string;
    contractId: string;
    recordedBy: string;
    meterType: METER_TYPE;
    readingValue: number;
    source: READING_SOURCE;
    billingMonth: string;
    readingDate?: Date;
    photoUrl?: string;
    notes?: string;
    invoiceId?: string;
  }) => MeterReadingModel.create(data),

  /**
   * Tạo nhiều MeterReading cùng lúc (dùng trong transaction).
   */
  createMany: (data: Array<{
    roomId?: string;
    contractId: string;
    recordedBy: string;
    meterType: METER_TYPE;
    readingValue: number;
    source: READING_SOURCE;
    billingMonth: string;
    readingDate?: Date;
    photoUrl?: string;
    notes?: string;
    invoiceId?: string;
  }>, options?: { session?: any }) =>
    MeterReadingModel.create(data, options),

  /**
   * Lấy chỉ số gần nhất TRƯỚC một billingMonth cho một contract + meterType.
   * Không lấy record đã xóa mềm.
   *
   * Trả về null nếu không tìm thấy.
   */
  findLatestByContractAndType: async (
    contractId: string,
    meterType: METER_TYPE,
    billingMonth: string
  ) => {
    const readings = await MeterReadingModel.find({
      contractId,
      meterType,
      billingMonth: { $lt: billingMonth },
      deletedAt: null,
    })
      .sort({ billingMonth: -1, readingDate: -1, createdAt: -1 })
      .limit(1)
      .lean();

    return readings.length ? readings[0] : null;
  },

  /**
   * Lấy chỉ số gần nhất TRƯỚC một billingMonth cho một room + meterType.
   */
  findLatestByRoomAndType: async (
    roomId: string,
    meterType: METER_TYPE,
    billingMonth: string
  ) => {
    const readings = await MeterReadingModel.find({
      roomId,
      meterType,
      billingMonth: { $lt: billingMonth },
      deletedAt: null,
    })
      .sort({ billingMonth: -1, readingDate: -1, createdAt: -1 })
      .limit(1)
      .lean();

    return readings.length ? readings[0] : null;
  },

  /**
   * Lấy INITIAL reading cho một contract (dùng làm fallback khi không có hóa đơn trước).
   */
  findInitialByContractAndType: async (
    contractId: string,
    meterType: METER_TYPE
  ) => {
    const readings = await MeterReadingModel.find({
      contractId,
      meterType,
      source: READING_SOURCE.INITIAL,
      deletedAt: null,
    })
      .sort({ readingDate: 1 })
      .limit(1)
      .lean();

    return readings.length ? readings[0] : null;
  },

  /**
   * Lấy reading gần nhất (bất kỳ source nào) cho contract + meterType,
   * không giới hạn billingMonth. Dùng để kiểm tra xem có reading nào tồn tại không.
   */
  findLatestByContractAndTypeAny: async (
    contractId: string,
    meterType: METER_TYPE
  ) => {
    const readings = await MeterReadingModel.find({
      contractId,
      meterType,
      deletedAt: null,
    })
      .sort({ billingMonth: -1, readingDate: -1, createdAt: -1 })
      .limit(1)
      .lean();

    return readings.length ? readings[0] : null;
  },

  findByInvoiceId: (invoiceId: string) =>
    MeterReadingModel.find({ invoiceId, deletedAt: null }).lean(),

  softDeleteByInvoiceId: (invoiceId: string) =>
    MeterReadingModel.updateMany(
      { invoiceId, deletedAt: null },
      { deletedAt: new Date() }
    ),

  findByContractId: (
    contractId: string,
    meterType?: METER_TYPE,
    skip?: number,
    limit?: number
  ) => {
    const filter: any = { contractId, deletedAt: null };
    if (meterType) filter.meterType = meterType;

    return MeterReadingModel.find(filter)
      .populate("recordedBy", "fullName email")
      .sort({ readingDate: -1 })
      .skip(skip || 0)
      .limit(limit || 50)
      .lean();
  },

  countByContractId: (contractId: string, meterType?: METER_TYPE) => {
    const filter: any = { contractId, deletedAt: null };
    if (meterType) filter.meterType = meterType;
    return MeterReadingModel.countDocuments(filter);
  },
};
