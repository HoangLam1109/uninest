import type { Room, RoomImage, RoomStatus } from '../features/room/types/room.type'

type RoomLocation = Pick<Room, 'address'> &
  Partial<Pick<Room, 'ward' | 'district' | 'city'>>

export const roomCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export const roomStatusLabels: Record<RoomStatus, string> = {
  AVAILABLE: 'Còn trống',
  DEPOSITED: 'Đã cọc',
  RENTED: 'Đã thuê',
  MAINTENANCE: 'Bảo trì',
}

export const roomStatusClasses: Record<RoomStatus, string> = {
  AVAILABLE: 'bg-green-500/10 text-green-700',
  DEPOSITED: 'bg-amber-500/10 text-amber-700',
  RENTED: 'bg-primary/10 text-primary',
  MAINTENANCE: 'bg-red-500/10 text-red-600',
}

export function formatRoomCurrency(value?: number) {
  return roomCurrencyFormatter.format(value ?? 0)
}

export function formatRoomLocation(room: RoomLocation) {
  return (
    [room.ward, room.district, room.city].filter(Boolean).join(', ') ||
    room.address
  )
}

export function formatRoomFullLocation(room: RoomLocation) {
  return [room.address, room.ward, room.district, room.city]
    .filter(Boolean)
    .join(', ')
}

export function getPrimaryRoomImage(images: RoomImage[]) {
  return images.find((image) => image.isPrimary)
}

export function getDisplayRoomImage(images: RoomImage[]) {
  return getPrimaryRoomImage(images) ?? images[0]
}
