import { api } from "@/lib/api-client";
import type {
  ServicePackageListResponse,
  ServicePackageResponse,
} from "@/types/service-package";

function buildQuery(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  return query.toString();
}

export const servicePackageApi = {
  listActive: (params?: { page?: number; limit?: number }) =>
    api.get<ServicePackageListResponse>(
      `/service-packages/active?${buildQuery(params)}`,
    ),

  getById: (id: string) =>
    api.get<ServicePackageResponse>(`/service-packages/${id}`),
};
