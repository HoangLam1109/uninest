import { api } from "@/lib/api-client";
import type {
  CreatePropertyPayload,
  PropertyListResponse,
  PropertyResponse,
} from "@/types/property";

export const propertyApi = {
  listMine: (params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return api.get<PropertyListResponse>(
      `/properties${query ? `?${query}` : ""}`,
    );
  },

  create: (payload: CreatePropertyPayload) =>
    api.post<PropertyResponse>("/properties/create", payload),
};
