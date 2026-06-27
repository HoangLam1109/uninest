import { api } from '@/lib/axios'

export type DisbursementState = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export type Disbursement = {
  _id: string
  paymentId: string | { _id: string; amount: number; type: string; status: string }
  landlordId: string | { _id: string; fullName: string; email: string; phone: string }
  amount: number
  netAmount: number
  payoutFee: number
  referenceId: string
  payoutId?: string
  state: DisbursementState
  bankSnapshot: { bankBin: string; bankName: string; accountNumber: string; accountHolder: string }
  retryCount: number
  note?: string
  createdAt: string
  updatedAt: string
}

export const disbursementApi = {
  getPending: () => api.get<{ success: boolean; data: Disbursement[] }>('/disbursements/pending'),
  getAdmin: (params?: { state?: string; limit?: number; offset?: number }) => api.get<{ success: boolean; data: Disbursement[] }>('/disbursements/admin', { params }),
  manualComplete: (id: string, note?: string) => api.post<{ success: boolean; data: Disbursement }>(`/disbursements/${id}/manual-complete`, { note }),
  retry: (id: string) => api.post<{ success: boolean; data: Disbursement }>(`/disbursements/${id}/retry`),
  sync: (id: string) => api.post<{ success: boolean; data: Disbursement }>(`/disbursements/${id}/sync`),
}
