import type { Request, Response } from "express";
import { WalletService } from "../services/wallet.service.js";

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const wallet = await WalletService.getOrCreateWallet(userId);

    return res.json({
      success: true,
      data: {
        id: wallet._id,
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const result = await WalletService.getWalletWithTransactions(
      userId,
      skip,
      limitNumber
    );

    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const topUpWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { amount, description } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });
    }

    const result = await WalletService.topUp(userId, amount, description);

    return res.json({
      success: true,
      message: "Wallet topped up successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const withdrawFromWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { amount, description } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });
    }

    const result = await WalletService.withdraw(userId, amount, description);

    return res.json({
      success: true,
      message: "Withdrawal successful",
      data: result,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("Insufficient balance") ? 400 : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};