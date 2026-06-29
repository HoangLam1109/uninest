import { DisbursementRepository } from "../repositories/disbursement.repo.js";
import { LandlordBankInfoRepository } from "../repositories/landlord-bank-info.repo.js";
import { PayOSPayoutService } from "./payos-payout.service.js";
import { DISBURSEMENT_STATE } from "../models/Disbursement.model.js";
import { PAYMENT_TYPE } from "../models/Payment.model.js";
import { AdminTransactionService } from "./admin-transaction.service.js";

const AUTO_DISBURSE_TYPES: PAYMENT_TYPE[] = [PAYMENT_TYPE.RENT, PAYMENT_TYPE.DEPOSIT, PAYMENT_TYPE.UTILITY];

export class DisbursementService {
  static async autoDisburse(payment: any): Promise<any | null> {
    if (!AUTO_DISBURSE_TYPES.includes(payment.type as PAYMENT_TYPE)) return null;
    const landlordId = payment.receiverId?.toString?.() || payment.receiverId;
    const existing = await DisbursementRepository.findByPaymentId(payment._id.toString());
    if (existing) return existing;

    const bankInfo = await LandlordBankInfoRepository.findVerifiedByUserId(landlordId);
    if (!bankInfo) { console.log(`[Disbursement] No verified bank info for landlord: ${landlordId}`); return null; }

    const payoutFee = await PayOSPayoutService.calculatePayoutFee(payment.amount, bankInfo.bankBin).catch(() => 3300);
    const netAmount = payment.amount - payoutFee;
    if (netAmount <= 0) return null;

    // PayOS payout yêu cầu số tiền tối thiểu (thường >= 10,000đ)
    if (netAmount < 10000) {
      console.log(`[Disbursement] Net amount ${netAmount} too small for payout, creating PENDING for manual handling.`);
      return DisbursementRepository.create({
        paymentId: payment._id, landlordId, amount: payment.amount, netAmount, payoutFee, referenceId: `disb_${Date.now()}_${payment._id.toString().slice(-8)}`,
        state: DISBURSEMENT_STATE.PENDING,
        bankSnapshot: { bankBin: bankInfo.bankBin, bankName: bankInfo.bankName, accountNumber: bankInfo.accountNumber, accountHolder: bankInfo.accountHolder },
        retryCount: 0, note: `Số tiền quá nhỏ (${netAmount}đ) để auto-payout. Admin cần xử lý thủ công.`,
      });
    }
    const referenceId = `disb_${Date.now()}_${payment._id.toString().slice(-8)}`;

    if (!PayOSPayoutService.isAvailable()) {
      console.log(`[Disbursement] PayOS Payout disabled. Creating PENDING for manual handling.`);
      return DisbursementRepository.create({
        paymentId: payment._id, landlordId, amount: payment.amount, netAmount, payoutFee, referenceId,
        state: DISBURSEMENT_STATE.PENDING,
        bankSnapshot: { bankBin: bankInfo.bankBin, bankName: bankInfo.bankName, accountNumber: bankInfo.accountNumber, accountHolder: bankInfo.accountHolder },
        retryCount: 0, note: "PayOS Payout chưa được kích hoạt. Admin cần xử lý thủ công.",
      });
    }

    const disbursement = await DisbursementRepository.create({
      paymentId: payment._id, landlordId, amount: payment.amount, netAmount, payoutFee, referenceId,
      state: DISBURSEMENT_STATE.PENDING,
      bankSnapshot: { bankBin: bankInfo.bankBin, bankName: bankInfo.bankName, accountNumber: bankInfo.accountNumber, accountHolder: bankInfo.accountHolder },
      retryCount: 0,
    });

    try {
      const result = await PayOSPayoutService.createPayout({ referenceId, amount: netAmount, description: `UniNest thanh toan thue`, toBin: bankInfo.bankBin, toAccountNumber: bankInfo.accountNumber, category: ["rent"] });
      const isDone = result.approvalState === "COMPLETED" || result.approvalState === "SUCCEEDED";
      const newState = isDone ? DISBURSEMENT_STATE.SUCCEEDED : DISBURSEMENT_STATE.PROCESSING;
      const finalDisbursement = await DisbursementRepository.update(disbursement._id.toString(), { payoutId: result.id, state: newState, gatewayResponse: result });

      // Ghi transaction log
      try { await AdminTransactionService.logDisbursement(finalDisbursement || disbursement); } catch (logErr: any) { console.error(`[Disbursement] Log failed: ${logErr.message}`); }

      return finalDisbursement;
    } catch (err: any) {
      const failedDisbursement = await DisbursementRepository.update(disbursement._id.toString(), { state: DISBURSEMENT_STATE.FAILED, note: err.message, retryCount: 1 });
      try { await AdminTransactionService.logDisbursement(failedDisbursement || disbursement); } catch (logErr: any) { console.error(`[Disbursement] Log failed: ${logErr.message}`); }
      return failedDisbursement;
    }
  }

  static async retryDisbursement(disbursementId: string): Promise<any> {
    const d = await DisbursementRepository.findById(disbursementId);
    if (!d) throw new Error("Disbursement not found");
    if (d.state === DISBURSEMENT_STATE.SUCCEEDED) throw new Error("Already succeeded");
    if (!PayOSPayoutService.isAvailable()) throw new Error("PayOS Payout chưa được kích hoạt. Set PAYOS_PAYOUT_ENABLED=true.");
    if (d.state === DISBURSEMENT_STATE.PROCESSING) return this.syncDisbursementStatus(disbursementId);

    const bi = d.bankSnapshot;
    const refId = `disb_${Date.now()}_${d.paymentId.toString().slice(-8)}_r${d.retryCount + 1}`;
    await DisbursementRepository.update(disbursementId, { referenceId: refId, state: DISBURSEMENT_STATE.PENDING, retryCount: d.retryCount + 1 });
    try {
      const result = await PayOSPayoutService.createPayout({ referenceId: refId, amount: d.netAmount, description: `UniNest thanh toan tien thue`, toBin: bi.bankBin, toAccountNumber: bi.accountNumber, category: ["rent"] });
      const ns = result.approvalState === "SUCCEEDED" ? DISBURSEMENT_STATE.SUCCEEDED : DISBURSEMENT_STATE.PROCESSING;
      return DisbursementRepository.update(disbursementId, { payoutId: result.id, state: ns, gatewayResponse: result });
    } catch (err: any) {
      return DisbursementRepository.update(disbursementId, { state: DISBURSEMENT_STATE.FAILED, note: err.message });
    }
  }

  static async syncDisbursementStatus(disbursementId: string): Promise<any> {
    const d = await DisbursementRepository.findById(disbursementId);
    if (!d) throw new Error("Disbursement not found");
    if (!d.payoutId) throw new Error("No payoutId to sync");
    const status = await PayOSPayoutService.getPayoutStatus(d.payoutId);
    let ns = d.state;
    if (status.approvalState === "SUCCEEDED") ns = DISBURSEMENT_STATE.SUCCEEDED;
    else if (status.approvalState === "FAILED") ns = DISBURSEMENT_STATE.FAILED;
    return DisbursementRepository.update(disbursementId, { state: ns, gatewayResponse: status });
  }

  static async syncAllProcessing(): Promise<void> {
    const pending = await DisbursementRepository.findPending(50);
    for (const d of pending) { try { if (d.payoutId) await this.syncDisbursementStatus(d._id.toString()); } catch (e: any) { console.error(`[Disbursement] Sync failed: ${e.message}`); } }
  }

  static async manualComplete(disbursementId: string, adminId: string, note?: string): Promise<any> {
    const d = await DisbursementRepository.findById(disbursementId);
    if (!d) throw new Error("Disbursement not found");
    if (d.state === DISBURSEMENT_STATE.SUCCEEDED) throw new Error("Already completed");
    const completed = await DisbursementRepository.update(disbursementId, { state: DISBURSEMENT_STATE.SUCCEEDED, note: note || `Admin ${adminId} đã chuyển khoản thủ công` });

    // Ghi transaction log cho manual complete
    try { await AdminTransactionService.logDisbursement(completed || d); } catch (logErr: any) { console.error(`[Disbursement] Log failed: ${logErr.message}`); }

    return completed;
  }
}
