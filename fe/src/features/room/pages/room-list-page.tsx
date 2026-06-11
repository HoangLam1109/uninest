import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/layouts/main-layout'
import { RoomListCard } from '../components/room-list-card'
import { useGetRooms, useSearchRooms } from '../hooks/use-rooms'
import type { RoomSearchParams, RoomType } from '../types/room.type'

function getNumberParam(value: string | null) {
  if (!value) return undefined
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function getRoomTypeParam(value: string | null): RoomType | undefined {
  if (
    value === 'STUDIO' ||
    value === 'SINGLE' ||
    value === 'SHARED' ||
    value === 'APARTMENT'
  ) {
    return value
  }
  return undefined
}

export function RoomListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('q') ?? ''
  const [keyword, setKeyword] = useState(initialKeyword)

  const searchQueryParams = useMemo<RoomSearchParams>(() => {
    const q = searchParams.get('q')?.trim() || undefined
    const minPrice = getNumberParam(searchParams.get('minPrice'))
    const maxPrice = getNumberParam(searchParams.get('maxPrice'))
    const roomType = getRoomTypeParam(searchParams.get('roomType'))

    return {
      page: 1,
      limit: 12,
      status: 'AVAILABLE',
      q,
      minPrice,
      maxPrice,
      roomType,
    }
  }, [searchParams])

  const hasSearchCriteria = Boolean(
    searchQueryParams.q ||
      searchQueryParams.minPrice ||
      searchQueryParams.maxPrice ||
      searchQueryParams.roomType,
  )

  const roomsQuery = useGetRooms(
    {
      page: 1,
      limit: 12,
      status: 'AVAILABLE',
    },
    !hasSearchCriteria,
  )
  const searchRoomsQuery = useSearchRooms(searchQueryParams, hasSearchCriteria)
  const activeQuery = hasSearchCriteria ? searchRoomsQuery : roomsQuery
  const rooms = activeQuery.data?.data ?? []

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextParams = new URLSearchParams(searchParams)
    const trimmedKeyword = keyword.trim()

    if (trimmedKeyword) {
      nextParams.set('q', trimmedKeyword)
    } else {
      nextParams.delete('q')
    }

    setSearchParams(nextParams)
  }

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
            <form className="relative w-full lg:max-w-sm" onSubmit={handleSearch}>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-lg border-primary/10 bg-white pl-9 shadow-none"
                placeholder="Tim theo ten, dia chi..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </form>
          </div>

          {activeQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-96 animate-pulse rounded-xl bg-border/60"
                />
              ))}
            </div>
          ) : null}

          {activeQuery.isError ? (
            <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
              Khong the tai danh sach phong. Vui long thu lai sau.
            </div>
          ) : null}

          {!activeQuery.isLoading && !activeQuery.isError && rooms.length === 0 ? (
            <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-muted-foreground">
              Chua co phong phu hop de hien thi.
            </div>
          ) : null}

          {!activeQuery.isLoading && !activeQuery.isError && rooms.length > 0 ? (
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
