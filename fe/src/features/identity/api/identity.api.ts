import { api } from '@/lib/axios'
import type {
  CreateIdentityPayload,
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
    } else if (key === 'coTenants') {
      formData.append(key, JSON.stringify(value))
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

  update: (id: string, payload: UpdateIdentityPayload) => {
    const formData = buildIdentityFormData(payload)
    return api.put<IdentityResponse>(`/identities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
