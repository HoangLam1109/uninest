import { api } from "@/lib/api-client";
import type { AuthUser } from "@/types/auth";
import type { UpdateUserPayload, UpdateUserResponse } from "@/types/user";
import type { ImageUploadFile } from "@/utils/upload-image";
import { appendImageToFormData } from "@/utils/upload-image";

export type UploadAvatarResponse = {
  success: boolean;
  data: {
    avatarUrl: string;
    user: AuthUser;
  };
};

export const userApi = {
  /** PUT /api/users/update/:id */
  update: (userId: string, payload: UpdateUserPayload) =>
    api.put<UpdateUserResponse>(`/users/update/${userId}`, payload),

  /** PATCH /api/users/profile/avatar */
  uploadAvatar: async (file: ImageUploadFile) => {
    const formData = new FormData();
    await appendImageToFormData(formData, "image", file);
    return api.patchForm<UploadAvatarResponse>(
      "/users/profile/avatar",
      formData,
    );
  },
};
