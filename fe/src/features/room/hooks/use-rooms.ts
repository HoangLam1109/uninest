import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { roomApi } from '../api/room.api'
import type { RoomListParams, RoomPayload } from '../types/room.type'

export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomListParams) => [...roomKeys.lists(), params] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
}

export function useGetRooms(params: RoomListParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => {
      const { data } = await roomApi.list(params)
      return data
    },
  })
}

export function useGetRoomById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: roomKeys.detail(id ?? ''),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await roomApi.getById(id as string)
      return data.data
    },
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RoomPayload) => {
      const { data } = await roomApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      toast.success('Đã thêm phòng')
    },
    onError: (error) => {
      toast.error('Không thể thêm phòng', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin.'),
      })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RoomPayload }) => {
      const { data } = await roomApi.update(id, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      toast.success('Đã cập nhật phòng')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật phòng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      toast.success('Đã xóa phòng')
    },
    onError: (error) => {
      toast.error('Không thể xóa phòng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
