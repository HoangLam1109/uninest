import type { Request, Response } from "express";
import mongoose from "mongoose";
import { InvoiceService } from "../services/invoice.service.js";
import { UtilityInvoiceService } from "../services/utility-invoice.service.js";
import { InvoiceRepository } from "../repositories/invoice.repo.js";
import { METER_TYPE } from "../models/MeterReading.model.js";

/**
 * CREATE INVOICE (Landlord)
 */
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      bookingId,
      billingMonth,
      dueDate,
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      detailData,
    } = req.body;

    if (!bookingId || !billingMonth || !dueDate || !rentAmount) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, billing month, due date, and rent amount are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    // Validate billingMonth format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
      return res.status(400).json({
        success: false,
        message: "Billing month must be in YYYY-MM format",
      });
    }

    const invoice = await InvoiceService.createInvoice(bookingId, landlordId, {
      billingMonth,
      dueDate: new Date(dueDate),
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      detailData,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET INVOICE BY ID
 */
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    let { id: invoiceId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.getInvoiceById(invoiceId, userId);

    return res.json({ success: true, data: invoice });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET LANDLORD INVOICES
 */
export const getLandlordInvoices = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { invoices, total } = await InvoiceService.getInvoicesByLandlord(
      landlordId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET TENANT INVOICES
 */
export const getTenantInvoices = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { invoices, total } = await InvoiceService.getInvoicesByTenant(
      tenantId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE INVOICE (Landlord - DRAFT only)
 */
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const {
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      dueDate,
    } = req.body;

    const updateData: {
      rentAmount?: any;
      electricityAmount?: any;
      waterAmount?: any;
      additionalFees?: any;
      notes?: any;
      dueDate?: Date;
    } = {
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
    };
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const invoice = await InvoiceService.updateInvoice(invoiceId, landlordId, updateData);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * SEND INVOICE (Landlord - DRAFT to SENT)
 */
export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.sendInvoice(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice sent successfully",
      data: invoice,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * MARK INVOICE AS PAID (Landlord)
 */
export const markInvoiceAsPaid = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.markAsPaid(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice marked as paid",
      data: invoice,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * DELETE INVOICE (Landlord - DRAFT only)
 */
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.deleteInvoice(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET INVOICE DETAIL
 */
export const getInvoiceDetail = async (req: Request, res: Response) => {
  try {
    let { id: invoiceId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    // Verify access to invoice
    await InvoiceService.getInvoiceById(invoiceId, userId);

    const detail = await InvoiceService.getInvoiceDetail(invoiceId);

    return res.json({
      success: true,
      data: detail,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * UPDATE INVOICE DETAIL (Landlord)
 */
export const updateInvoiceDetail = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    // Verify landlord owns invoice
    const invoice = await InvoiceService.getInvoiceById(invoiceId, landlordId);

    const detail = await InvoiceService.updateInvoiceDetail(invoiceId, req.body);

    return res.json({
      success: true,
      message: "Invoice detail updated successfully",
      data: detail,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * CREATE UTILITY INVOICE (Landlord) — Tự động tính điện, nước
 *
 * Body:
 * {
 *   bookingId: string,
 *   billingMonth: "YYYY-MM",
 *   dueDate: ISO string,
 *   rentAmount: number,
 *   electricityNewIndex?: number,
 *   waterNewIndex?: number,
 *   electricityRate?: number,   // optional, lấy từ Room nếu ko truyền
 *   waterRate?: number,          // optional, lấy từ Room nếu ko truyền
 *   additionalFees?: number,
 *   notes?: string
 * }
 */
export const createUtilityInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      bookingId,
      billingMonth,
      dueDate,
      rentAmount,
      electricityNewIndex,
      waterNewIndex,
      electricityRate,
      waterRate,
      additionalFees,
      notes,
    } = req.body;

    if (!bookingId || !billingMonth || !dueDate || rentAmount == null) {
      return res.status(400).json({
        success: false,
        message:
          "bookingId, billingMonth, dueDate, and rentAmount are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid bookingId" });
    }

    if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
      return res.status(400).json({
        success: false,
        message: "billingMonth must be in YYYY-MM format",
      });
    }

    const input: Parameters<typeof UtilityInvoiceService.createUtilityInvoice>[1] = {
      bookingId,
      billingMonth,
      dueDate: new Date(dueDate),
      rentAmount: Number(rentAmount),
    };
    if (electricityNewIndex != null) input.electricityNewIndex = Number(electricityNewIndex);
    if (waterNewIndex != null) input.waterNewIndex = Number(waterNewIndex);
    if (req.body.electricityOldIndex != null) input.electricityOldIndex = Number(req.body.electricityOldIndex);
    if (req.body.waterOldIndex != null) input.waterOldIndex = Number(req.body.waterOldIndex);
    if (electricityRate != null) input.electricityRate = Number(electricityRate);
    if (waterRate != null) input.waterRate = Number(waterRate);
    if (additionalFees != null) input.additionalFees = Number(additionalFees);
    if (notes != null) input.notes = notes;

    const result = await UtilityInvoiceService.createUtilityInvoice(landlordId, input);

    return res.status(201).json({
      success: true,
      message: "Utility invoice created successfully",
      data: {
        invoice: result.invoice,
        detail: result.detail,
      },
    });
  } catch (err: any) {
    if (err.name === "UtilityInvoiceError") {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message,
        code: err.code,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * CREATE INITIAL METER READING (Landlord)
 * Gọi khi tenant mới nhận phòng, trước khi tạo hóa đơn đầu tiên.
 *
 * Body:
 * {
 *   contractId: string,
 *   roomId?: string,
 *   electricityReading?: number,
 *   waterReading?: number,
 *   photoUrls?: { electricity?: string, water?: string },
 *   notes?: string
 * }
 */
export const createInitialMeterReading = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { contractId, roomId, electricityReading, waterReading, photoUrls, notes } = req.body;

    if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ success: false, message: "Valid contractId is required" });
    }

    const readingInput: Parameters<typeof UtilityInvoiceService.createInitialReading>[1] = {
      contractId,
    };
    if (roomId) readingInput.roomId = roomId;
    if (electricityReading != null) readingInput.electricityReading = Number(electricityReading);
    if (waterReading != null) readingInput.waterReading = Number(waterReading);
    if (photoUrls) readingInput.photoUrls = photoUrls;
    if (notes != null) readingInput.notes = notes;

    const readings = await UtilityInvoiceService.createInitialReading(landlordId, readingInput);

    return res.status(201).json({
      success: true,
      message: "Initial meter reading created successfully",
      data: readings,
    });
  } catch (err: any) {
    if (err.name === "UtilityInvoiceError") {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message,
        code: err.code,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET PREVIOUS READING FOR BOOKING
 * Trả về chỉ số điện/nước mới nhất từ hóa đơn trước đó của booking.
 * Dùng để frontend quyết định có hiển thị trường "Chỉ số cũ" hay không.
 */
export const getPreviousReadingByBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookingId = req.params.bookingId as string;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid bookingId" });
    }

    // Verify booking belongs to this landlord
    const { BookingRepository } = await import("../repositories/booking.repo.js");
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const room = booking.roomId as any;
    if (!room || room.landlordId?.toString() !== landlordId) {
      return res.status(403).json({ success: false, message: "You do not own this booking" });
    }

    // Lấy billingMonth từ query param, nếu không có thì dùng tháng hiện tại
    const currentBillingMonth = (req.query.billingMonth as string) || new Date().toISOString().slice(0, 7);

    // Tìm hóa đơn gần nhất trước tháng hiện tại
    const prevByBooking = await InvoiceRepository.findPreviousInvoiceByBookingId(
      bookingId,
      currentBillingMonth
    );

    // Nếu có contractId, thử tìm theo contract
    const contractId = booking.contractId?.toString();
    let prevByContract = null;
    if (contractId) {
      prevByContract = await InvoiceRepository.findPreviousInvoiceByContractId(
        contractId,
        currentBillingMonth
      );
    }

    let bestMatch = prevByContract || prevByBooking;

    // Fallback: tìm theo tenantId nếu vẫn chưa có
    if (!bestMatch) {
      const tenantId = booking.tenantId?._id?.toString() || booking.tenantId?.toString();
      if (tenantId) {
        bestMatch = await InvoiceRepository.findPreviousInvoiceByTenantId(
          tenantId,
          currentBillingMonth
        );
      }
    }

    // Try to resolve actual meter indices — may be in InvoiceDetail or MeterReading
    let electricityNewIndex: number | null = bestMatch?.detail?.electricityNewIndex ?? null;
    let waterNewIndex: number | null = bestMatch?.detail?.waterNewIndex ?? null;
    const electricityRate = bestMatch?.detail?.electricityRate ?? null;
    const waterRate = bestMatch?.detail?.waterRate ?? null;

    // Fallback 1: Check if the invoice itself has electricityAmount/waterAmount > 0
    // (means meter readings were used, even if InvoiceDetail is missing)
    if (electricityNewIndex == null && bestMatch?.invoice?.electricityAmount != null && bestMatch.invoice.electricityAmount > 0) {
      electricityNewIndex = -1; // Sentinel: means "has readings but unknown index"
    }
    if (waterNewIndex == null && bestMatch?.invoice?.waterAmount != null && bestMatch.invoice.waterAmount > 0) {
      waterNewIndex = -1;
    }

    // Fallback 2: Check MeterReading collection
    if (electricityNewIndex == null || waterNewIndex == null) {
      if (contractId) {
        const { MeterReadingRepository } = await import("../repositories/meter-reading.repo.js");

        if (electricityNewIndex == null) {
          const elecReading = await MeterReadingRepository.findLatestByContractAndType(
            contractId,
            METER_TYPE.ELECTRICITY,
            currentBillingMonth
          );
          if (elecReading) electricityNewIndex = elecReading.readingValue;
        }

        if (waterNewIndex == null) {
          const waterReading = await MeterReadingRepository.findLatestByContractAndType(
            contractId,
            METER_TYPE.WATER,
            currentBillingMonth
          );
          if (waterReading) waterNewIndex = waterReading.readingValue;
        }
      }
    }

    // Determine if there's actual meter data from previous period
    const hasMeterData =
      (electricityNewIndex !== null) || (waterNewIndex !== null);

    return res.json({
      success: true,
      data: {
        hasPreviousInvoice: !!bestMatch,
        hasMeterData,
        previousInvoice: bestMatch
          ? {
              billingMonth: bestMatch.invoice.billingMonth,
              electricityNewIndex,
              waterNewIndex,
              electricityOldIndex: bestMatch.detail?.electricityOldIndex ?? null,
              waterOldIndex: bestMatch.detail?.waterOldIndex ?? null,
              electricityRate,
              waterRate,
            }
          : null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
