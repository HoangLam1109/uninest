import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { bookingApi } from '../api/booking.api'
import type {
  BookingListParams,
  CreateBookingPayload,
} from '../types/booking.type'

export const bookingKeys = {
  all: ['bookings'] as const,
  tenantLists: () => [...bookingKeys.all, 'tenant-list'] as const,
  tenantList: (params: Pick<BookingListParams, 'page' | 'limit'>) =>
    [...bookingKeys.tenantLists(), params] as const,
  landlordLists: () => [...bookingKeys.all, 'landlord-list'] as const,
  landlordList: (params: BookingListParams) =>
    [...bookingKeys.landlordLists(), params] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const { data } = await bookingApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.tenantLists() })
      toast.success('Da gui yeu cau dat phong')
    },
    onError: (error) => {
      toast.error('Khong the tao booking', {
        description: getApiErrorMessage(error, 'Vui long kiem tra lai thong tin.'),
      })
    },
  })
}

export function useGetTenantBookings(
  params: Pick<BookingListParams, 'page' | 'limit'>,
) {
  return useQuery({
    queryKey: bookingKeys.tenantList(params),
    queryFn: async () => {
      const { data } = await bookingApi.my(params)
      return data
    },
  })
}

export function useGetLandlordBookings(params: BookingListParams, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.landlordList(params),
    enabled,
    queryFn: async () => {
      const { data } = await bookingApi.landlord(params)
      return data
    },
  })
}

export function useGetBookingById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await bookingApi.getById(id as string)
      return data.data
    },
  })
}

export function useApproveBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bookingApi.approve(id)
      return data.data
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking._id) })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Đã phê duyệt yêu cầu')
    },
    onError: (error) => {
      toast.error('Không thể phê duyệt yêu cầu', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useRejectBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bookingApi.reject(id)
      return data.data
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking._id) })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Đã từ chối yêu cầu')
    },
    onError: (error) => {
      toast.error('Không thể từ chối yêu cầu', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bookingApi.cancel(id)
      return data.data
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking._id) })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Đã hủy yêu cầu')
    },
    onError: (error) => {
      toast.error('Không thể hủy yêu cầu', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bookingApi.delete(id)
      return data.data
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking._id) })
      toast.success('Đã xóa yêu cầu đặt phòng')
    },
    onError: (error) => {
      toast.error('Không thể xóa yêu cầu', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
