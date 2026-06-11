import { useMemo, useState } from 'react'
import { Grid3X3, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useGetTenantFavoriteRooms } from '@/features/room/hooks/use-rooms'
import type { RoomFavorite, RoomFavoriteRoom } from '@/features/room/types/room.type'
import {
  FavoriteRoomCard,
  type FavoriteRoomsView,
} from '../components/favorite-room-card'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getFavoriteRoom(favorite: RoomFavorite) {
  return typeof favorite.roomId === 'string' ? null : favorite.roomId
}

export function TenantFavoriteRoomsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<FavoriteRoomsView>('grid')
  const favoritesQuery = useGetTenantFavoriteRooms({ page, limit: 9 })
  const favorites = favoritesQuery.data?.data
  const pagination = favoritesQuery.data?.pagination

  const visibleRooms = useMemo(() => {
    const keyword = normalize(search)
    return (favorites ?? [])
      .map(getFavoriteRoom)
      .filter((room): room is RoomFavoriteRoom => Boolean(room))
      .filter((room) => {
        if (!keyword) return true
        return [room.title, room.address, room.district ?? '', room.city ?? ''].some(
          (value) => normalize(value).includes(keyword),
        )
      })
  }, [favorites, search])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">
            Phòng yêu thích
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
            Quản lý phòng yêu thích
          </h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 border-primary/10 bg-white pl-9 shadow-none"
              placeholder="Tìm theo tên, địa chỉ"
            />
          </div>
          <div
            className="grid h-11 grid-cols-2 rounded-lg border border-primary/10 bg-white p-1"
            aria-label="Kieu hien thi"
          >
            <button
              type="button"
              aria-label="Hien thi dang luoi"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={cn(
                'flex items-center justify-center rounded-md px-3 text-sm font-bold transition-colors',
                view === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              <Grid3X3 className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Hien thi dang danh sach"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              className={cn(
                'flex items-center justify-center rounded-md px-3 text-sm font-bold transition-colors',
                view === 'list'
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {favoritesQuery.isLoading ? (
        <div
          className={cn(
            'grid gap-5',
            view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : '',
          )}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'animate-pulse rounded-xl bg-border/60',
                view === 'grid' ? 'h-80' : 'h-48',
              )}
            />
          ))}
        </div>
      ) : null}

      {favoritesQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Khong the tai danh sach phong yeu thich.
        </div>
      ) : null}

      {!favoritesQuery.isLoading &&
      !favoritesQuery.isError &&
      visibleRooms.length === 0 ? (
        <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có phòng yêu thích phù hợp.
        </div>
      ) : null}

      {!favoritesQuery.isLoading &&
      !favoritesQuery.isError &&
      visibleRooms.length > 0 ? (
        <div
          className={cn(
            'grid gap-5',
            view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : '',
          )}
        >
          {visibleRooms.map((room) => (
            <FavoriteRoomCard key={room._id} room={room} view={view} />
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-slate-500">
            Trang {pagination.page}/{pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            disabled={page <= 1 || favoritesQuery.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="bg-white"
          >
            Truoc
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={
              favoritesQuery.isFetching ||
              page >= pagination.totalPages
            }
            onClick={() =>
              setPage((current) => Math.min(pagination.totalPages, current + 1))
            }
            className="bg-white"
          >
            Sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}
