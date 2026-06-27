import { payoutClient, PAYOS_PAYOUT_CONFIG } from "../config/payos.config.js";

const DEFAULT_PAYOUT_FEE = 2950;

export interface PayoutRequest {
  referenceId: string;
  amount: number;
  description: string;
  toBin: string;
  toAccountNumber: string;
  category?: string[];
}

export class PayOSPayoutService {
  static isAvailable(): boolean {
    return PAYOS_PAYOUT_CONFIG.enabled;
  }

  /** Tạo lệnh chi - dùng SDK @payos/node (tự động xử lý signature) */
  static async createPayout(params: PayoutRequest): Promise<any> {
    return (payoutClient as any).payouts.create({
      referenceId: params.referenceId,
      amount: params.amount,
      description: params.description.slice(0, 25), // PayOS payout: max 25 ký tự
      toBin: params.toBin,
      toAccountNumber: params.toAccountNumber,
      category: params.category || ["rent"],
    });
  }

  /** Lấy trạng thái lệnh chi */
  static async getPayoutStatus(payoutId: string): Promise<any> {
    return (payoutClient as any).payouts.get(payoutId);
  }

  /** Lấy số dư tài khoản chi */
  static async getBalance(): Promise<any> {
    return (payoutClient as any).payoutsAccount.getBalance();
  }

  /** Phí payout cố định */
  static async calculatePayoutFee(_amount: number, _toBin: string): Promise<number> {
    return DEFAULT_PAYOUT_FEE;
  }
}

