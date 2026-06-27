import { PaymentRepository } from "../repositories/payment.repo.js";
import { DisbursementRepository } from "../repositories/disbursement.repo.js";
import { TransactionLogRepository } from "../repositories/transaction-log.repo.js";
import { LandlordBankInfoRepository } from "../repositories/landlord-bank-info.repo.js";
import { PayOSPayoutService } from "./payos-payout.service.js";
import {
  TX_DIRECTION,
  TX_STATUS,
  TX_CATEGORY,
  type ITransactionLog,
} from "../models/TransactionLog.model.js";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PAYMENT_METHOD,
} from "../models/Payment.model.js";
import { DISBURSEMENT_STATE } from "../models/Disbursement.model.js";
import mongoose from "mongoose";
import { userRepository } from "../repositories/index.js";

/** Resolve tên người dùng từ ObjectId hoặc object đã populate */
async function resolveUserName(userRef: any): Promise<string> {
  if (!userRef) return "Unknown";
  // Nếu đã được populate (có fullName)
  if (typeof userRef === "object" && userRef.fullName) {
    return userRef.fullName;
  }
  // Nếu là ObjectId thô hoặc object có _id
  const userId = userRef._id?.toString() || userRef.toString();
  try {
    const user = await userRepository.findById(userId);
    return user?.fullName || user?.email || "Unknown";
  } catch {
    return "Unknown";
  }
}

/** Map payment type → transaction category */
function getCategory(paymentType: PAYMENT_TYPE): TX_CATEGORY {
  if (paymentType === PAYMENT_TYPE.SERVICE_FEE ||
      paymentType === PAYMENT_TYPE.TENANT_PACKAGE ||
      paymentType === PAYMENT_TYPE.LANDLORD_PACKAGE) {
    return TX_CATEGORY.PACKAGE_UPGRADE;
  }
  if (paymentType === PAYMENT_TYPE.RENT || paymentType === PAYMENT_TYPE.UTILITY) {
    return TX_CATEGORY.INVOICE_RENT;
  }
  if (paymentType === PAYMENT_TYPE.DEPOSIT) {
    return TX_CATEGORY.DEPOSIT;
  }
  return TX_CATEGORY.OTHER;
}

export class AdminTransactionService {
  // ─── Tạo transaction log cho Payment (IN) ───
  static async logPayment(payment: any): Promise<void> {
    const payer = payment.payerId as any;
    const receiver = payment.receiverId as any;
    const resolvedStatus =
      payment.status === PAYMENT_STATUS.COMPLETED
        ? TX_STATUS.SUCCESS
        : payment.status === PAYMENT_STATUS.FAILED
          ? TX_STATUS.FAILED
          : payment.status === PAYMENT_STATUS.CANCELLED
            ? TX_STATUS.FAILED
            : TX_STATUS.PENDING;

    const existing = await TransactionLogRepository.findByReferenceId(
      payment.transactionRef || payment._id.toString()
    );
    if (existing) {
      // Update existing log
      await TransactionLogModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            status: resolvedStatus,
            gatewayResponse: payment.gatewayResponse,
            amount: payment.amount,
          },
        }
      );
      return;
    }

    // Resolve tên từ DB nếu chưa được populate
    const [fromName, toName] = await Promise.all([
      resolveUserName(payer),
      resolveUserName(receiver),
    ]);

    await TransactionLogRepository.create({
      direction: TX_DIRECTION.IN,
      category: getCategory(payment.type as PAYMENT_TYPE),
      paymentId: payment._id,
      referenceId: payment.transactionRef || `pay_${payment._id}`,
      amount: payment.amount,
      status: resolvedStatus,
      fromUserId: payment.payerId,
      toUserId: payment.receiverId,
      fromName,
      toName,
      gatewayResponse: payment.gatewayResponse,
      note: payment.note || `Payment ${payment.type} via ${payment.method || "PAYOS"}`,
    });
  }

  // ─── Tạo transaction log cho Disbursement (OUT) ───
  static async logDisbursement(disbursement: any): Promise<void> {
    const landlord = disbursement.landlordId as any;
    const resolvedStatus =
      disbursement.state === DISBURSEMENT_STATE.SUCCEEDED
        ? TX_STATUS.SUCCESS
        : disbursement.state === DISBURSEMENT_STATE.FAILED
          ? TX_STATUS.FAILED
          : TX_STATUS.PENDING;

    const existing = await TransactionLogRepository.findByReferenceId(
      disbursement.referenceId
    );
    if (existing) {
      await TransactionLogModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            status: resolvedStatus,
            gatewayResponse: disbursement.gatewayResponse,
            amount: disbursement.amount,
            netAmount: disbursement.netAmount,
            fee: disbursement.payoutFee,
          },
        }
      );
      return;
    }

    const toName = await resolveUserName(landlord);

    await TransactionLogRepository.create({
      direction: TX_DIRECTION.OUT,
      category: TX_CATEGORY.INVOICE_DISBURSEMENT,
      disbursementId: disbursement._id,
      referenceId: disbursement.referenceId,
      amount: disbursement.amount,
      netAmount: disbursement.netAmount,
      fee: disbursement.payoutFee || 0,
      status: resolvedStatus,
      toUserId: disbursement.landlordId,
      toName,
      toBankInfo: disbursement.bankSnapshot,
      gatewayResponse: disbursement.gatewayResponse,
      note: disbursement.note || `Disbursement to landlord`,
    } as any);
  }

  // ─── Admin: Đánh dấu payment thất bại ───
  static async markPaymentFailed(
    paymentId: string,
    adminId: string,
    note?: string
  ) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (
      payment.status === PAYMENT_STATUS.COMPLETED ||
      payment.status === PAYMENT_STATUS.REFUNDED
    ) {
      throw new Error(
        `Cannot mark ${payment.status} payment as failed`
      );
    }

    const updated = await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.FAILED,
      note: (payment.note || "") + ` [FAILED by admin: ${note || "Manual override"}]`,
    });

    await this.logPayment(updated);
    return updated;
  }

  // ─── Admin: Đánh dấu payment đã chuyển tay (manual resolved) ───
  static async markPaymentResolved(
    paymentId: string,
    adminId: string,
    note?: string
  ) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error("Payment not found");

    const updated = await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.COMPLETED,
      note:
        (payment.note || "") +
        ` [MANUAL_RESOLVED by admin: ${note || "Chuyển tay cho landlord"}]`,
      paidAt: new Date(),
    });

    // Log as resolved
    await TransactionLogRepository.create({
      direction: TX_DIRECTION.IN,
      category: getCategory(payment.type as PAYMENT_TYPE),
      paymentId: payment._id,
      referenceId: `manual_${payment._id}_${Date.now()}`,
      amount: payment.amount,
      status: TX_STATUS.MANUAL_RESOLVED,
      fromUserId: payment.payerId,
      toUserId: payment.receiverId,
      fromName: (payment.payerId as any)?.fullName || "Unknown",
      toName: (payment.receiverId as any)?.fullName || "Unknown",
      resolvedBy: new mongoose.Types.ObjectId(adminId),
      resolvedAt: new Date(),
      note: note || "Admin xác nhận đã chuyển tay cho landlord",
    });

    return updated;
  }

  // ─── Admin: Đánh dấu disbursement thất bại ───
  static async markDisbursementFailed(
    disbursementId: string,
    adminId: string,
    note?: string
  ) {
    const d = await DisbursementRepository.findById(disbursementId);
    if (!d) throw new Error("Disbursement not found");
    if (d.state === DISBURSEMENT_STATE.SUCCEEDED) {
      throw new Error("Cannot mark succeeded disbursement as failed");
    }

    const updated = await DisbursementRepository.update(disbursementId, {
      state: DISBURSEMENT_STATE.FAILED,
      note: (d.note || "") + ` [FAILED by admin: ${note || "Manual"}]`,
    });

    await this.logDisbursement(updated);
    return updated;
  }

  // ─── Admin: Đánh dấu disbursement đã chuyển tay ───
  static async markDisbursementResolved(
    disbursementId: string,
    adminId: string,
    note?: string
  ) {
    const d = await DisbursementRepository.findById(disbursementId);
    if (!d) throw new Error("Disbursement not found");

    const updated = await DisbursementRepository.update(disbursementId, {
      state: DISBURSEMENT_STATE.SUCCEEDED,
      note:
        (d.note || "") +
        ` [MANUAL_RESOLVED by admin: ${note || "Đã chuyển tay cho landlord"}]`,
    });

    await TransactionLogRepository.create({
      direction: TX_DIRECTION.OUT,
      category: TX_CATEGORY.INVOICE_DISBURSEMENT,
      disbursementId: d._id,
      referenceId: `manual_disb_${d._id}_${Date.now()}`,
      amount: d.amount,
      netAmount: d.netAmount,
      fee: d.payoutFee || 0,
      status: TX_STATUS.MANUAL_RESOLVED,
      toUserId: d.landlordId,
      toName: (d.landlordId as any)?.fullName || "Unknown",
      toBankInfo: d.bankSnapshot,
      resolvedBy: new mongoose.Types.ObjectId(adminId),
      resolvedAt: new Date(),
      note: note || "Admin xác nhận đã chuyển tay cho landlord",
    });

    return updated;
  }

  // ─── Admin: Lấy danh sách giao dịch thống nhất ───
  static async getTransactions(params: {
    direction?: string;
    category?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      TransactionLogRepository.findAll({
        direction: params.direction || undefined,
        category: params.category || undefined,
        status: params.status || undefined,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        search: params.search || undefined,
        skip,
        limit,
      } as any),
      TransactionLogRepository.countAll({
        direction: params.direction || undefined,
        category: params.category || undefined,
        status: params.status || undefined,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        search: params.search || undefined,
      } as any),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: Thống kê giao dịch ───
  static async getTransactionStats() {
    return TransactionLogRepository.getStats();
  }

  // ─── Admin: Chi tiết một giao dịch ───
  static async getTransactionById(id: string) {
    const tx = await TransactionLogRepository.findById(id);
    if (!tx) throw new Error("Transaction not found");

    // Load thêm payment hoặc disbursement detail
    let paymentDetail = null;
    let disbursementDetail = null;

    if (tx.paymentId) {
      paymentDetail = await PaymentRepository.findById(tx.paymentId.toString());
    }
    if (tx.disbursementId) {
      disbursementDetail = await DisbursementRepository.findById(
        tx.disbursementId.toString()
      );
    }

    return { ...tx.toObject(), paymentDetail, disbursementDetail };
  }
}

// Import ở cuối để tránh circular dependency
import { TransactionLogModel } from "../models/TransactionLog.model.js";
