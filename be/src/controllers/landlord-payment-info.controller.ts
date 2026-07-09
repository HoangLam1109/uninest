import type { Request, Response } from "express";
import { LandlordPaymentInfoRepository } from "../repositories/landlord-payment-info.repo.js";
import { PAYMENT_INFO_STATUS } from "../models/LandlordPaymentInfo.model.js";
import mongoose from "mongoose";

/**
 * GET landlord payment info for current user
 */
export const getMyPaymentInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const paymentInfo = await LandlordPaymentInfoRepository.findByUserId(userId);
    return res.json({ success: true, data: paymentInfo });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPSERT landlord payment info (create or update)
 */
export const upsertMyPaymentInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      paymentQrUrl,
      paymentNoteTemplate,
    } = req.body;

    // Validate required fields
    if (!bankName || !bankAccountNumber || !bankAccountHolder) {
      return res.status(400).json({
        success: false,
        message: "Tên ngân hàng, số tài khoản và tên chủ tài khoản là bắt buộc",
      });
    }

    const isPaymentInfoCompleted = !!(bankName && bankAccountNumber && bankAccountHolder);

    const paymentInfo = await LandlordPaymentInfoRepository.upsert(userId, {
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      paymentQrUrl: paymentQrUrl || "",
      paymentNoteTemplate: paymentNoteTemplate || "THANHTOAN {invoiceCode}",
      isPaymentInfoCompleted,
    });

    return res.json({
      success: true,
      message: "Thông tin thanh toán đã được cập nhật",
      data: paymentInfo,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Check if landlord has completed payment info (for validation before creating invoice)
 */
export const checkPaymentInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const paymentInfo = await LandlordPaymentInfoRepository.findByUserId(userId);

    const isComplete = !!(paymentInfo?.bankName && paymentInfo?.bankAccountNumber && paymentInfo?.bankAccountHolder);

    return res.json({
      success: true,
      data: {
        isComplete,
        hasPaymentInfo: !!paymentInfo,
        paymentInfo,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin Controllers ───

/** Admin: Get all payment info requests */
export const getAllPaymentInfos = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && Object.values(PAYMENT_INFO_STATUS).includes(status as PAYMENT_INFO_STATUS)) {
      filter.status = status;
    }
    const infos = await LandlordPaymentInfoRepository.findAll(filter);
    return res.json({ success: true, data: infos });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: Approve payment info */
export const approvePaymentInfo = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const infoId = req.params.id as string;
    if (!infoId || !mongoose.Types.ObjectId.isValid(infoId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const updated = await LandlordPaymentInfoRepository.updateByAdmin(infoId, {
      status: PAYMENT_INFO_STATUS.APPROVED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: "",
    });

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Đã duyệt thông tin thanh toán", data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: Reject payment info */
export const rejectPaymentInfo = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const infoId = req.params.id as string;
    const { reason } = req.body;
    if (!infoId || !mongoose.Types.ObjectId.isValid(infoId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const updated = await LandlordPaymentInfoRepository.updateByAdmin(infoId, {
      status: PAYMENT_INFO_STATUS.REJECTED,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason || "Không đạt yêu cầu",
    });

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Đã từ chối thông tin thanh toán", data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
