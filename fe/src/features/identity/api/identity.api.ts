import { api } from '@/lib/axios'
import type {
  CreateIdentityPayload,
  IdentityStatus,
  IdentityListResponse,
  IdentityResponse,
  UpdateIdentityPayload,
} from '../types/identity.type'

function buildIdentityFormData(payload: CreateIdentityPayload | UpdateIdentityPayload) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue

    if (key === 'cccdFront' || key === 'cccdBack') {
      formData.append(key, value as File)
    } else if (key === 'targetUserId') {
      formData.append(key, String(value))
    } else {
      formData.append(key, String(value))
    }
  }

  return formData
}

export const identityApi = {
  create: (payload: CreateIdentityPayload) => {
    const formData = buildIdentityFormData(payload)
    return api.post<IdentityResponse>('/identities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getMy: () =>
    api.get<IdentityListResponse>('/identities/my'),

  getById: (id: string) =>
    api.get<IdentityResponse>(`/identities/${id}`),

  adminList: (status?: IdentityStatus) =>
    api.get<IdentityListResponse>('/identities/admin', {
      params: status ? { status } : undefined,
    }),

  adminVerify: (id: string) =>
    api.patch<IdentityResponse>(`/identities/admin/${id}/verify`),

  adminReject: (id: string) =>
    api.patch<IdentityResponse>(`/identities/admin/${id}/reject`),

  /** Get identities for a specific user (for landlord/staff creating booking) */
  getByUserId: (userId: string) =>
    api.get<IdentityListResponse>(`/identities/by-user/${userId}`),

  /** Search identity by CCCD number (for adding co-renter to booking) */
  searchByCccd: (cccd: string) =>
    api.get<IdentityResponse>('/identities/search', { params: { cccd } }),

  update: (id: string, payload: UpdateIdentityPayload) => {
    const formData = buildIdentityFormData(payload)
    return api.put<IdentityResponse>(`/identities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
