import { api } from '@/lib/axios'
import type { BankAccountListResponse, BankAccountResponse, CreateBankAccountPayload, UpdateBankAccountPayload, CreateBankInfoPayload, UpdateBankInfoPayload, LandlordBankInfo, BankOption } from '../types/bank-account.type'

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

// ─── Landlord Bank Info (mới) ───
export const bankInfoApi = {
  getBankList: () => api.get<{ success: boolean; data: BankOption[] }>('/bank-info/banks'),
  create: (payload: CreateBankInfoPayload) => api.post<{ success: boolean; data: LandlordBankInfo }>('/bank-info', payload),
  getMy: () => api.get<{ success: boolean; data: LandlordBankInfo[] }>('/bank-info/my'),
  getMyVerified: () => api.get<{ success: boolean; data: LandlordBankInfo }>('/bank-info/my/verified'),
  update: (id: string, payload: UpdateBankInfoPayload) => api.put<{ success: boolean; data: LandlordBankInfo }>(`/bank-info/${id}`, payload),
  adminList: (status?: string) => api.get<{ success: boolean; data: LandlordBankInfo[] }>('/bank-info/admin', { params: status ? { status } : undefined }),
  adminVerify: (id: string) => api.patch<{ success: boolean; data: LandlordBankInfo }>(`/bank-info/admin/${id}/verify`),
  adminReject: (id: string) => api.patch<{ success: boolean; data: LandlordBankInfo }>(`/bank-info/admin/${id}/reject`),
  getByLandlord: (landlordId: string) => api.get<{ success: boolean; data: LandlordBankInfo }>(`/bank-info/landlord/${landlordId}`),
}
