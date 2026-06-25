import { api } from '@/lib/axios'
import type {
  BankAccountListResponse,
  BankAccountResponse,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from '../types/bank-account.type'

export const bankAccountApi = {
  /** Landlord: Tạo tài khoản PayOS */
  create: (payload: CreateBankAccountPayload) =>
    api.post<BankAccountResponse>('/bank-accounts', payload),

  /** Landlord: Danh sách tài khoản của mình */
  getMy: () =>
    api.get<BankAccountListResponse>('/bank-accounts/my'),

  /** Landlord: Tài khoản PayOS đã duyệt của mình */
  getMyVerified: () =>
    api.get<BankAccountResponse>('/bank-accounts/my/verified'),

  /** Landlord: Cập nhật tài khoản PayOS (chỉ khi REJECTED) */
  update: (id: string, payload: UpdateBankAccountPayload) =>
    api.put<BankAccountResponse>(`/bank-accounts/${id}`, payload),

  /** Admin: Danh sách tất cả để duyệt */
  adminList: (status?: string) =>
    api.get<BankAccountListResponse>('/bank-accounts/admin', {
      params: status ? { status } : undefined,
    }),

  /** Admin: Duyệt tài khoản */
  adminVerify: (id: string) =>
    api.patch<BankAccountResponse>(`/bank-accounts/admin/${id}/verify`),

  /** Admin: Từ chối tài khoản */
  adminReject: (id: string) =>
    api.patch<BankAccountResponse>(`/bank-accounts/admin/${id}/reject`),

  /** Public: Tài khoản PayOS đã duyệt của landlord */
  getByLandlord: (landlordId: string) =>
    api.get<BankAccountResponse>(`/bank-accounts/landlord/${landlordId}`),

  /** Test PayOS connection with provided keys (no DB save) */
  testConnection: (payload: CreateBankAccountPayload) =>
    api.post<{ success: boolean; message: string; data?: { checkoutUrl: string } }>(
      '/bank-accounts/test-payos',
      payload,
    ),
}
