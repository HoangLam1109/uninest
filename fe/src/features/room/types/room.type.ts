export type RoomType = 'STUDIO' | 'SINGLE' | 'SHARED' | 'APARTMENT'

export type RoomStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'

export type Room = {
  _id: string
  landlordId?: string
  amenities?: string[]
  title: string
  description?: string
  address: string
  city?: string
  district?: string
  latitude?: number
  longitude?: number
  pricePerMonth: number
  depositAmount?: number
  areaSqm?: number
  maxOccupants: number
  roomType?: RoomType
  status: RoomStatus
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

export type RoomListParams = {
  page?: number
  limit?: number
  city?: string
  district?: string
  status?: RoomStatus
  minPrice?: number
  maxPrice?: number
}

export type RoomPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type RoomListResponse = {
  success: boolean
  data: Room[]
  pagination: RoomPagination
  message?: string
}

export type RoomResponse = {
  success: boolean
  data: Room
  message?: string
}

export type RoomPayload = {
  title: string
  description?: string
  address: string
  city?: string
  district?: string
  pricePerMonth: number
  depositAmount?: number
  areaSqm?: number
  maxOccupants: number
  roomType?: RoomType
  status?: RoomStatus
  isPublished?: boolean
}
