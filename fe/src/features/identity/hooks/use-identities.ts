import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { identityApi } from '../api/identity.api'
import type { CreateIdentityPayload, UpdateIdentityPayload } from '../types/identity.type'

export const identityKeys = {
  all: ['identities'] as const,
  my: () => [...identityKeys.all, 'my'] as const,
  detail: (id: string) => [...identityKeys.all, 'detail', id] as const,
}

export function useCreateIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateIdentityPayload) => {
      const { data } = await identityApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.my() })
      toast.success('Đã tạo hồ sơ định danh')
    },
    onError: (error) => {
      toast.error('Không thể tạo hồ sơ định danh', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin.'),
      })
    },
  })
}

export function useUpdateIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateIdentityPayload }) => {
      const { data } = await identityApi.update(id, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.my() })
      toast.success('Đã cập nhật hồ sơ định danh')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật hồ sơ định danh', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useGetMyIdentities() {
  return useQuery({
    queryKey: identityKeys.my(),
    queryFn: async () => {
      const { data } = await identityApi.getMy()
      return data.data
    },
  })
}

export function useGetIdentityById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: identityKeys.detail(id ?? ''),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await identityApi.getById(id as string)
      return data.data
    },
  })
}
