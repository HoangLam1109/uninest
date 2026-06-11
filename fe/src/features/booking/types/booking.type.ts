import type { Room, RoomPagination } from '@/features/room/types/room.type'

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type BookingUser = {
  _id?: string
  id?: string
  fullName?: string
  email?: string
  phone?: string
}

export type BookingRoom = Pick<
  Room,
  '_id' | 'title' | 'address' | 'city' | 'district' | 'pricePerMonth' | 'status'
> & {
  landlordId?: string
}

export type Booking = {
  _id: string
  roomId: string | BookingRoom
  tenantId: string | BookingUser
  identityIds?: Array<string | { _id: string; fullName: string; cccdNumber: string; phone: string; status: string }>
  contractId?: string | unknown
  checkInDate: string
  checkOutDate?: string
  status: BookingStatus
  totalPrice?: number
  movedInAt?: string
  movedOutAt?: string
  isCurrent?: boolean
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type BookingListParams = {
  page?: number
  limit?: number
  status?: BookingStatus
}

export type CreateBookingPayload = {
  roomId: string
  checkInDate: string
  checkOutDate?: string
  notes?: string
  identityIds: string[]
}

export type BookingListResponse = {
  success: boolean
  data: Booking[]
  pagination: RoomPagination
  message?: string
}

export type BookingResponse = {
  success: boolean
  data: Booking
  message?: string
}
