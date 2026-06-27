import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { bankAccountApi, bankInfoApi } from '../api/bank-account.api'
import type { CreateBankAccountPayload, UpdateBankAccountPayload, CreateBankInfoPayload, UpdateBankInfoPayload } from '../types/bank-account.type'

export const bankAccountKeys = {
  all: ['bank-accounts'] as const,
  my: () => [...bankAccountKeys.all, 'my'] as const,
  myVerified: () => [...bankAccountKeys.all, 'my-verified'] as const,
  landlord: (landlordId: string) => [...bankAccountKeys.all, 'landlord', landlordId] as const,
  admin: (status?: string) => [...bankAccountKeys.all, 'admin', status ?? 'all'] as const,
}

// ---- Queries ----

/** Landlord: Lấy danh sách tài khoản ngân hàng của mình */
export function useGetMyBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.my(),
    queryFn: async () => {
      const { data } = await bankAccountApi.getMy()
      return data.data
    },
  })
}

/** Landlord: Lấy tài khoản đã duyệt của mình */
export function useGetMyVerifiedBankAccount() {
  return useQuery({
    queryKey: bankAccountKeys.myVerified(),
    queryFn: async () => {
      const { data } = await bankAccountApi.getMyVerified()
      return data.data
    },
  })
}

/** Public: Lấy tài khoản ngân hàng đã duyệt của landlord (hiển thị trên hóa đơn) */
export function useGetLandlordBankAccount(landlordId: string | null, enabled = true) {
  return useQuery({
    queryKey: bankAccountKeys.landlord(landlordId ?? ''),
    enabled: Boolean(landlordId) && enabled,
    queryFn: async () => {
      const { data } = await bankAccountApi.getByLandlord(landlordId as string)
      return data.data
    },
  })
}

/** Admin: Lấy danh sách tài khoản để duyệt */
export function useGetAdminBankAccounts(status?: string) {
  return useQuery({
    queryKey: bankAccountKeys.admin(status),
    queryFn: async () => {
      const { data } = await bankAccountApi.adminList(status)
      return data.data
    },
  })
}

// ---- Mutations ----

/** Landlord: Tạo tài khoản ngân hàng */
export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateBankAccountPayload) => {
      const { data } = await bankAccountApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success('Đã gửi thông tin tài khoản PayOS, đang chờ admin duyệt')
    },
    onError: (error) => {
      toast.error('Không thể tạo tài khoản PayOS', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin.'),
      })
    },
  })
}

/** Landlord: Cập nhật tài khoản ngân hàng */
export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateBankAccountPayload }) => {
      const { data } = await bankAccountApi.update(id, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success('Đã cập nhật tài khoản PayOS, đang chờ admin duyệt')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật tài khoản PayOS', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

/** Admin: Duyệt tài khoản ngân hàng */
export function useVerifyBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bankAccountApi.adminVerify(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success('Đã duyệt tài khoản PayOS')
    },
    onError: (error) => {
      toast.error('Không thể duyệt tài khoản', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

/** Admin: Từ chối tài khoản ngân hàng */
export function useRejectBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bankAccountApi.adminReject(id)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success('Đã từ chối tài khoản PayOS')
    },
    onError: (error) => {
      toast.error('Không thể từ chối tài khoản', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
// ─── Bank Info hooks (mới) ───
export const bankInfoKeys = { all: ['bank-info'] as const, my: () => [...bankInfoKeys.all, 'my'] as const, myVerified: () => [...bankInfoKeys.all, 'my-verified'] as const, admin: (s?: string) => [...bankInfoKeys.all, 'admin', s ?? 'all'] as const, banks: () => [...bankInfoKeys.all, 'banks'] as const }
export function useGetBankList() { return useQuery({ queryKey: bankInfoKeys.banks(), queryFn: async () => { const { data } = await bankInfoApi.getBankList(); return data.data }, staleTime: 1000 * 60 * 60 }) }
export function useGetMyBankInfos() { return useQuery({ queryKey: bankInfoKeys.my(), queryFn: async () => { const { data } = await bankInfoApi.getMy(); return data.data } }) }
export function useGetMyVerifiedBankInfo() { return useQuery({ queryKey: bankInfoKeys.myVerified(), queryFn: async () => { const { data } = await bankInfoApi.getMyVerified(); return data.data } }) }
export function useCreateBankInfo() { const qc = useQueryClient(); return useMutation({ mutationFn: async (p: CreateBankInfoPayload) => { const { data } = await bankInfoApi.create(p); return data.data }, onSuccess: () => { qc.invalidateQueries({ queryKey: bankInfoKeys.all }); toast.success('Đã lưu thông tin tài khoản') }, onError: (e) => toast.error('Lỗi', { description: getApiErrorMessage(e, 'Thử lại sau.') }) }) }
export function useUpdateBankInfo() { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: UpdateBankInfoPayload }) => { const { data } = await bankInfoApi.update(id, payload); return data.data }, onSuccess: () => { qc.invalidateQueries({ queryKey: bankInfoKeys.all }); toast.success('Đã cập nhật') }, onError: (e) => toast.error('Lỗi', { description: getApiErrorMessage(e, 'Thử lại sau.') }) }) }
export function useVerifyBankInfo() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { const { data } = await bankInfoApi.adminVerify(id); return data.data }, onSuccess: () => { qc.invalidateQueries({ queryKey: bankInfoKeys.all }); toast.success('Đã duyệt') }, onError: (e) => toast.error('Lỗi', { description: getApiErrorMessage(e, 'Thử lại sau.') }) }) }
export function useRejectBankInfo() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { const { data } = await bankInfoApi.adminReject(id); return data.data }, onSuccess: () => { qc.invalidateQueries({ queryKey: bankInfoKeys.all }); toast.success('Đã từ chối') }, onError: (e) => toast.error('Lỗi', { description: getApiErrorMessage(e, 'Thử lại sau.') }) }) }
export function useGetAdminBankInfos(status?: string) { return useQuery({ queryKey: bankInfoKeys.admin(status), queryFn: async () => { const { data } = await bankInfoApi.adminList(status); return data.data } }) }

/** Test PayOS connection with provided keys */
export function useTestPayOSConnection() {
  return useMutation({
    mutationFn: async (payload: CreateBankAccountPayload) => {
      const { data } = await bankAccountApi.testConnection(payload)
      return data
    },
    onSuccess: (data) => {
      toast.success('Kết nối PayOS thành công!', {
        description: 'Keys của bạn hoạt động bình thường.',
      })
      // Open test checkout in new tab
      if (data.data?.checkoutUrl) {
        window.open(data.data.checkoutUrl, '_blank')
      }
    },
    onError: (error) => {
      toast.error('Kết nối PayOS thất bại', {
        description: getApiErrorMessage(error, 'Kiểm tra lại Client ID, API Key, Checksum Key.'),
      })
    },
  })
}