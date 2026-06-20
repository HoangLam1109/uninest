import { api } from "@/lib/api-client";
import type {
  ContractListResponse,
  ContractMutationResponse,
  ContractResponse,
  ConfirmContractPayload,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from "@/types/contract";

function buildListQuery(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 100));
  return query.toString();
}

export const contractApi = {
  /** POST /api/contracts */
  createFromBooking: (payload: CreateContractPayload) =>
    api.post<ContractMutationResponse>("/contracts/", payload),

  /** GET /api/contracts/tenant */
  listTenant: (params?: { page?: number; limit?: number }) =>
    api.get<ContractListResponse>(
      `/contracts/tenant?${buildListQuery(params)}`,
    ),

  /** GET /api/contracts/landlord */
  listLandlord: (params?: { page?: number; limit?: number }) =>
    api.get<ContractListResponse>(
      `/contracts/landlord?${buildListQuery(params)}`,
    ),

  /** GET /api/contracts/:id */
  getById: (contractId: string) =>
    api.get<ContractResponse>(`/contracts/${contractId}`),

  /** PATCH /api/contracts/:id/tenant-confirm */
  confirmByTenant: (contractId: string, payload: ConfirmContractPayload) =>
    api.patch<ContractResponse>(
      `/contracts/${contractId}/tenant-confirm`,
      payload,
    ),

  /** PATCH /api/contracts/:id/activate */
  activate: (contractId: string) =>
    api.patch<ContractMutationResponse>(`/contracts/${contractId}/activate`),

  /** PUT /api/contracts/:id */
  update: (contractId: string, payload: UpdateContractPayload) =>
    api.put<ContractMutationResponse>(`/contracts/${contractId}`, payload),

  /** PATCH /api/contracts/:id/terminate */
  terminate: (contractId: string) =>
    api.patch<ContractMutationResponse>(`/contracts/${contractId}/terminate`),

  /** POST /api/contracts/:id/renew */
  renew: (contractId: string, payload: RenewContractPayload) =>
    api.post<ContractMutationResponse>(`/contracts/${contractId}/renew`, payload),
};
