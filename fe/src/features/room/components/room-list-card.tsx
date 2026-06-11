import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatRoomCurrency,
  formatRoomLocation,
  getPrimaryRoomImage,
  roomStatusClasses,
  roomStatusLabels,
} from '@/utils/room-display'
import { useGetRoomImages } from '../hooks/use-rooms'
import type { Room } from '../types/room.type'
import { RoomFavoriteButton } from './room-favorite-button'

type RoomListCardProps = {
  room: Room
}

export function RoomListCard({ room }: RoomListCardProps) {
  const imagesQuery = useGetRoomImages(room._id)
  const primaryImage = getPrimaryRoomImage(imagesQuery.data ?? [])

  return (
    <Card className="group relative flex flex-col overflow-hidden">
      <RoomFavoriteButton roomId={room._id} />
      <Link to={`/phong/${room._id}`} className="relative block h-56 bg-border/60">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.caption || room.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
            Chua co anh dai dien
          </div>
        )}
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
            {formatRoomLocation(room)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span>{room.areaSqm ?? 0} m2</span>
          <span>{room.maxOccupants} nguoi</span>
          <span>{room.roomType ?? 'Chua chon'}</span>
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${roomStatusClasses[room.status]}`}
          >
            {roomStatusLabels[room.status]}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-primary">
            {formatRoomCurrency(room.pricePerMonth)}
            <span className="text-xs font-normal text-muted-foreground">/thang</span>
          </p>
          <Button asChild variant="ghost" size="icon" className="bg-border/60">
            <Link to={`/phong/${room._id}`} aria-label="Xem chi tiet phong">
              <ArrowRight className="size-4 text-foreground" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
