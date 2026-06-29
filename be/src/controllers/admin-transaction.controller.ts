import type { Request, Response } from "express";
import { AdminTransactionService } from "../services/admin-transaction.service.js";
import mongoose from "mongoose";

// ─── Lấy danh sách giao dịch (thống nhất IN + OUT) ───
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const {
      direction,
      category,
      status,
      fromDate,
      toDate,
      search,
      page,
      limit,
    } = req.query;

    const result = await AdminTransactionService.getTransactions({
      direction: direction as string,
      category: category as string,
      status: status as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
};

// ─── Thống kê giao dịch ───
export const getTransactionStats = async (_req: Request, res: Response) => {
  try {
    const stats = await AdminTransactionService.getTransactionStats();
    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
};

// ─── Chi tiết giao dịch ───
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction ID" });
    }

    const tx = await AdminTransactionService.getTransactionById(id);
    return res.json({ success: true, data: tx });
  } catch (err: any) {
    return res
      .status(err.message.includes("not found") ? 404 : 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Admin: Đánh dấu payment thất bại ───
export const markPaymentFailed = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.paymentId as string;
    const adminId = req.userId!;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment ID" });
    }

    const payment = await AdminTransactionService.markPaymentFailed(
      paymentId,
      adminId,
      note
    );

    return res.json({
      success: true,
      message: "Payment marked as failed",
      data: payment,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

// ─── Admin: Đánh dấu payment đã chuyển tay ───
export const markPaymentResolved = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.paymentId as string;
    const adminId = req.userId!;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment ID" });
    }

    const payment = await AdminTransactionService.markPaymentResolved(
      paymentId,
      adminId,
      note
    );

    return res.json({
      success: true,
      message: "Payment marked as manually resolved",
      data: payment,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

// ─── Admin: Đánh dấu disbursement thất bại ───
export const markDisbursementFailed = async (req: Request, res: Response) => {
  try {
    const disbursementId = req.params.disbursementId as string;
    const adminId = req.userId!;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(disbursementId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid disbursement ID" });
    }

    const disbursement = await AdminTransactionService.markDisbursementFailed(
      disbursementId,
      adminId,
      note
    );

    return res.json({
      success: true,
      message: "Disbursement marked as failed",
      data: disbursement,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

// ─── Admin: Đánh dấu disbursement đã chuyển tay ───
export const markDisbursementResolved = async (req: Request, res: Response) => {
  try {
    const disbursementId = req.params.disbursementId as string;
    const adminId = req.userId!;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(disbursementId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid disbursement ID" });
    }

    const disbursement = await AdminTransactionService.markDisbursementResolved(
      disbursementId,
      adminId,
      note
    );

    return res.json({
      success: true,
      message: "Disbursement marked as manually resolved",
      data: disbursement,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};
