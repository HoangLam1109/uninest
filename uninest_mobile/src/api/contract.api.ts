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
import { appendPdfToFormData } from "@/utils/contract-upload";

function buildListQuery(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 100));
  return query.toString();
}

async function buildContractFormData(
  payload: CreateContractPayload | UpdateContractPayload | RenewContractPayload,
) {
  const formData = new FormData();
  const { contractFile, ...rest } = payload;

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  if (contractFile) {
    await appendPdfToFormData(formData, "contractFile", contractFile);
  }

  return formData;
}

export const contractApi = {
  /** POST /api/contracts */
  createFromBooking: async (payload: CreateContractPayload) => {
    const formData = await buildContractFormData(payload);
    return api.postForm<ContractMutationResponse>("/contracts/", formData);
  },

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
  update: async (contractId: string, payload: UpdateContractPayload) => {
    const formData = await buildContractFormData(payload);
    return api.putForm<ContractMutationResponse>(
      `/contracts/${contractId}`,
      formData,
    );
  },

  /** PATCH /api/contracts/:id/terminate */
  terminate: (contractId: string) =>
    api.patch<ContractMutationResponse>(`/contracts/${contractId}/terminate`),

  /** POST /api/contracts/:id/renew */
  renew: async (contractId: string, payload: RenewContractPayload) => {
    const formData = await buildContractFormData(payload);
    return api.postForm<ContractMutationResponse>(
      `/contracts/${contractId}/renew`,
      formData,
    );
  },
};
