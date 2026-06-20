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

async function buildIdentityFormData(payload: CreateIdentityPayload) {
  const formData = new FormData();
  formData.append("fullName", payload.fullName);
  formData.append("dateOfBirth", payload.dateOfBirth);
  formData.append("phone", payload.phone);
  formData.append("cccdNumber", payload.cccdNumber);
  await appendImageToFormData(formData, "cccdFront", payload.cccdFront);
  await appendImageToFormData(formData, "cccdBack", payload.cccdBack);
  return formData;
}

export const identityApi = {
  create: async (payload: CreateIdentityPayload) => {
    const formData = await buildIdentityFormData(payload);
    return api.postForm<IdentityResponse>("/identities", formData);
  },

  getMy: () => api.get<IdentityListResponse>("/identities/my"),

  getById: (id: string) => api.get<IdentityResponse>(`/identities/${id}`),
};
