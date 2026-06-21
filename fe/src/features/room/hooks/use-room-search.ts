import { useMemo } from 'react'
import { useGetRooms, useSearchRooms } from './use-rooms'
import type { RoomSearchParams } from '../types/room.type'

function hasRoomSearchCriteria(params: RoomSearchParams) {
  return Boolean(
    params.q ||
      params.city ||
      params.district ||
      params.minPrice ||
      params.maxPrice ||
      params.roomType,
  )
}

export function useRoomSearch(params: RoomSearchParams) {
  const defaultListParams = useMemo(
    () => ({
      page: params.page,
      limit: params.limit,
      status: params.status,
      city: params.city,
      district: params.district,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      roomType: params.roomType,
    }),
    [
      params.city,
      params.district,
      params.limit,
      params.maxPrice,
      params.minPrice,
      params.page,
      params.roomType,
      params.status,
    ],
  )

  const enabledSearch = hasRoomSearchCriteria(params)
  const roomsQuery = useGetRooms(defaultListParams, !enabledSearch)
  const searchRoomsQuery = useSearchRooms(params, enabledSearch)

  return enabledSearch ? searchRoomsQuery : roomsQuery
}
