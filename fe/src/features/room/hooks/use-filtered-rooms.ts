import { useMemo } from 'react'
import { getRoomAmenityNames } from '@/utils/room-display'
import type { Room } from '../types/room.type'

type SearchableRoom = Pick<
  Room,
  | 'title'
  | 'address'
  | 'city'
  | 'district'
  | 'description'
  | 'roomType'
  | 'status'
  | 'amenityIds'
  | 'amenities'
>

export function filterRoomsBySearch<TRoom extends SearchableRoom>(
  rooms: TRoom[],
  search: string,
) {
  const keyword = search.trim().toLowerCase()
  if (!keyword) return rooms

  return rooms.filter((room) =>
    [
      room.title,
      room.address,
      room.city,
      room.district,
      room.description,
      room.roomType,
      room.status,
      ...getRoomAmenityNames(room),
    ]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(keyword)),
  )
}

export function useFilteredRooms<TRoom extends SearchableRoom>(
  rooms: TRoom[],
  search: string,
) {
  return useMemo(() => filterRoomsBySearch(rooms, search), [rooms, search])
}
