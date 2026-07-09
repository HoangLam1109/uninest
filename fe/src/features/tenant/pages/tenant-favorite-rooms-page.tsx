import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Grid3X3, Heart, List, Search } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useGetTenantFavoriteRooms } from '@/features/room/hooks/use-rooms'
import { useFilteredRooms } from '@/features/room/hooks/use-filtered-rooms'
import type {
  RoomFavorite,
  RoomFavoriteRoom,
  RoomStatus,
} from '@/features/room/types/room.type'
import {
  FavoriteRoomCard,
  type FavoriteRoomsView,
} from '../components/favorite-room-card'

const defaultSummary: Record<RoomStatus, number> = {
  AVAILABLE: 0,
  DEPOSITED: 0,
  RENTED: 0,
  MAINTENANCE: 0,
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

  const favoriteRooms = useMemo(
    () =>
      (favorites ?? [])
        .map(getFavoriteRoom)
        .filter((room): room is RoomFavoriteRoom => Boolean(room)),
    [favorites],
  )
  const visibleRooms = useFilteredRooms(favoriteRooms, search)
  const summary = useMemo(
    () =>
      visibleRooms.reduce(
        (acc, room) => {
          acc[room.status] += 1
          return acc
        },
        { ...defaultSummary },
      ),
    [visibleRooms],
  )

  const summaryItems = [
    {
      label: 'Đã lưu',
      value: pagination?.total ?? favoriteRooms.length,
      icon: Heart,
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Khớp tìm kiếm',
      value: visibleRooms.length,
      icon: Search,
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-slate-200 text-slate-700',
    },
    {
      label: 'Còn trống',
      value: summary.AVAILABLE,
      icon: CheckCircle2,
      valueClassName: 'text-green-700',
      iconClassName: 'bg-green-500/10 text-green-700',
    },
    {
      label: 'Chưa thể đặt ngay',
      value: summary.DEPOSITED + summary.RENTED + summary.MAINTENANCE,
      icon: Clock3,
      valueClassName: 'text-amber-700',
      iconClassName: 'bg-amber-500/10 text-amber-700',
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 2xl:mx-0 2xl:max-w-none">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
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
              aria-label="Hiển thị dạng danh sách"
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

      {!favoritesQuery.isError ? (
        <section className="rounded-[32px] border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Tổng hợp phòng yêu thích</h2>
            {!favoritesQuery.isLoading ? (
              <p className="mt-1 text-sm text-slate-500">
                Số liệu được tính theo danh sách đang hiển thị hiện tại.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {favoritesQuery.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl bg-border/60"
                  />
                ))
              : summaryItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <article
                      key={item.label}
                      className="rounded-2xl border border-primary/10 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {item.label}
                        </p>
                        <span
                          className={`flex size-9 items-center justify-center rounded-xl ${item.iconClassName}`}
                        >
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <p className={`mt-3 text-2xl font-bold ${item.valueClassName}`}>
                        {item.value}
                      </p>
                    </article>
                  )
                })}
          </div>
        </section>
      ) : null}

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
          Không thể tải phòng yêu thích. Vui lòng thử lại sau.
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

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          isDisabled={favoritesQuery.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
