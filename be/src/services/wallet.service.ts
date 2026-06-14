import { WalletRepository } from "../repositories/wallet.repo.js";
import { WalletTransactionService } from "./wallet-transaction.service.js";
import { WALLET_STATUS } from "../models/Wallet.model.js";
import { WALLET_TX_TYPE } from "../models/WalletTransaction.model.js";

export class WalletService {
  static async getOrCreateWallet(userId: string) {
    let wallet = await WalletRepository.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletRepository.create({
        userId,
        balance: 0,
        currency: "VND",
        status: WALLET_STATUS.ACTIVE,
      });
    }
    return wallet;
  }

  static async getWallet(userId: string) {
    const wallet = await WalletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    return wallet;
  }

  static async getWalletWithTransactions(userId: string, skip: number, limit: number) {
    const wallet = await this.getOrCreateWallet(userId);
    const walletId = wallet._id.toString();

    const [transactions, total] = await Promise.all([
      WalletTransactionService.findByWalletId(walletId, skip, limit),
      WalletTransactionService.countByWalletId(walletId),
    ]);

    return {
      wallet: {
        id: wallet._id,
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
      },
      transactions,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async topUp(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new Error("Top-up amount must be positive");
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status !== WALLET_STATUS.ACTIVE) {
      throw new Error(`Cannot top up. Wallet status: ${wallet.status}`);
    }

    const newBalance = wallet.balance + amount;
    const updatedWallet = await WalletRepository.updateBalance(wallet._id.toString(), newBalance);

    const tx = await WalletTransactionService.create({
      walletId: wallet._id.toString(),
      amount,
      balanceAfter: newBalance,
      type: WALLET_TX_TYPE.TOPUP,
      description: description || "Wallet top-up",
    });

    return { wallet: updatedWallet, transaction: tx };
  }

  static async withdraw(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status !== WALLET_STATUS.ACTIVE) {
      throw new Error(`Cannot withdraw. Wallet status: ${wallet.status}`);
    }

    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance. Current: ${wallet.balance}, requested: ${amount}`);
    }

    const newBalance = wallet.balance - amount;
    const updatedWallet = await WalletRepository.updateBalance(wallet._id.toString(), newBalance);

    const tx = await WalletTransactionService.create({
      walletId: wallet._id.toString(),
      amount: -amount,
      balanceAfter: newBalance,
      type: WALLET_TX_TYPE.WITHDRAW,
      description: description || "Wallet withdrawal",
    });

    return { wallet: updatedWallet, transaction: tx };
  }

  static async payWithWallet(
    payerId: string,
    receiverId: string | null,
    amount: number,
    paymentId?: string,
    description?: string
  ) {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const payerWallet = await this.getOrCreateWallet(payerId);

    if (payerWallet.status !== WALLET_STATUS.ACTIVE) {
      throw new Error(`Cannot process payment. Wallet status: ${payerWallet.status}`);
    }

    if (payerWallet.balance < amount) {
      throw new Error(`Insufficient balance. Current: ${payerWallet.balance}, required: ${amount}`);
    }

    const payerNewBalance = payerWallet.balance - amount;
    await WalletRepository.updateBalance(payerWallet._id.toString(), payerNewBalance);

    const payerTxData: any = {
      walletId: payerWallet._id.toString(),
      amount: -amount,
      balanceAfter: payerNewBalance,
      type: WALLET_TX_TYPE.PAYMENT,
      description: description || "Payment via wallet",
    };
    if (paymentId) payerTxData.relatedPaymentId = paymentId;
    const payerTx = await WalletTransactionService.create(payerTxData);

    let receiverTx = null;
    if (receiverId) {
      const receiverWallet = await this.getOrCreateWallet(receiverId);

      if (receiverWallet.status === WALLET_STATUS.ACTIVE) {
        const receiverNewBalance = receiverWallet.balance + amount;
        await WalletRepository.updateBalance(receiverWallet._id.toString(), receiverNewBalance);

        const receiverTxData: any = {
          walletId: receiverWallet._id.toString(),
          amount,
          balanceAfter: receiverNewBalance,
          type: WALLET_TX_TYPE.PAYMENT,
          description: description || "Payment received via wallet",
        };
        if (paymentId) receiverTxData.relatedPaymentId = paymentId;
        receiverTx = await WalletTransactionService.create(receiverTxData);
      }
    }

    return { payerTransaction: payerTx, receiverTransaction: receiverTx };
  }

  static async getTransactionById(txId: string, userId: string) {
    return await WalletTransactionService.getById(txId, userId);
  }

  static async ensureSufficientBalance(userId: string, amount: number) {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance. Current: ${wallet.balance}, required: ${amount}`);
    }
    return wallet;
  }

  static async getBalanceSummary(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      walletId: wallet._id,
    };
  }

  static async updateWalletStatus(userId: string, status: WALLET_STATUS) {
    const wallet = await WalletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error("Wallet not found for this user");
    }
    return await WalletRepository.updateStatus(wallet._id.toString(), status);
  }
}
