import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { invoiceApi } from '../api/invoice.api'
import type {
  CreateInitialReadingPayload,
  CreateInvoicePayload,
  CreateUtilityInvoicePayload,
  InvoiceListParams,
  PreviousReadingData,
  UpdateInvoicePayload,
} from '../types/invoice.type'
import type { LandlordPaymentInfoPayload } from '../types/landlord-payment-info.type'

export const invoiceKeys = {
  all: ['invoices'] as const,
  landlordLists: () => [...invoiceKeys.all, 'landlord-list'] as const,
  landlordList: (params: InvoiceListParams) =>
    [...invoiceKeys.landlordLists(), params] as const,
  tenantLists: () => [...invoiceKeys.all, 'tenant-list'] as const,
  tenantList: (params: InvoiceListParams) =>
    [...invoiceKeys.tenantLists(), params] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
  meterReadings: () => [...invoiceKeys.all, 'meter-readings'] as const,
  myMeterReadings: (params?: { meterType?: string }) =>
    [...invoiceKeys.meterReadings(), 'my', params ?? {}] as const,
  previousReading: (bookingId: string) =>
    [...invoiceKeys.all, 'previous-reading', bookingId] as const,
  landlordPaymentInfo: () => [...invoiceKeys.all, 'landlord-payment-info'] as const,
  landlordPaymentInfoMy: () => [...invoiceKeys.landlordPaymentInfo(), 'my'] as const,
}

// ---- Queries ----

export function useGetLandlordInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.landlordList(params),
    queryFn: async () => {
      const { data } = await invoiceApi.listLandlord(params)
      return data
    },
  })
}

export function useGetTenantInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.tenantList(params),
    queryFn: async () => {
      const { data } = await invoiceApi.listTenant(params)
      return data
    },
  })
}

export function useGetInvoiceById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? ''),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await invoiceApi.getById(id as string)
      return data.data
    },
  })
}

export function useGetInvoiceDetail(id: string | null, enabled = true) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(id ?? ''), 'detail'],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await invoiceApi.getDetail(id as string)
      return data.data
    },
  })
}

export function useGetMyMeterReadings(params?: { meterType?: string }) {
  return useQuery({
    queryKey: invoiceKeys.myMeterReadings(params),
    queryFn: async () => {
      const { data } = await invoiceApi.getMyMeterReadings(params)
      return data
    },
  })
}

// ---- Mutations ----

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const { data } = await invoiceApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã tạo hóa đơn nháp')
    },
    onError: (error) => {
      toast.error('Không thể tạo hóa đơn', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin.'),
      })
    },
  })
}

export function useCreateUtilityInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateUtilityInvoicePayload) => {
      const { data } = await invoiceApi.createUtility(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã tạo hóa đơn điện nước')
    },
    onError: (error) => {
      toast.error('Không thể tạo hóa đơn', {
        description: getApiErrorMessage(error, 'Kiểm tra chỉ số và đơn giá.'),
      })
    },
  })
}

export function useCreateInitialReading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateInitialReadingPayload) => {
      const { data } = await invoiceApi.createInitialReading(payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.meterReadings() })
      toast.success('Đã ghi nhận chỉ số ban đầu')
    },
    onError: (error) => {
      toast.error('Không thể ghi chỉ số', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại.'),
      })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateInvoicePayload
    }) => {
      const { data } = await invoiceApi.update(id, payload)
      return data.data
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoice._id) })
      toast.success('Đã cập nhật hóa đơn')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật hóa đơn', {
        description: getApiErrorMessage(error, 'Chỉ có thể sửa hóa đơn bản nháp.'),
      })
    },
  })
}

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await invoiceApi.send(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã gửi hóa đơn')
    },
    onError: (error) => {
      toast.error('Không thể gửi hóa đơn', {
        description: getApiErrorMessage(error, ''),
      })
    },
  })
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, landlordPaymentNote }: { id: string; landlordPaymentNote?: string }) => {
      const { data } = await invoiceApi.markPaid(id, landlordPaymentNote)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã đánh dấu thanh toán')
    },
    onError: (error) => {
      toast.error('Không thể đánh dấu', {
        description: getApiErrorMessage(error, ''),
      })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await invoiceApi.delete(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã xóa hóa đơn')
    },
    onError: (error) => {
      toast.error('Không thể xóa hóa đơn', {
        description: getApiErrorMessage(error, 'Chỉ xóa được hóa đơn nháp.'),
      })
    },
  })
}

export function useGetPreviousReading(bookingId: string | null, billingMonth?: string) {
  return useQuery({
    queryKey: [...invoiceKeys.previousReading(bookingId ?? ''), billingMonth],
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const { data } = await invoiceApi.getPreviousReadingByBooking(bookingId as string, billingMonth)
      return data.data as PreviousReadingData
    },
  })
}

// ---- New Manual Bank Transfer mutations ----

export function useMarkInvoiceUnpaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await invoiceApi.markUnpaid(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã đánh dấu hóa đơn là chưa thanh toán')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật', { description: getApiErrorMessage(error, '') })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await invoiceApi.cancelInvoice(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã hủy hóa đơn')
    },
    onError: (error) => {
      toast.error('Không thể hủy hóa đơn', { description: getApiErrorMessage(error, '') })
    },
  })
}

export function useMarkPendingConfirmation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await invoiceApi.markPendingConfirmation(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success('Đã xác nhận chuyển khoản, chờ chủ trọ xác nhận')
    },
    onError: (error) => {
      toast.error('Không thể xác nhận', { description: getApiErrorMessage(error, '') })
    },
  })
}

// ---- Landlord Payment Info hooks ----

export function useGetMyPaymentInfo() {
  return useQuery({
    queryKey: invoiceKeys.landlordPaymentInfoMy(),
    queryFn: async () => {
      const { data } = await invoiceApi.getMyPaymentInfo()
      return data.data
    },
  })
}

export function useCheckPaymentInfo() {
  return useQuery({
    queryKey: [...invoiceKeys.landlordPaymentInfoMy(), 'check'],
    queryFn: async () => {
      const { data } = await invoiceApi.checkPaymentInfo()
      return data.data
    },
  })
}

export function useUpsertMyPaymentInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LandlordPaymentInfoPayload) => {
      const { data } = await invoiceApi.upsertMyPaymentInfo(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.landlordPaymentInfo() })
      toast.success('Đã cập nhật thông tin thanh toán')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật thông tin thanh toán', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại.'),
      })
    },
  })
}
