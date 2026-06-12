import type { Room, RoomType } from '@/features/room/types/room.type'

export type AiRoomSearchFilters = {
  city?: string
  district?: string
  roomType?: RoomType
  minPrice?: number
  maxPrice?: number
  minRating?: number
  limit?: number
}

export type AiRoomSearchPayload = {
  question: string
  filters?: AiRoomSearchFilters
}

export type AiRoomSuggestion = {
  roomId: string
  title: string
  pricePerMonth: number
  reasons: string[]
}

export type AiRoomMatch = Pick<
  Room,
  | '_id'
  | 'title'
  | 'description'
  | 'address'
  | 'city'
  | 'district'
  | 'ward'
  | 'pricePerMonth'
  | 'depositAmount'
  | 'areaSqm'
  | 'maxOccupants'
  | 'roomType'
  | 'status'
  | 'amenityIds'
  | 'amenities'
> & {
  ratingAvg?: number
  reviewCount?: number
  score?: number
}

export type AiRoomSearchResult = {
  answer: string
  rooms: AiRoomSuggestion[]
  missingInfo: string[]
  matches: AiRoomMatch[]
  filters: AiRoomSearchFilters
  source: 'vector' | 'fallback'
  latencyMs: number
}

export type AiRoomSearchResponse = {
  success: boolean
  data: AiRoomSearchResult
  message?: string
}
