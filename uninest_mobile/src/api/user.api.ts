import { api } from "@/lib/api-client";
import type { UpdateUserPayload, UpdateUserResponse } from "@/types/user";

export const userApi = {
  /** PUT /api/users/update/:id */
  update: (userId: string, payload: UpdateUserPayload) =>
    api.put<UpdateUserResponse>(`/users/update/${userId}`, payload),
};
