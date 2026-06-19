import { api } from '@/lib/axios'
import type {
  UserListResponse,
  UserPayload,
  UserResponse,
  UserSearchResponse,
} from '../types/user.type'

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
  list: () => api.get<UserListResponse>('/users/getAll'),

  getById: (id: string) => api.get<UserResponse>(`/users/getById/${id}`),

  search: (q: string) =>
    api.get<UserSearchResponse>('/users/search', { params: { q } }),

  create: (payload: UserPayload) =>
    api.post<UserResponse>('/users/create', payload),

  update: (id: string, payload: Partial<UserPayload>) =>
    api.put<UserResponse>(`/users/update/${id}`, payload),

  delete: (id: string) => api.delete<UserResponse>(`/users/delete/${id}`),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.patch<UploadAvatarResponse>('/users/profile/avatar', formData)
  },
}
