import { BankAccountRepository } from "../repositories/bank-account.repo.js";
import { BANK_ACCOUNT_STATUS } from "../models/BankAccount.model.js";

export const BankAccountService = {
  /**
   * Landlord tạo thông tin tài khoản PayOS (để nhận tiền trực tiếp).
   */
  createBankAccount: async (
    userId: string,
    data: {
      payosClientId: string;
      payosApiKey: string;
      payosChecksumKey: string;
    }
  ) => {
    // Nếu đã có tài khoản PENDING_VERIFICATION hoặc VERIFIED thì không cho tạo thêm
    const existingVerified = await BankAccountRepository.findVerifiedByUserId(userId);
    if (existingVerified) {
      throw new Error("Bạn đã có tài khoản PayOS đã được duyệt. Vui lòng cập nhật tài khoản hiện tại.");
    }

    const existingPending = await BankAccountRepository.findPendingByUserId(userId);
    if (existingPending) {
      throw new Error("Bạn đang có tài khoản PayOS đang chờ duyệt. Vui lòng đợi admin duyệt.");
    }

    const bankAccount = await BankAccountRepository.create({
      userId,
      payosClientId: data.payosClientId,
      payosApiKey: data.payosApiKey,
      payosChecksumKey: data.payosChecksumKey,
      status: BANK_ACCOUNT_STATUS.PENDING_VERIFICATION,
    });

    return bankAccount;
  },

  /**
   * Landlord xem danh sách tài khoản ngân hàng của mình.
   */
  getMyBankAccounts: async (userId: string) => {
    return BankAccountRepository.findByUserId(userId);
  },

  /**
   * Landlord xem tài khoản ngân hàng đã duyệt của mình.
   */
  getMyVerifiedBankAccount: async (userId: string) => {
    return BankAccountRepository.findVerifiedByUserId(userId);
  },

  /**
   * Landlord cập nhật tài khoản PayOS (chỉ khi bị REJECTED).
   */
  updateBankAccount: async (
    bankAccountId: string,
    userId: string,
    data: {
      payosClientId?: string;
      payosApiKey?: string;
      payosChecksumKey?: string;
    }
  ) => {
    const bankAccount = await BankAccountRepository.findById(bankAccountId);
    if (!bankAccount) throw new Error("Bank account not found");

    if (bankAccount.userId._id.toString() !== userId) {
      throw new Error("Bạn không sở hữu tài khoản này");
    }

    if (bankAccount.status === BANK_ACCOUNT_STATUS.VERIFIED) {
      throw new Error("Không thể cập nhật tài khoản đã được duyệt. Vui lòng tạo tài khoản mới.");
    }

    if (bankAccount.status === BANK_ACCOUNT_STATUS.PENDING_VERIFICATION) {
      throw new Error("Không thể cập nhật tài khoản đang chờ duyệt.");
    }

    // Chỉ cho update khi REJECTED
    return BankAccountRepository.update(bankAccountId, {
      ...data,
      status: BANK_ACCOUNT_STATUS.PENDING_VERIFICATION,
    });
  },

  /**
   * Admin: Lấy danh sách tài khoản ngân hàng để duyệt.
   */
  getAdminBankAccounts: async (status?: string) => {
    const filter =
      status && Object.values(BANK_ACCOUNT_STATUS).includes(status as BANK_ACCOUNT_STATUS)
        ? { status }
        : {};
    return BankAccountRepository.findAll(filter);
  },

  /**
   * Admin: Duyệt tài khoản ngân hàng.
   */
  verifyBankAccount: async (bankAccountId: string, verifierId: string) => {
    const bankAccount = await BankAccountRepository.findById(bankAccountId);
    if (!bankAccount) throw new Error("Bank account not found");

    if (bankAccount.status !== BANK_ACCOUNT_STATUS.PENDING_VERIFICATION) {
      throw new Error(`Cannot verify bank account with status: ${bankAccount.status}`);
    }

    return BankAccountRepository.update(bankAccountId, {
      status: BANK_ACCOUNT_STATUS.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: verifierId,
    });
  },

  /**
   * Admin: Từ chối tài khoản ngân hàng.
   */
  rejectBankAccount: async (bankAccountId: string, verifierId: string) => {
    const bankAccount = await BankAccountRepository.findById(bankAccountId);
    if (!bankAccount) throw new Error("Bank account not found");

    return BankAccountRepository.update(bankAccountId, {
      status: BANK_ACCOUNT_STATUS.REJECTED,
      verifiedBy: verifierId,
    });
  },

  /**
   * Lấy tài khoản ngân hàng đã duyệt của landlord (public - dùng để hiển thị trên hóa đơn).
   */
  getLandlordBankAccount: async (landlordId: string) => {
    return BankAccountRepository.findVerifiedByUserId(landlordId);
  },
};
