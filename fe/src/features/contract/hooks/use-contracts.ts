import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { contractApi } from '../api/contract.api'
import type {
  ContractListParams,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

export const contractKeys = {
  all: ['contracts'] as const,
  landlordLists: () => [...contractKeys.all, 'landlord-list'] as const,
  landlordList: (params: ContractListParams) =>
    [...contractKeys.landlordLists(), params] as const,
  tenantLists: () => [...contractKeys.all, 'tenant-list'] as const,
  tenantList: (params: ContractListParams) =>
    [...contractKeys.tenantLists(), params] as const,
  detail: (id: string) => [...contractKeys.all, 'detail', id] as const,
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateContractPayload) => {
      const { data } = await contractApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
      toast.success('Đã tạo hợp đồng')
    },
    onError: (error) => {
      toast.error('Không thể tạo hợp đồng', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra lại thông tin.'),
      })
    },
  })
}

export function useGetLandlordContracts(params: ContractListParams) {
  return useQuery({
    queryKey: contractKeys.landlordList(params),
    queryFn: async () => {
      const { data } = await contractApi.landlord(params)
      return data
    },
  })
}

export function useGetTenantContracts(params: ContractListParams) {
  return useQuery({
    queryKey: contractKeys.tenantList(params),
    queryFn: async () => {
      const { data } = await contractApi.tenant(params)
      return data
    },
  })
}

export function useGetContractById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: contractKeys.detail(id ?? ''),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const { data } = await contractApi.getById(id as string)
      return data.data
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateContractPayload
    }) => {
      const { data } = await contractApi.update(id, payload)
      return data.data
    },
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contract._id) })
      toast.success('Đã cập nhật hợp đồng')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật hợp đồng', {
        description: getApiErrorMessage(error, 'Chỉ có thể sửa hợp đồng bản nháp.'),
      })
    },
  })
}

export function useActivateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await contractApi.activate(id)
      return data.data
    },
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contract._id) })
      toast.success('Đã kích hoạt hợp đồng')
    },
    onError: (error) => {
      toast.error('Không thể kích hoạt hợp đồng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useTerminateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await contractApi.terminate(id)
      return data.data
    },
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contract._id) })
      toast.success('Đã chấm dứt hợp đồng')
    },
    onError: (error) => {
      toast.error('Không thể chấm dứt hợp đồng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useRenewContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: RenewContractPayload
    }) => {
      const { data } = await contractApi.renew(id, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
      toast.success('Đã gia hạn hợp đồng')
    },
    onError: (error) => {
      toast.error('Không thể gia hạn hợp đồng', {
        description: getApiErrorMessage(error, 'Vui lòng kiểm tra ngày bắt đầu.'),
      })
    },
  })
}
