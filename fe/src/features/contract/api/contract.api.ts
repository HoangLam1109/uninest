import { api } from '@/lib/axios'
import type {
  ContractListParams,
  ContractListResponse,
  ContractResponse,
  ConfirmContractPayload,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

function buildContractFormData(
  payload: CreateContractPayload | UpdateContractPayload | RenewContractPayload,
) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    formData.append(key, String(value))
  })

  return formData
}

export const contractApi = {
  create: (payload: CreateContractPayload) =>
    api.post<ContractResponse>('/contracts', buildContractFormData(payload)),

  landlord: (params: ContractListParams) =>
    api.get<ContractListResponse>('/contracts/landlord', { params }),

  tenant: (params: ContractListParams) =>
    api.get<ContractListResponse>('/contracts/tenant', { params }),

  getById: (id: string) => api.get<ContractResponse>(`/contracts/${id}`),

  file: (id: string) =>
    api.get<Blob>(`/contracts/${id}/file`, { responseType: 'blob' }),

  update: (id: string, payload: UpdateContractPayload) =>
    api.put<ContractResponse>(`/contracts/${id}`, buildContractFormData(payload)),

  activate: (id: string) =>
    api.patch<ContractResponse>(`/contracts/${id}/activate`),

  confirmByTenant: (id: string, payload: ConfirmContractPayload) =>
    api.patch<ContractResponse>(`/contracts/${id}/tenant-confirm`, payload),

  terminate: (id: string) =>
    api.patch<ContractResponse>(`/contracts/${id}/terminate`),

  renew: (id: string, payload: RenewContractPayload) =>
    api.post<ContractResponse>(`/contracts/${id}/renew`, buildContractFormData(payload)),
}
