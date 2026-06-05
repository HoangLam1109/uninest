import type { Booking } from '@/features/booking/types/booking.type'
import { formatRoomCurrency } from '@/utils/room-display'
import type {
  Contract,
  ContractStatus,
  ContractUser,
} from '../types/contract.type'

export const contractStatusLabels: Record<ContractStatus, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
}

export const contractStatusStyles: Record<ContractStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-green-500/10 text-green-700',
  EXPIRED: 'bg-amber-500/10 text-amber-700',
  TERMINATED: 'bg-red-500/10 text-red-600',
}

export function formatContractCurrency(value?: number) {
  return formatRoomCurrency(value)
}

export function formatContractDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

export function getContractUser(value: string | ContractUser) {
  return typeof value === 'string' ? null : value
}

export function getContractBooking(value: string | Booking) {
  return typeof value === 'string' ? null : value
}

export function getContractPartyName(value: string | ContractUser) {
  const user = getContractUser(value)
  return user?.fullName ?? user?.email ?? 'Chưa có thông tin'
}

export function getContractRoomTitle(contract: Contract) {
  const booking = getContractBooking(contract.bookingId)
  const room = booking && typeof booking.roomId !== 'string' ? booking.roomId : null
  return room?.title ?? 'Phòng chưa cập nhật'
}
