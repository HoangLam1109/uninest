import { WalletModel, WALLET_STATUS } from "../models/Wallet.model.js";

export const WalletRepository = {
  create: (data: any) => WalletModel.create(data),

  findByUserId: (userId: string) =>
    WalletModel.findOne({ userId }),

  findById: (id: string) =>
    WalletModel.findById(id),

  updateBalance: (id: string, newBalance: number) =>
    WalletModel.findByIdAndUpdate(
      id,
      { balance: newBalance },
      { returnDocument: "after", runValidators: true }
    ),

  updateStatus: (id: string, status: WALLET_STATUS) =>
    WalletModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" }
    ),
};