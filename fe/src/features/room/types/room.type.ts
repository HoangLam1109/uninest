export type RoomType = 'STUDIO' | 'SINGLE' | 'SHARED' | 'APARTMENT'

export type RoomStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'

export type RoomLandlord = {
  _id: string
  fullName?: string
  email?: string
  phone?: string
}

export type Room = {
  _id: string
  propertyId?: string | null
  landlordId?: string | RoomLandlord
  amenityIds?: string[]
  amenities?: string[]
  title: string
  description?: string
  address: string
  city?: string
  district?: string
  ward?: string
  latitude?: number
  longitude?: number
  pricePerMonth: number
  depositAmount?: number
  electricityRate?: number
  waterRate?: number
  areaSqm?: number
  maxOccupants: number
  roomType?: RoomType
  status: RoomStatus
  isPublished: boolean
  embedding?: number[]
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type RoomImage = {
  _id: string
  roomId: string
  url: string
  publicId?: string
  caption?: string
  order: number
  isPrimary: boolean
  uploadedAt?: string
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

export type RoomImageListResponse = {
  success: boolean
  data: RoomImage[]
  message?: string
}

export type RoomImageResponse = {
  success: boolean
  data: RoomImage
  message?: string
}

export type RoomPayload = {
  propertyId?: string | null
  landlordId?: string
  amenityIds?: string[]
  title: string
  description?: string
  address: string
  city?: string
  district?: string
  ward?: string
  latitude?: number
  longitude?: number
  pricePerMonth: number
  depositAmount?: number
  electricityRate?: number
  waterRate?: number
  areaSqm?: number
  maxOccupants: number
  roomType?: RoomType
  status?: RoomStatus
  isPublished?: boolean
  embedding?: number[]
  deletedAt?: string | null
}

export type RoomImagePayload = {
  image: File
  caption?: string
  order?: number
  isPrimary?: boolean
}
