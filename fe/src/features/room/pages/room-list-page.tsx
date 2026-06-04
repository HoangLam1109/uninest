import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/layouts/main-layout'
import { useAuthStore } from '@/stores/auth.store'
import {
  useAddRoomFavorite,
  useCheckRoomFavorite,
  useGetRoomImages,
  useGetRooms,
  useRemoveRoomFavorite,
} from '../hooks/use-rooms'
import {
  formatRoomCurrency,
  formatRoomLocation,
  getPrimaryRoomImage,
} from '../../../utils/room-display'
import type { Room } from '../types/room.type'

function RoomListCard({ room }: { room: Room }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const imagesQuery = useGetRoomImages(room._id)
  const favoriteQuery = useCheckRoomFavorite(room._id, Boolean(accessToken))
  const addFavorite = useAddRoomFavorite()
  const removeFavorite = useRemoveRoomFavorite()
  const primaryImage = getPrimaryRoomImage(imagesQuery.data ?? [])
  const isFavorited = favoriteQuery.data?.isFavorited ?? false
  const isFavoritePending =
    favoriteQuery.isFetching || addFavorite.isPending || removeFavorite.isPending

  function handleToggleFavorite() {
    if (!accessToken) {
      toast.error('Vui long dang nhap de luu phong yeu thich')
      return
    }

    if (isFavorited) {
      removeFavorite.mutate(room._id)
      return
    }

    addFavorite.mutate(room._id)
  }

  return (
    <Card className="group relative flex flex-col overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isFavorited ? 'Bo luu phong yeu thich' : 'Luu phong yeu thich'}
        aria-pressed={isFavorited}
        disabled={isFavoritePending}
        onClick={handleToggleFavorite}
        className="absolute right-3 top-3 z-10 bg-white/90 text-foreground shadow-sm hover:bg-white"
      >
        <Heart
          className={`size-5 ${
            isFavorited ? 'fill-red-500 text-red-500' : 'text-foreground'
          }`}
        />
      </Button>
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
          <span>{room.status}</span>
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

export function RoomListPage() {
  const roomsQuery = useGetRooms({
    page: 1,
    limit: 12,
    status: 'AVAILABLE',
  })
  const rooms = roomsQuery.data?.data ?? []

  return (
    <MainLayout>
      <section className="bg-surface px-6 py-12 lg:px-20 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                Danh sach phong
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-foreground lg:text-5xl">
                Tim phong phu hop voi ban
              </h1>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-lg border-primary/10 bg-white pl-9 shadow-none"
                placeholder="Tim theo ten, dia chi..."
                disabled
              />
            </div>
          </div>

          {roomsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-96 animate-pulse rounded-xl bg-border/60"
                />
              ))}
            </div>
          ) : null}

          {roomsQuery.isError ? (
            <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
              Khong the tai danh sach phong.
            </div>
          ) : null}

          {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
            <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-muted-foreground">
              Chua co phong trong de hien thi.
            </div>
          ) : null}

          {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <RoomListCard key={room._id} room={room} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </MainLayout>
  )
}
