import { LandlordBankInfoRepository } from "../repositories/landlord-bank-info.repo.js";
import { BANK_INFO_STATUS, VIETNAM_BANK_BINS, getBankByBin } from "../models/LandlordBankInfo.model.js";

export const LandlordBankInfoService = {
  createBankInfo: async (userId: string, data: { bankBin: string; bankName: string; accountNumber: string; accountHolder: string; branch?: string }) => {
    const bank = getBankByBin(data.bankBin);
    if (!bank) throw new Error("Mã ngân hàng không hợp lệ.");
    const existingVerified = await LandlordBankInfoRepository.findVerifiedByUserId(userId);
    if (existingVerified) throw new Error("Bạn đã có tài khoản ngân hàng được duyệt.");
    const existingPending = await LandlordBankInfoRepository.findPendingByUserId(userId);
    if (existingPending) throw new Error("Bạn đang có tài khoản ngân hàng chờ duyệt. Vui lòng đợi admin duyệt.");
    return LandlordBankInfoRepository.create({ userId, bankBin: data.bankBin, bankName: bank.name, accountNumber: data.accountNumber, accountHolder: data.accountHolder, branch: data.branch || "", status: BANK_INFO_STATUS.PENDING_VERIFICATION });
  },
  getMyBankInfos: async (userId: string) => LandlordBankInfoRepository.findByUserId(userId),
  getMyVerifiedBankInfo: async (userId: string) => LandlordBankInfoRepository.findVerifiedByUserId(userId),
  updateBankInfo: async (bankInfoId: string, userId: string, data: { bankBin?: string; bankName?: string; accountNumber?: string; accountHolder?: string; branch?: string }) => {
    const bi = await LandlordBankInfoRepository.findById(bankInfoId);
    if (!bi) throw new Error("Bank info not found");
    if (bi.userId._id.toString() !== userId) throw new Error("Bạn không sở hữu thông tin này");
    if (bi.status === BANK_INFO_STATUS.VERIFIED) throw new Error("Không thể cập nhật thông tin đã duyệt.");
    if (bi.status === BANK_INFO_STATUS.PENDING_VERIFICATION) throw new Error("Không thể cập nhật thông tin đang chờ duyệt.");
    if (data.bankBin) { const bank = getBankByBin(data.bankBin); if (!bank) throw new Error("Mã ngân hàng không hợp lệ."); data.bankName = bank.name; }
    return LandlordBankInfoRepository.update(bankInfoId, { ...data, status: BANK_INFO_STATUS.PENDING_VERIFICATION });
  },
  getAdminBankInfos: async (status?: string) => {
    const filter = status && Object.values(BANK_INFO_STATUS).includes(status as BANK_INFO_STATUS) ? { status } : {};
    return LandlordBankInfoRepository.findAll(filter);
  },
  verifyBankInfo: async (bankInfoId: string, verifierId: string) => LandlordBankInfoRepository.update(bankInfoId, { status: BANK_INFO_STATUS.VERIFIED, verifiedAt: new Date(), verifiedBy: verifierId }),
  rejectBankInfo: async (bankInfoId: string, verifierId: string) => LandlordBankInfoRepository.update(bankInfoId, { status: BANK_INFO_STATUS.REJECTED, verifiedBy: verifierId }),
  getLandlordBankInfo: async (landlordId: string) => LandlordBankInfoRepository.findVerifiedByUserId(landlordId),
  getBankList: () => Object.entries(VIETNAM_BANK_BINS).map(([bin, info]) => ({ bin, name: info.name, shortName: info.shortName })),
};
