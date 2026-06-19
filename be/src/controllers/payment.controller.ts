import type { Request, Response } from "express";
import mongoose from "mongoose";
import { PaymentService } from "../services/payment.service.js";
import { PAYMENT_METHOD } from "../models/Payment.model.js";
import { isValidUserRole } from "../constants/role.constant.js";

export const payInvoice = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const invoiceId = req.params.invoiceId as string;
    const { method } = req.body;

    if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid invoice ID" });
    }

    if (!method || !Object.values(PAYMENT_METHOD).includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${Object.values(
          PAYMENT_METHOD
        ).join(", ")}`,
      });
    }

    const payment = await PaymentService.payInvoice(
      invoiceId,
      userId,
      method,
    );

    return res.json({
      success: true,
      message: "Invoice paid successfully",
      data: payment,
    });
  } catch (err: any) {
    const statusCode =
      err.message.includes("not found") ||
      err.message.includes("already been paid") ||
      err.message.includes("are not the tenant")
        ? 400
        : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

export const payDeposit = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookingId = req.params.bookingId as string;
    const { method } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking ID" });
    }

    if (!method || !Object.values(PAYMENT_METHOD).includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${Object.values(
          PAYMENT_METHOD
        ).join(", ")}`,
      });
    }

    const payment = await PaymentService.payDeposit(bookingId, userId, method);

    return res.json({
      success: true,
      message: "Deposit paid successfully",
      data: payment,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

export const payRoleUpgrade = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { targetRole, method } = req.body;

    if (!targetRole || !isValidUserRole(targetRole)) {
      return res.status(400).json({
        success: false,
        message: "Target role must be TENANT or LANDLORD",
      });
    }

    if (method && method !== PAYMENT_METHOD.PAYOS) {
      return res.status(400).json({
        success: false,
        message: "Role upgrade payments only support PAYOS",
      });
    }

    const payment = await PaymentService.payRoleUpgrade(
      userId,
      req.user?.role,
      targetRole,
    );

    return res.status(201).json({
      success: true,
      message: "Role upgrade payment created successfully",
      data: payment,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment ID" });
    }

    const payment = await PaymentService.getPaymentById(id, userId);

    return res.json({ success: true, data: payment });
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

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { payments, total } = await PaymentService.getMyPayments(
      userId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: payments,
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

export const getReceivedPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { payments, total } = await PaymentService.getReceivedPayments(
      userId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: payments,
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

export const getAdminPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(500, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { payments, total } = await PaymentService.getAdminPayments(
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: payments,
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

export const getAdminPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await PaymentService.getAdminPaymentStats();

    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPaymentsByInvoice = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const invoiceId = req.params.invoiceId as string;
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid invoice ID" });
    }

    const payments = await PaymentService.getPaymentsByInvoice(
      invoiceId,
      userId
    );

    return res.json({ success: true, data: payments });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

export const requestRefund = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason || typeof reason !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Refund reason is required" });
    }

    const payment = await PaymentService.requestRefund(id, userId, reason);

    return res.json({
      success: true,
      message: "Refund requested successfully",
      data: payment,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("your own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = req.params.id as string;
    const payment = await PaymentService.processRefund(id, userId);

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: payment,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("your own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const role = req.user?.role || "TENANT";
    const stats = await PaymentService.getPaymentStats(userId, role);

    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

