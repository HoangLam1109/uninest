import { api } from "@/lib/api-client";
import type {
  IdentityListResponse,
  IdentityResponse,
} from "@/types/identity";
import type { ImageUploadFile } from "@/utils/upload-image";
import { appendImageToFormData } from "@/utils/upload-image";

export type CreateIdentityPayload = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  cccdNumber: string;
  cccdFront: ImageUploadFile;
  cccdBack: ImageUploadFile;
};

export type UpdateIdentityPayload = {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  cccdFront?: ImageUploadFile;
  cccdBack?: ImageUploadFile;
};

async function buildIdentityFormData(
  payload: CreateIdentityPayload | UpdateIdentityPayload,
) {
  const formData = new FormData();
  if (payload.fullName !== undefined) {
    formData.append("fullName", payload.fullName);
  }
  if (payload.dateOfBirth !== undefined) {
    formData.append("dateOfBirth", payload.dateOfBirth);
  }
  if (payload.phone !== undefined) {
    formData.append("phone", payload.phone);
  }
  if ("cccdNumber" in payload && payload.cccdNumber !== undefined) {
    formData.append("cccdNumber", payload.cccdNumber);
  }
  if (payload.cccdFront) {
    await appendImageToFormData(formData, "cccdFront", payload.cccdFront);
  }
  if (payload.cccdBack) {
    await appendImageToFormData(formData, "cccdBack", payload.cccdBack);
  }
  return formData;
}

export const identityApi = {
  create: async (payload: CreateIdentityPayload) => {
    const formData = await buildIdentityFormData(payload);
    return api.postForm<IdentityResponse>("/identities", formData);
  },

  update: async (id: string, payload: UpdateIdentityPayload) => {
    const formData = await buildIdentityFormData(payload);
    return api.putForm<IdentityResponse>(`/identities/${id}`, formData);
  },

  delete: (id: string) => api.delete<IdentityResponse>(`/identities/${id}`),

  getMy: () => api.get<IdentityListResponse>("/identities/my"),

  getById: (id: string) => api.get<IdentityResponse>(`/identities/${id}`),
};
