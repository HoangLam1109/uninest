import { api } from '@/lib/axios'
import type {
  ContractListParams,
  ContractListResponse,
  ContractResponse,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

export const contractApi = {
  create: (payload: CreateContractPayload) =>
    api.post<ContractResponse>('/contracts', payload),

  landlord: (params: ContractListParams) =>
    api.get<ContractListResponse>('/contracts/landlord', { params }),

  tenant: (params: ContractListParams) =>
    api.get<ContractListResponse>('/contracts/tenant', { params }),

  getById: (id: string) => api.get<ContractResponse>(`/contracts/${id}`),

  update: (id: string, payload: UpdateContractPayload) =>
    api.put<ContractResponse>(`/contracts/${id}`, payload),

  activate: (id: string) =>
    api.patch<ContractResponse>(`/contracts/${id}/activate`),

  terminate: (id: string) =>
    api.patch<ContractResponse>(`/contracts/${id}/terminate`),

  renew: (id: string, payload: RenewContractPayload) =>
    api.post<ContractResponse>(`/contracts/${id}/renew`, payload),
}
