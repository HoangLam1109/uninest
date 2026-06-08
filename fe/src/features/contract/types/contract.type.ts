import type { Booking } from '@/features/booking/types/booking.type'
import type { RoomPagination } from '@/features/room/types/room.type'

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_TENANT_SIGNATURE'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED'

export type ContractUser = {
  _id?: string
  id?: string
  fullName?: string
  email?: string
  phone?: string
}

export type Contract = {
  _id: string
  bookingId: string | Booking
  landlordId: string | ContractUser
  tenantId: string | ContractUser
  renewalFromId?: string | Contract | null
  startDate: string
  endDate?: string
  monthlyRent: number
  depositAmount?: number
  terms?: string
  contractFileUrl?: string
  signedContractFileUrl?: string
  signedContractStorageKey?: string
  tenantSignatureDataUrl?: string
  tenantConfirmedAt?: string
  status: ContractStatus
  signedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type ContractListParams = {
  page?: number
  limit?: number
}

export type CreateContractPayload = {
  bookingId: string
  monthlyRent: number
  depositAmount?: number
  terms?: string
  contractFileUrl?: string
  startDate?: string
  endDate?: string
}

export type UpdateContractPayload = {
  monthlyRent?: number
  depositAmount?: number
  terms?: string
  contractFileUrl?: string
  startDate?: string
  endDate?: string
}

export type RenewContractPayload = UpdateContractPayload & {
  startDate: string
}

export type ConfirmContractPayload = {
  tenantSignatureDataUrl: string
}

export type ContractListResponse = {
  success: boolean
  data: Contract[]
  pagination: RoomPagination
  message?: string
}

export type ContractResponse = {
  success: boolean
  data: Contract
  message?: string
}
