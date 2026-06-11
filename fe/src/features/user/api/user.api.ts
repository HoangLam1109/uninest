import { api } from '@/lib/axios'
import type { UserSearchResponse } from '../types/user.type'

export type UploadAvatarResponse = {
  success: boolean
  message?: string
  data: {
    avatarUrl: string
    user: {
      _id: string
      email: string
      fullName: string
      phone: string
      avatarUrl: string
      role: string
    }
  }
}

export const userApi = {
  search: (q: string) =>
    api.get<UserSearchResponse>('/users/search', { params: { q } }),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.patch<UploadAvatarResponse>('/users/profile/avatar', formData)
  },
}
