import type { Request, Response } from "express";
import mongoose from "mongoose";
import { MeterReadingRepository } from "../repositories/meter-reading.repo.js";
import { ContractRepository } from "../repositories/contract.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { METER_TYPE } from "../models/MeterReading.model.js";

/**
 * GET /api/meter-readings/my
 * Tenant xem lịch sử chỉ số công tơ của chính mình.
 */
export const getMyMeterReadings = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { meterType, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    // Find tenant's bookings to get their contract IDs
    const bookings = await BookingRepository.findByTenantId(
      tenantId,
      0,
      100
    );

    const contractIds: string[] = [];
    for (const booking of bookings) {
      if (booking.contractId) {
        contractIds.push(booking.contractId.toString());
      }
    }

    // Also find active contracts
    const contracts = await ContractRepository.findByTenantId(
      tenantId,
      0,
      100
    );
    for (const contract of contracts) {
      const cid = (contract as any)._id?.toString() || contract._id?.toString();
      if (cid && !contractIds.includes(cid)) {
        contractIds.push(cid);
      }
    }

    if (contractIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
      });
    }

    // Get readings for all tenant's contracts
    const MeterReadingModel = (await import("../models/MeterReading.model.js")).MeterReadingModel;
    const filter: any = {
      contractId: { $in: contractIds },
      deletedAt: null,
    };

    if (meterType && Object.values(METER_TYPE).includes(meterType as METER_TYPE)) {
      filter.meterType = meterType;
    }

    const [readings, total] = await Promise.all([
      MeterReadingModel.find(filter)
        .populate("recordedBy", "fullName email")
        .sort({ readingDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      MeterReadingModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: readings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/meter-readings/contract/:contractId
 * Landlord xem lịch sử chỉ số công tơ của một hợp đồng.
 */
export const getMeterReadingsByContract = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { contractId } = req.params;
    if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ success: false, message: "Invalid contractId" });
    }

    // Verify landlord owns this contract
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    const contractLandlordId =
      (contract.landlordId as any)?._id?.toString() ||
      (contract.landlordId as any)?.toString();
    if (contractLandlordId !== landlordId) {
      return res.status(403).json({ success: false, message: "You do not own this contract" });
    }

    const { meterType, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [readings, total] = await Promise.all([
      MeterReadingRepository.findByContractId(
        contractId,
        meterType as METER_TYPE | undefined,
        skip,
        limitNum
      ),
      MeterReadingRepository.countByContractId(
        contractId,
        meterType as METER_TYPE | undefined
      ),
    ]);

    return res.json({
      success: true,
      data: readings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/meter-readings/invoice/:invoiceId
 * Lấy MeterReading của một hóa đơn cụ thể.
 */
export const getMeterReadingsByInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ success: false, message: "Invalid invoiceId" });
    }

    const readings = await MeterReadingRepository.findByInvoiceId(invoiceId);
    return res.json({ success: true, data: readings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
