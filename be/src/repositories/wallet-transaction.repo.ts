import { WalletTransactionModel } from "../models/WalletTransaction.model.js";

export const WalletTransactionRepository = {
  create: (data: any) => WalletTransactionModel.create(data),

  findByWalletId: (walletId: string, skip: number, limit: number) =>
    WalletTransactionModel.find({ walletId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByWalletId: (walletId: string) =>
    WalletTransactionModel.countDocuments({ walletId }),

  findById: (id: string) =>
    WalletTransactionModel.findById(id),

  findByPaymentId: (paymentId: string) =>
    WalletTransactionModel.findOne({ relatedPaymentId: paymentId }),
};