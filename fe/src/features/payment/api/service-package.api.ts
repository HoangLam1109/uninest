import { api } from '@/lib/axios'
import type {
  CreateServicePackagePayload,
  UpdateServicePackagePayload,
  ServicePackageResponse,
  ServicePackageListResponse,
} from '../types/service-package.type'

export const servicePackageApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ServicePackageListResponse>('/service-packages', { params }),

  listActive: (params?: { page?: number; limit?: number }) =>
    api.get<ServicePackageListResponse>('/service-packages/active', { params }),

  getById: (id: string) =>
    api.get<ServicePackageResponse>(`/service-packages/${id}`),

  create: (payload: CreateServicePackagePayload) =>
    api.post<ServicePackageResponse>('/service-packages', payload),

  update: (id: string, payload: UpdateServicePackagePayload) =>
    api.put<ServicePackageResponse>(`/service-packages/${id}`, payload),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/service-packages/${id}`,
    ),
}
