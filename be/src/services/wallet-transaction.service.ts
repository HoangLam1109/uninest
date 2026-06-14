import { WalletTransactionRepository } from "../repositories/wallet-transaction.repo.js";
import { WalletRepository } from "../repositories/wallet.repo.js";
import { WALLET_TX_TYPE } from "../models/WalletTransaction.model.js";

export class WalletTransactionService {
  static async create(data: {
    walletId: string;
    amount: number;
    balanceAfter: number;
    type: WALLET_TX_TYPE;
    description?: string;
    relatedPaymentId?: string;
  }) {
    return await WalletTransactionRepository.create(data);
  }

  static async findByWalletId(walletId: string, skip: number, limit: number) {
    return await WalletTransactionRepository.findByWalletId(walletId, skip, limit);
  }

  static async countByWalletId(walletId: string) {
    return await WalletTransactionRepository.countByWalletId(walletId);
  }

  static async getById(txId: string, userId: string) {
    const tx = await WalletTransactionRepository.findById(txId);
    if (!tx) {
      throw new Error("Transaction not found");
    }

    const wallet = await WalletRepository.findById(tx.walletId.toString());
    if (!wallet || wallet.userId.toString() !== userId) {
      throw new Error("You do not have access to this transaction");
    }

    return tx;
  }

  static async findByPaymentId(paymentId: string) {
    return await WalletTransactionRepository.findByPaymentId(paymentId);
  }
}