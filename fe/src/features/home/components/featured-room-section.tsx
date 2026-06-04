import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useGetRoomImages,
  useGetRooms,
} from '@/features/room/hooks/use-rooms'
import type { Room, RoomImage } from '@/features/room/types/room.type'
import { images } from '../data'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatLocation(room: Room) {
  return (
    [room.ward, room.district, room.city].filter(Boolean).join(', ') ||
    room.address
  )
}

function getPrimaryImage(images: RoomImage[]) {
  return images.find((image) => image.isPrimary)
}

type FeaturedRoomCardProps = {
  room: Room
  fallbackImage: string
}

function FeaturedRoomCard({ room, fallbackImage }: FeaturedRoomCardProps) {
  const imagesQuery = useGetRoomImages(room._id)
  const primaryImage = getPrimaryImage(imagesQuery.data ?? [])
  const imageUrl = primaryImage?.url ?? fallbackImage

  return (
    <Card className="group flex flex-col">
      <Link to={`/phong/${room._id}`} className="relative block h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={primaryImage?.caption || room.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {room.isPublished ? (
          <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[10px] font-bold text-white">
            Nổi bật
          </span>
        ) : null}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div>
          <Link
            to={`/phong/${room._id}`}
            className="text-lg font-bold text-foreground transition-colors hover:text-primary"
          >
            {room.title}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {formatLocation(room)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p>
            <span className="text-lg font-bold text-primary">
              {currencyFormatter.format(room.pricePerMonth)}
            </span>
            <span className="text-xs text-muted-foreground">/thang</span>
          </p>
          <Button asChild variant="ghost" size="icon" className="bg-border/60">
            <Link to={`/phong/${room._id}`} aria-label="Xem chi tiet">
              <ArrowRight className="size-4 text-foreground" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function FeaturedRoomsSection() {
  const params = useMemo(
    () => ({
      page: 1,
      limit: 4,
      status: 'AVAILABLE' as const,
    }),
    [],
  )
  const roomsQuery = useGetRooms(params)
  const rooms = roomsQuery.data?.data ?? []

  return (
    <section id="rooms" className="bg-surface px-6 py-16 lg:px-20 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                Gợi ý cho bạn
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground lg:text-4xl">
              Danh mục phòng nổi bật
            </h2>
          </div>
          <Link
            to="/phong"
            className="inline-flex items-center gap-1 text-base font-bold text-primary transition-opacity hover:opacity-80"
          >
            Xem tất cả
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {roomsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-xl bg-border/60"
              />
            ))}
          </div>
        ) : null}

        {roomsQuery.isError ? (
          <div className="rounded-xl border border-primary/10 bg-white p-6 text-center text-sm text-red-600">
            Không thể tải danh sách phòng nổi bật.
          </div>
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
          <div className="rounded-xl border border-primary/10 bg-white p-6 text-center text-sm text-muted-foreground">
            Chưa có phòng nổi bật để hiển thị.
          </div>
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {rooms.map((room, index) => (
              <FeaturedRoomCard
                key={room._id}
                room={room}
                fallbackImage={images.rooms[index % images.rooms.length]}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
