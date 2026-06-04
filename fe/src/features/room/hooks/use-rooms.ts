import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { roomApi } from '../api/room.api'
import type {
  RoomImagePayload,
  RoomListParams,
  RoomPayload,
} from '../types/room.type'

export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomListParams) => [...roomKeys.lists(), params] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
  images: (roomId: string) => [...roomKeys.all, 'images', roomId] as const,
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

export function useGetRoomImages(roomId: string | null, enabled = true) {
  return useQuery({
    queryKey: roomKeys.images(roomId ?? ''),
    enabled: Boolean(roomId) && enabled,
    queryFn: async () => {
      const { data } = await roomApi.listImages(roomId as string)
      return data.data
    },
  })
}

export function useUploadRoomImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      payload,
    }: {
      roomId: string
      payload: RoomImagePayload
    }) => {
      const { data } = await roomApi.uploadImage(roomId, payload)
      return data.data
    },
    onSuccess: (image) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.images(image.roomId) })
      toast.success('Da them anh phong')
    },
    onError: (error) => {
      toast.error('Khong the them anh phong', {
        description: getApiErrorMessage(error, 'Vui long kiem tra lai URL anh.'),
      })
    },
  })
}

export function useDeleteRoomImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roomId,
      imageId,
    }: {
      roomId: string
      imageId: string
    }) => roomApi.deleteImage(roomId, imageId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.images(variables.roomId) })
      toast.success('Da xoa anh phong')
    },
    onError: (error) => {
      toast.error('Khong the xoa anh phong', {
        description: getApiErrorMessage(error, 'Vui long thu lai sau.'),
      })
    },
  })
}

export function useSetPrimaryRoomImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      imageId,
    }: {
      roomId: string
      imageId: string
    }) => {
      const { data } = await roomApi.setPrimaryImage(roomId, imageId)
      return data.data
    },
    onSuccess: (image) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.images(image.roomId) })
      toast.success('Da dat anh dai dien')
    },
    onError: (error) => {
      toast.error('Không thể đặt ảnh đại diện', {
        description: getApiErrorMessage(error, 'Vui long thu lai sau.'),
      })
    },
  })
}
