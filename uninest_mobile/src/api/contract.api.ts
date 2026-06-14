import { api } from "@/lib/api-client";
import type {
  ContractListResponse,
  ContractMutationResponse,
  CreateContractPayload,
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

  /** GET /api/contracts/landlord */
  listLandlord: (params?: { page?: number; limit?: number }) =>
    api.get<ContractListResponse>(
      `/contracts/landlord?${buildListQuery(params)}`,
    ),

  /** PATCH /api/contracts/:id/activate */
  activate: (contractId: string) =>
    api.patch<ContractMutationResponse>(`/contracts/${contractId}/activate`),
};
