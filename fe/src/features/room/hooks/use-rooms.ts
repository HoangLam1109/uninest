import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { roomApi } from '../api/room.api'
import type {
  RoomImagePayload,
  RoomListParams,
  RoomSearchParams,
  RoomReviewListParams,
  RoomReviewPayload,
  RoomReviewReplyPayload,
  RoomPayload,
} from '../types/room.type'

export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomListParams) => [...roomKeys.lists(), params] as const,
  searches: () => [...roomKeys.all, 'search'] as const,
  search: (params: RoomSearchParams) => [...roomKeys.searches(), params] as const,
  myLists: () => [...roomKeys.all, 'my-list'] as const,
  myList: (params: RoomListParams) => [...roomKeys.myLists(), params] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
  images: (roomId: string) => [...roomKeys.all, 'images', roomId] as const,
  reviews: (roomId: string, params: RoomReviewListParams) =>
    [...roomKeys.all, 'reviews', roomId, params] as const,
  favorites: () => [...roomKeys.all, 'favorites'] as const,
  favoritesList: (params: Pick<RoomListParams, 'page' | 'limit'>) =>
    [...roomKeys.favorites(), params] as const,
  favorite: (roomId: string) => [...roomKeys.all, 'favorite', roomId] as const,
  tenants: () => [...roomKeys.all, 'tenants'] as const,
}

function getFavoriteRoomId(roomId: string | { _id: string }) {
  return typeof roomId === 'string' ? roomId : roomId._id
}

export function useGetRooms(params: RoomListParams, enabled = true) {
  return useQuery({
    queryKey: roomKeys.list(params),
    enabled,
    queryFn: async () => {
      const { data } = await roomApi.list(params)
      return data
    },
  })
}

export function useSearchRooms(params: RoomSearchParams, enabled = true) {
  return useQuery({
    queryKey: roomKeys.search(params),
    enabled,
    queryFn: async () => {
      const { data } = await roomApi.search(params)
      return data
    },
  })
}

export function useGetMyRooms(params: RoomListParams) {
  return useQuery({
    queryKey: roomKeys.myList(params),
    queryFn: async () => {
      const { data } = await roomApi.my(params)
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

export function useGetTenantFavoriteRooms(
  params: Pick<RoomListParams, 'page' | 'limit'>,
) {
  return useQuery({
    queryKey: roomKeys.favoritesList(params),
    queryFn: async () => {
      const { data } = await roomApi.listFavorites(params)
      return data
    },
  })
}

export function useGetLandlordTenants() {
  return useQuery({
    queryKey: roomKeys.tenants(),
    queryFn: async () => {
      const { data } = await roomApi.getTenants()
      return data
    },
  })
}

export function useCheckRoomFavorite(roomId: string | null, enabled = true) {
  return useQuery({
    queryKey: roomKeys.favorite(roomId ?? ''),
    enabled: Boolean(roomId) && enabled,
    queryFn: async () => {
      const { data } = await roomApi.checkFavorite(roomId as string)
      return data.data
    },
  })
}

export function useAddRoomFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data } = await roomApi.addFavorite(roomId)
      return data.data
    },
    onSuccess: (favorite) => {
      const roomId = getFavoriteRoomId(favorite.roomId)
      queryClient.invalidateQueries({ queryKey: roomKeys.favorite(roomId) })
      queryClient.invalidateQueries({ queryKey: roomKeys.favorites() })
      toast.success('Đã lưu phòng vào yêu thích')
    },
    onError: (error) => {
      toast.error('Không thể lưu phòng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useRemoveRoomFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => roomApi.removeFavorite(roomId),
    onSuccess: (_response, roomId) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.favorite(roomId) })
      queryClient.invalidateQueries({ queryKey: roomKeys.favorites() })
      toast.success('Đã bỏ lưu phòng')
    },
    onError: (error) => {
      toast.error('Không thể bỏ lưu phòng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
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
      queryClient.invalidateQueries({ queryKey: roomKeys.myLists() })
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
      queryClient.invalidateQueries({ queryKey: roomKeys.myLists() })
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

export function useGetRoomReviews(
  roomId: string | null,
  params: RoomReviewListParams = {},
  enabled = true,
) {
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }

  return useQuery({
    queryKey: roomKeys.reviews(roomId ?? '', queryParams),
    enabled: Boolean(roomId) && enabled,
    queryFn: async () => {
      const { data } = await roomApi.listReviews(roomId as string, queryParams)
      return data
    },
  })
}

export function useCreateRoomReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RoomReviewPayload) => {
      const { data } = await roomApi.createReview(payload)
      return data.data
    },
    onSuccess: (review) => {
      const roomId = typeof review.roomId === 'string' ? review.roomId : ''
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: roomKeys.all })
      }
      toast.success('Da gui danh gia', {
        description: 'Danh gia cua ban da duoc hien thi.',
      })
    },
    onError: (error) => {
      toast.error('Khong the gui danh gia', {
        description: getApiErrorMessage(error, 'Vui long kiem tra lai noi dung.'),
      })
    },
  })
}

export function useReplyRoomReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reviewId,
      payload,
    }: {
      reviewId: string
      payload: RoomReviewReplyPayload
    }) => {
      const { data } = await roomApi.replyReview(reviewId, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      toast.success('Da gui phan hoi')
    },
    onError: (error) => {
      toast.error('Khong the gui phan hoi', {
        description: getApiErrorMessage(error, 'Vui long thu lai sau.'),
      })
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
    onSuccess: (_image, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.images(variables.roomId) })
      toast.success('Đã thêm ảnh phòng')
    },
    onError: (error) => {
      toast.error('Không thể thêm ảnh phòng', {
        description: getApiErrorMessage(error, 'Vui lòng chọn file ảnh hợp lệ.'),
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
      toast.success('Đã xóa ảnh phòng')
    },
    onError: (error) => {
      toast.error('Không thể xóa ảnh phòng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
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
      toast.success('Đã đặt ảnh đại diện')
    },
    onError: (error) => {
      toast.error('Không thể đặt ảnh đại diện', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
