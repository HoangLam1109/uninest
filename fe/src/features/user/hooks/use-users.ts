import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { userApi, type UpdateProfilePayload } from '../api/user.api'
import type { UserPayload } from '../types/user.type'
import { useAuthStore } from '@/stores/auth.store'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useGetUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const { data } = await userApi.list()
      return data.data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UserPayload) => {
      const { data } = await userApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      toast.success('Da tao tai khoan')
    },
    onError: (error) => {
      toast.error('Khong the tao tai khoan', {
        description: getApiErrorMessage(error, 'Vui long kiem tra lai thong tin.'),
      })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<UserPayload>
    }) => {
      const { data } = await userApi.update(id, payload)
      return data.data
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user._id) })
      toast.success('Da cap nhat tai khoan')
    },
    onError: (error) => {
      toast.error('Khong the cap nhat tai khoan', {
        description: getApiErrorMessage(error, 'Vui long thu lai sau.'),
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      toast.success('Da xoa tai khoan')
    },
    onError: (error) => {
      toast.error('Khong the xoa tai khoan', {
        description: getApiErrorMessage(error, 'Vui long thu lai sau.'),
      })
    },
  })
}

// ---- Profile Hooks ----

export function useGetProfile() {
  return useQuery({
    queryKey: [...userKeys.all, 'profile'] as const,
    queryFn: async () => {
      const { data } = await userApi.getProfile()
      return data.data
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await userApi.updateProfile(payload)
      return data.data
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'profile'] })
      // Sync auth store
      setUser({
        id: profile._id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        role: profile.role as any,
      })
      toast.success('Đã cập nhật hồ sơ')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật hồ sơ', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (file: File) => {
      const { data } = await userApi.uploadAvatar(file)
      return data.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'profile'] })
      // Sync auth store
      setUser({
        id: result.user._id,
        email: result.user.email,
        fullName: result.user.fullName,
        phone: result.user.phone,
        avatarUrl: result.user.avatarUrl,
        role: result.user.role as any,
      })
      toast.success('Đã cập nhật ảnh đại diện')
    },
    onError: (error) => {
      toast.error('Không thể tải ảnh lên', {
        description: getApiErrorMessage(error, 'Vui lòng chọn ảnh khác.'),
      })
    },
  })
}
