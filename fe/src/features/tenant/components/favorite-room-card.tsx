import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGetRoomImages, useRemoveRoomFavorite } from '@/features/room/hooks/use-rooms'
import {
  formatRoomCurrency,
  formatRoomFullLocation,
  getDisplayRoomImage,
  getRoomAmenityNames,
  resolveRoomImageUrl,
  roomStatusClasses,
  roomStatusLabels,
} from '@/utils/room-display'
import type { RoomFavoriteRoom } from '@/features/room/types/room.type'

export type FavoriteRoomsView = 'grid' | 'list'

type FavoriteRoomCardProps = {
  room: RoomFavoriteRoom
  view: FavoriteRoomsView
}

export function FavoriteRoomCard({ room, view }: FavoriteRoomCardProps) {
  const imagesQuery = useGetRoomImages(room._id)
  const removeFavorite = useRemoveRoomFavorite()
  const primaryImage = getDisplayRoomImage(imagesQuery.data ?? [])
  const isListView = view === 'list'
  const amenityNames = getRoomAmenityNames(room)

  return (
    <Card
      className={cn(
        'group flex',
        isListView ? 'flex-col md:flex-row' : 'flex-col',
      )}
    >
      <Link
        to={`/phong/${room._id}`}
        className={cn(
          'relative block bg-border/60',
          isListView ? 'h-48 md:h-auto md:w-64 md:shrink-0' : 'h-48',
        )}
      >
        {primaryImage ? (
          <img
            src={resolveRoomImageUrl(primaryImage.url)}
            alt={primaryImage.caption || room.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
            Chưa có ảnh đại diện
          </div>
        )}
      </Link>

      <CardContent
        className={cn(
          'flex flex-1 flex-col gap-4',
          isListView ? 'md:flex-row md:items-center md:justify-between' : '',
        )}
      >
        <div
          className={cn(
            'flex items-start gap-3',
            isListView ? 'flex-1 justify-between' : 'justify-between',
          )}
        >
          <div>
            <Link
              to={`/phong/${room._id}`}
              className="text-lg font-bold text-slate-950 transition-colors hover:text-primary"
            >
              {room.title}
            </Link>
            <p className="mt-1 flex items-start gap-1 text-sm text-slate-500">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {formatRoomFullLocation(room) || 'Chưa có địa chỉ'}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold',
              roomStatusClasses[room.status],
            )}
          >
            {roomStatusLabels[room.status]}
          </span>
        </div>

        {amenityNames.length > 0 ? (
          <div
            className={cn(
              'flex flex-wrap gap-1.5',
              isListView ? 'md:max-w-xs' : '',
            )}
          >
            {amenityNames.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                {amenity}
              </span>
            ))}
            {amenityNames.length > 3 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                +{amenityNames.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            'mt-auto flex items-center justify-between gap-3',
            isListView ? 'md:mt-0 md:shrink-0 md:flex-col md:items-end' : '',
          )}
        >
          <p className="font-bold text-primary">
            {formatRoomCurrency(room.pricePerMonth)}
            <span className="text-xs font-normal text-slate-500">/thang</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Bo luu phong yeu thich"
              disabled={removeFavorite.isPending}
              onClick={() => removeFavorite.mutate(room._id)}
              className="bg-red-500/10 text-red-600 hover:bg-red-500/15"
            >
              <Heart className="size-4 fill-red-500" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="bg-border/60">
              <Link to={`/phong/${room._id}`} aria-label="Xem chi tiet phong">
                <ArrowRight className="size-4 text-foreground" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
