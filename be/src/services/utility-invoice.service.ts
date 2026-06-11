import mongoose from "mongoose";
import { InvoiceRepository, InvoiceDetailRepository } from "../repositories/invoice.repo.js";
import { MeterReadingRepository } from "../repositories/meter-reading.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { ContractRepository } from "../repositories/contract.repo.js";
import { InvoiceModel, INVOICE_STATUS } from "../models/Invoice.model.js";
import type { IInvoice } from "../models/Invoice.model.js";
import { InvoiceDetailModel } from "../models/InvoiceDetail.model.js";
import type { IInvoiceDetail } from "../models/InvoiceDetail.model.js";
import { MeterReadingModel, METER_TYPE, READING_SOURCE } from "../models/MeterReading.model.js";

// ============================================================
// Types
// ============================================================

export interface CreateUtilityInvoiceInput {
  bookingId: string;
  billingMonth: string; // YYYY-MM
  dueDate: Date;
  rentAmount: number;
  /** Chỉ số điện mới – landlord nhập từ công tơ */
  electricityNewIndex?: number;
  /** Chỉ số nước mới – landlord nhập từ công tơ */
  waterNewIndex?: number;
  /** Đơn giá điện (fallback: Room.electricityRate) */
  electricityRate?: number;
  /** Đơn giá nước (fallback: Room.waterRate) */
  waterRate?: number;
  additionalFees?: number;
  notes?: string;
}

export interface CreateUtilityInvoiceResult {
  invoice: IInvoice;
  detail: IInvoiceDetail;
}

interface ResolvedOldReading {
  electricityOldIndex: number;
  waterOldIndex: number;
  /** Nguồn xác định oldIndex để audit trail */
  source: "previous_invoice" | "meter_reading" | "renewal_chain";
  previousBillingMonth?: string;
}

// ============================================================
// Business Errors
// ============================================================

class UtilityInvoiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "UtilityInvoiceError";
  }
}

// ============================================================
// Service
// ============================================================

export const UtilityInvoiceService = {
  /**
   * Tạo hóa đơn điện nước tự động.
   *
   * Flow:
   * 1. Validate booking tồn tại + landlord sở hữu
   * 2. Kiểm tra trùng billingMonth
   * 3. Tìm contract hiện tại
   * 4. Xác định oldIndex:
   *    a. Từ InvoiceDetail của hóa đơn trước (previous invoice)
   *    b. Từ MeterReading gần nhất của contract (kể cả INITIAL)
   *    c. Từ MeterReading của contract cũ (renewal chain)
   *    d. Nếu không có gì → báo lỗi, yêu cầu tạo INITIAL MeterReading
   * 5. Validate newIndex >= oldIndex
   * 6. Tính usage và amount
   * 7. Transaction: tạo Invoice + InvoiceDetail + MONTHLY MeterReading
   */
  createUtilityInvoice: async (
    landlordId: string,
    input: CreateUtilityInvoiceInput
  ): Promise<CreateUtilityInvoiceResult> => {
    // ----- Step 1: Validate booking & ownership -----
    const booking = await BookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new UtilityInvoiceError("Booking not found", "BOOKING_NOT_FOUND", 404);
    }

    const room = booking.roomId as any;
    if (!room || room.landlordId?.toString() !== landlordId) {
      throw new UtilityInvoiceError("You do not own this booking", "FORBIDDEN", 403);
    }

    // ----- Step 2: Validate billing month uniqueness -----
    const existing = await InvoiceRepository.findByBookingAndMonth(
      input.bookingId,
      input.billingMonth
    );
    if (existing) {
      throw new UtilityInvoiceError(
        `Invoice for ${input.billingMonth} already exists`,
        "DUPLICATE_INVOICE",
        409
      );
    }

    // ----- Step 3: Find active contract -----
    let contractId: string | null =
      booking.contractId?.toString() ?? null;

    if (!contractId) {
      const activeContract =
        await ContractRepository.checkActiveContractByLandlordAndTenant(
          landlordId,
          booking.tenantId._id?.toString() || booking.tenantId.toString()
        );
      if (activeContract) {
        contractId = activeContract._id.toString();
      }
    }

    // ----- Step 4: Resolve rates -----
    const electricityRate =
      input.electricityRate ?? room.electricityRate ?? 0;
    const waterRate = input.waterRate ?? room.waterRate ?? 0;

    // ----- Step 5: Determine old indices -----
    const oldReading = await determineOldIndices(
      input.bookingId,
      contractId,
      input.billingMonth,
      room._id?.toString()
    );

    // ----- Step 6: Validate -----
    const hasElec =
      input.electricityNewIndex !== undefined &&
      input.electricityNewIndex !== null;
    const hasWater =
      input.waterNewIndex !== undefined &&
      input.waterNewIndex !== null;

    if (hasElec) {
      if (input.electricityNewIndex! < oldReading.electricityOldIndex) {
        throw new UtilityInvoiceError(
          `Electricity new index (${input.electricityNewIndex}) must be >= old index (${oldReading.electricityOldIndex})`,
          "INVALID_ELECTRICITY_INDEX"
        );
      }
      if (electricityRate <= 0) {
        throw new UtilityInvoiceError(
          "Electricity rate is required. Set it in Room settings or pass electricityRate.",
          "MISSING_ELECTRICITY_RATE"
        );
      }
    }

    if (hasWater) {
      if (input.waterNewIndex! < oldReading.waterOldIndex) {
        throw new UtilityInvoiceError(
          `Water new index (${input.waterNewIndex}) must be >= old index (${oldReading.waterOldIndex})`,
          "INVALID_WATER_INDEX"
        );
      }
      if (waterRate <= 0) {
        throw new UtilityInvoiceError(
          "Water rate is required. Set it in Room settings or pass waterRate.",
          "MISSING_WATER_RATE"
        );
      }
    }

    // ----- Step 7: Calculate -----
    const electricityUsage = hasElec
      ? input.electricityNewIndex! - oldReading.electricityOldIndex
      : 0;
    const waterUsage = hasWater
      ? input.waterNewIndex! - oldReading.waterOldIndex
      : 0;
    const electricityAmount = electricityUsage * electricityRate;
    const waterAmount = waterUsage * waterRate;
    const additionalFees = input.additionalFees || 0;
    const totalAmount =
      input.rentAmount + electricityAmount + waterAmount + additionalFees;

    // ----- Step 8: Transaction -----
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 8a. Create Invoice
      const invoicePayload: Record<string, any> = {
        bookingId: input.bookingId,
        landlordId,
        tenantId: booking.tenantId,
        billingMonth: input.billingMonth,
        dueDate: input.dueDate,
        rentAmount: input.rentAmount,
        electricityAmount,
        waterAmount,
        additionalFees,
        totalAmount,
        notes: input.notes,
        status: INVOICE_STATUS.DRAFT,
      };
      if (contractId) {
        invoicePayload.contractId = contractId;
      }

      const [invoice] = await InvoiceModel.create([invoicePayload], { session }) as unknown as [IInvoice];

      // 8b. Create InvoiceDetail
      const detailPayload: Record<string, any> = {
        invoiceId: invoice._id,
        electricityOldIndex: oldReading.electricityOldIndex,
        electricityUsage,
        electricityRate,
        electricityAmount,
        waterOldIndex: oldReading.waterOldIndex,
        waterUsage,
        waterRate,
        waterAmount,
        otherDetails: {
          oldIndexSource: oldReading.source,
          previousBillingMonth: oldReading.previousBillingMonth,
          contractId,
        },
      };
      if (input.electricityNewIndex != null) {
        detailPayload.electricityNewIndex = input.electricityNewIndex;
      }
      if (input.waterNewIndex != null) {
        detailPayload.waterNewIndex = input.waterNewIndex;
      }

      const [detail] = await InvoiceDetailModel.create([detailPayload], { session }) as unknown as [IInvoiceDetail];

      // 8c. Create MONTHLY MeterReading records (single source of truth)
      const meterReadingsToCreate: any[] = [];

      if (hasElec) {
        meterReadingsToCreate.push({
          roomId: room._id,
          contractId: contractId!,
          recordedBy: landlordId,
          meterType: METER_TYPE.ELECTRICITY,
          readingValue: input.electricityNewIndex!,
          source: READING_SOURCE.MONTHLY,
          billingMonth: input.billingMonth,
          readingDate: new Date(),
          invoiceId: invoice._id,
        });
      }

      if (hasWater) {
        meterReadingsToCreate.push({
          roomId: room._id,
          contractId: contractId!,
          recordedBy: landlordId,
          meterType: METER_TYPE.WATER,
          readingValue: input.waterNewIndex!,
          source: READING_SOURCE.MONTHLY,
          billingMonth: input.billingMonth,
          readingDate: new Date(),
          invoiceId: invoice._id,
        });
      }

      if (meterReadingsToCreate.length > 0) {
        await MeterReadingModel.create(meterReadingsToCreate, { session });
      }

      await session.commitTransaction();

      return { invoice, detail };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Tạo INITIAL MeterReading khi tenant mới nhận phòng.
   * Landlord phải gọi API này trước khi tạo hóa đơn đầu tiên.
   */
  createInitialReading: async (
    landlordId: string,
    input: {
      contractId: string;
      roomId?: string;
      electricityReading?: number;
      waterReading?: number;
      photoUrls?: { electricity?: string; water?: string };
      notes?: string;
    }
  ) => {
    const contract = await ContractRepository.findById(input.contractId);
    if (!contract) {
      throw new UtilityInvoiceError("Contract not found", "CONTRACT_NOT_FOUND", 404);
    }

    if ((contract.landlordId as any)._id?.toString() !== landlordId &&
        (contract.landlordId as any).toString() !== landlordId) {
      throw new UtilityInvoiceError("You do not own this contract", "FORBIDDEN", 403);
    }

    const readings: any[] = [];

    if (input.electricityReading !== undefined && input.electricityReading !== null) {
      readings.push({
        roomId: input.roomId || undefined,
        contractId: input.contractId,
        recordedBy: landlordId,
        meterType: METER_TYPE.ELECTRICITY,
        readingValue: input.electricityReading,
        source: READING_SOURCE.INITIAL,
        billingMonth: new Date().toISOString().slice(0, 7), // current YYYY-MM
        readingDate: new Date(),
        photoUrl: input.photoUrls?.electricity,
        notes: input.notes,
      });
    }

    if (input.waterReading !== undefined && input.waterReading !== null) {
      readings.push({
        roomId: input.roomId || undefined,
        contractId: input.contractId,
        recordedBy: landlordId,
        meterType: METER_TYPE.WATER,
        readingValue: input.waterReading,
        source: READING_SOURCE.INITIAL,
        billingMonth: new Date().toISOString().slice(0, 7),
        readingDate: new Date(),
        photoUrl: input.photoUrls?.water,
        notes: input.notes,
      });
    }

    if (readings.length === 0) {
      throw new UtilityInvoiceError(
        "At least one reading (electricity or water) is required",
        "MISSING_READING"
      );
    }

    const created = await MeterReadingModel.create(readings);
    return created;
  },
};

// ============================================================
// Private: determine old indices
// ============================================================

/**
 * Xác định chỉ số cũ cho điện và nước.
 *
 * Priority:
 * 1. InvoiceDetail của hóa đơn gần nhất TRƯỚC billingMonth
 * 2. MeterReading gần nhất (bất kỳ source) của contract TRƯỚC billingMonth
 * 3. Nếu contract là renewal → MeterReading gần nhất của contract cũ
 * 4. Nếu không có gì → throw error (yêu cầu tạo INITIAL MeterReading)
 */
async function determineOldIndices(
  bookingId: string,
  contractId: string | null,
  billingMonth: string,
  roomId?: string
): Promise<ResolvedOldReading> {
  // ---- Priority 1: Previous invoice via contractId ----
  if (contractId) {
    const prevInv = await InvoiceRepository.findPreviousInvoiceByContractId(
      contractId,
      billingMonth
    );
    if (prevInv?.detail && prevInv.invoice) {
      return {
        electricityOldIndex: prevInv.detail.electricityNewIndex ?? 0,
        waterOldIndex: prevInv.detail.waterNewIndex ?? 0,
        source: "previous_invoice" as const,
        previousBillingMonth: prevInv.invoice.billingMonth,
      };
    }
  }

  // ---- Priority 2: Previous invoice via bookingId ----
  const prevInvByBooking =
    await InvoiceRepository.findPreviousInvoiceByBookingId(
      bookingId,
      billingMonth
    );
  if (prevInvByBooking?.detail && prevInvByBooking.invoice) {
    return {
      electricityOldIndex: prevInvByBooking.detail.electricityNewIndex ?? 0,
      waterOldIndex: prevInvByBooking.detail.waterNewIndex ?? 0,
      source: "previous_invoice" as const,
      previousBillingMonth: prevInvByBooking.invoice.billingMonth,
    };
  }

  // ---- Priority 3: MeterReading (single source of truth) ----
  if (contractId) {
    const elecReading =
      await MeterReadingRepository.findLatestByContractAndType(
        contractId,
        METER_TYPE.ELECTRICITY,
        billingMonth
      );
    const waterReading =
      await MeterReadingRepository.findLatestByContractAndType(
        contractId,
        METER_TYPE.WATER,
        billingMonth
      );

    if (elecReading || waterReading) {
      const prevMonth =
        elecReading?.billingMonth || waterReading?.billingMonth;
      const result: ResolvedOldReading = {
        electricityOldIndex: elecReading?.readingValue ?? 0,
        waterOldIndex: waterReading?.readingValue ?? 0,
        source: "meter_reading",
      };
      if (prevMonth) {
        result.previousBillingMonth = prevMonth;
      }
      return result;
    }

    // ---- Priority 4: Renewal chain ----
    const contract = await ContractRepository.findById(contractId);
    if (contract?.renewalFromId) {
      const prevContractId = contract.renewalFromId.toString();

      // Try MeterReading from previous contract
      const prevElec =
        await MeterReadingRepository.findLatestByContractAndTypeAny(
          prevContractId,
          METER_TYPE.ELECTRICITY
        );
      const prevWater =
        await MeterReadingRepository.findLatestByContractAndTypeAny(
          prevContractId,
          METER_TYPE.WATER
        );

      if (prevElec || prevWater) {
        const prevMonth =
          prevElec?.billingMonth || prevWater?.billingMonth;
        const result: ResolvedOldReading = {
          electricityOldIndex: prevElec?.readingValue ?? 0,
          waterOldIndex: prevWater?.readingValue ?? 0,
          source: "renewal_chain",
        };
        if (prevMonth) {
          result.previousBillingMonth = prevMonth;
        }
        return result;
      }

      // Try invoice from previous contract
      const prevInvRenewal =
        await InvoiceRepository.findPreviousInvoiceByContractId(
          prevContractId,
          billingMonth
        );
      if (prevInvRenewal?.detail && prevInvRenewal.invoice) {
        return {
          electricityOldIndex:
            prevInvRenewal.detail.electricityNewIndex ?? 0,
          waterOldIndex: prevInvRenewal.detail.waterNewIndex ?? 0,
          source: "renewal_chain" as const,
          previousBillingMonth: prevInvRenewal.invoice.billingMonth,
        };
      }
    }
  }

  // ---- Fallback: Also try by roomId ----
  if (roomId) {
    const elecReading = await MeterReadingRepository.findLatestByRoomAndType(
      roomId,
      METER_TYPE.ELECTRICITY,
      billingMonth
    );
    const waterReading = await MeterReadingRepository.findLatestByRoomAndType(
      roomId,
      METER_TYPE.WATER,
      billingMonth
    );

    if (elecReading || waterReading) {
      const prevMonth =
        elecReading?.billingMonth || waterReading?.billingMonth;
      const result: ResolvedOldReading = {
        electricityOldIndex: elecReading?.readingValue ?? 0,
        waterOldIndex: waterReading?.readingValue ?? 0,
        source: "meter_reading",
      };
      if (prevMonth) {
        result.previousBillingMonth = prevMonth;
      }
      return result;
    }
  }

  // ---- No source found ----
  throw new UtilityInvoiceError(
    "Cannot determine meter start index. " +
      "This is the first invoice — please create an INITIAL meter reading first " +
      "(call POST /api/meter-readings/initial with electricityReading and waterReading).",
    "MISSING_INITIAL_READING"
  );
}

