import type { Request, Response } from "express";
import mongoose from "mongoose";
import { BankAccountService } from "../services/bank-account.service.js";
import { createPayOSClient, PAYOS_CONFIG } from "../config/payos.config.js";

/**
 * POST /api/bank-accounts
 * Landlord tạo tài khoản PayOS để nhận thanh toán trực tiếp.
 */
export const createBankAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { payosClientId, payosApiKey, payosChecksumKey } = req.body;

    if (!payosClientId || !payosApiKey || !payosChecksumKey) {
      return res.status(400).json({
        success: false,
        message: "PayOS Client ID, API Key, and Checksum Key are required",
      });
    }

    const bankAccount = await BankAccountService.createBankAccount(userId, {
      payosClientId,
      payosApiKey,
      payosChecksumKey,
    });

    return res.status(201).json({
      success: true,
      message: "PayOS account created successfully, pending admin verification",
      data: bankAccount,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("đã có") || err.message.includes("đang có") ? 409 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/bank-accounts/my
 * Landlord xem danh sách tài khoản ngân hàng của mình.
 */
export const getMyBankAccounts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const bankAccounts = await BankAccountService.getMyBankAccounts(userId);
    return res.json({ success: true, data: bankAccounts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/bank-accounts/my/verified
 * Lấy tài khoản ngân hàng đã duyệt của mình.
 */
export const getMyVerifiedBankAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const bankAccount = await BankAccountService.getMyVerifiedBankAccount(userId);
    return res.json({ success: true, data: bankAccount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/bank-accounts/:id
 * Landlord cập nhật tài khoản PayOS (chỉ khi bị REJECTED).
 */
export const updateBankAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid bank account id" });

    const { payosClientId, payosApiKey, payosChecksumKey } = req.body;

    const updateData: any = {};
    if (payosClientId) updateData.payosClientId = payosClientId;
    if (payosApiKey) updateData.payosApiKey = payosApiKey;
    if (payosChecksumKey) updateData.payosChecksumKey = payosChecksumKey;

    const bankAccount = await BankAccountService.updateBankAccount(id, userId, updateData);

    return res.json({
      success: true,
      message: "PayOS account updated successfully, pending admin verification",
      data: bankAccount,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/bank-accounts/admin
 * Admin: Lấy danh sách tài khoản ngân hàng để duyệt.
 */
export const getAdminBankAccounts = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const bankAccounts = await BankAccountService.getAdminBankAccounts(status);
    return res.json({ success: true, data: bankAccounts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/bank-accounts/admin/:id/verify
 * Admin: Duyệt tài khoản ngân hàng.
 */
export const verifyBankAccount = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const id = req.params.id as string;

    if (!adminId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid bank account id" });

    const bankAccount = await BankAccountService.verifyBankAccount(id, adminId);

    return res.json({
      success: true,
      message: "Bank account verified successfully",
      data: bankAccount,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/bank-accounts/admin/:id/reject
 * Admin: Từ chối tài khoản ngân hàng.
 */
export const rejectBankAccount = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const id = req.params.id as string;

    if (!adminId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid bank account id" });

    const bankAccount = await BankAccountService.rejectBankAccount(id, adminId);

    return res.json({
      success: true,
      message: "Bank account rejected",
      data: bankAccount,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/bank-accounts/landlord/:landlordId
 * Public: Lấy tài khoản ngân hàng đã duyệt của landlord (hiển thị trên hóa đơn).
 */
export const getLandlordBankAccount = async (req: Request, res: Response) => {
  try {
    const landlordId = req.params.landlordId as string;

    if (!mongoose.Types.ObjectId.isValid(landlordId))
      return res.status(400).json({ success: false, message: "Invalid landlord id" });

    const bankAccount = await BankAccountService.getLandlordBankAccount(landlordId);

    return res.json({
      success: true,
      data: bankAccount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/bank-accounts/test-payos
 * Test PayOS connection with the provided keys. Creates a 0đ payment link
 * (or minimum 1000đ if PayOS requires) — no database records are saved.
 */
export const testPayOSConnection = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { payosClientId, payosApiKey, payosChecksumKey } = req.body;

    if (!payosClientId || !payosApiKey || !payosChecksumKey) {
      return res.status(400).json({
        success: false,
        message: "PayOS Client ID, API Key, and Checksum Key are required",
      });
    }

    // Create a temporary PayOS client with the provided keys
    const testClient = createPayOSClient({
      clientId: payosClientId,
      apiKey: payosApiKey,
      checksumKey: payosChecksumKey,
    });

    const orderCode = Number(String(Date.now()).slice(-6) + "99");

    // Try creating a 1000đ test link
    const paymentLink = await testClient.paymentRequests.create({
      orderCode,
      amount: 1000,
      description: "Test ket noi PayOS",
      returnUrl: PAYOS_CONFIG.returnUrl,
      cancelUrl: PAYOS_CONFIG.cancelUrl,
    });

    // Note: We intentionally do NOT cancel the test link here.
    // PayOS may reject immediate cancellation. The link will expire naturally.

    return res.json({
      success: true,
      message: "PayOS connection test successful — keys are valid",
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode,
      },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: `PayOS connection test failed: ${err.message || "Invalid keys"}`,
    });
  }
};
