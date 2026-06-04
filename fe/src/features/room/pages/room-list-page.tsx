import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/layouts/main-layout'
import { RoomListCard } from '../components/room-list-card'
import { useGetRooms } from '../hooks/use-rooms'

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
              Khong the tai danh sach phong. Vui long thu lai sau.
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
