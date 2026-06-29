import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BadgeDollarSign,
  Building2,
  MapPin,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/layouts/main-layout'
import { cn } from '@/lib/utils'
import { toAbsoluteUrl } from '@/seo/config'
import { Seo } from '@/seo/seo'
import { createBreadcrumbSchema } from '@/seo/schemas'
import { formatRoomType } from '@/utils/room-display'
import { RoomListCard } from '../components/room-list-card'
import { useRoomSearch } from '../hooks/use-room-search'
import { useGetRooms } from '../hooks/use-rooms'
import type { RoomSearchParams, RoomType } from '../types/room.type'

const ROOM_TYPE_PRESETS: Array<{
  value: RoomType
  label: string
  icon: typeof Building2
}> = [
  {
    value: 'STUDIO',
    label: 'Studio',
    icon: Building2,
  },
  {
    value: 'SINGLE',
    label: 'Phòng đơn',
    icon: MapPin,
  },
  {
    value: 'SHARED',
    label: 'Phòng ghép',
    icon: Users,
  },
  {
    value: 'APARTMENT',
    label: 'Căn hộ',
    icon: Building2,
  },
]

const PRICE_PRESETS = [
  { label: 'Dưới 3 triệu', minPrice: undefined, maxPrice: 3000000 },
  { label: '3 - 5 triệu', minPrice: 3000000, maxPrice: 5000000 },
  { label: '5 - 8 triệu', minPrice: 5000000, maxPrice: 8000000 },
  { label: 'Trên 8 triệu', minPrice: 8000000, maxPrice: undefined },
] as const

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

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}

function formatPriceRange(minPrice?: number, maxPrice?: number) {
  if (minPrice && maxPrice) {
    return `${formatCurrencyCompact(minPrice)} - ${formatCurrencyCompact(maxPrice)}`
  }
  if (minPrice) return `Từ ${formatCurrencyCompact(minPrice)}`
  if (maxPrice) return `Dưới ${formatCurrencyCompact(maxPrice)}`
  return null
}

export function RoomListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('q') ?? ''
  const initialCity = searchParams.get('city') ?? ''
  const initialDistrict = searchParams.get('district') ?? ''
  const initialMinPrice = searchParams.get('minPrice') ?? ''
  const initialMaxPrice = searchParams.get('maxPrice') ?? ''
  const initialRoomType = searchParams.get('roomType') ?? ''

  const [keyword, setKeyword] = useState(initialKeyword)
  const [city, setCity] = useState(initialCity)
  const [district, setDistrict] = useState(initialDistrict)
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [selectedRoomType, setSelectedRoomType] = useState(initialRoomType)

  const searchQueryParams = useMemo<RoomSearchParams>(() => {
    const q = searchParams.get('q')?.trim() || undefined
    const cityParam = searchParams.get('city')?.trim() || undefined
    const districtParam = searchParams.get('district')?.trim() || undefined
    const minPriceParam = getNumberParam(searchParams.get('minPrice'))
    const maxPriceParam = getNumberParam(searchParams.get('maxPrice'))
    const roomType = getRoomTypeParam(searchParams.get('roomType'))

    return {
      page: 1,
      limit: 10,
      status: 'AVAILABLE',
      q,
      city: cityParam,
      district: districtParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      roomType,
    }
  }, [searchParams])

  const activeQuery = useRoomSearch(searchQueryParams)
  const visibleRooms = useMemo(
    () => activeQuery.data?.data ?? [],
    [activeQuery.data?.data],
  )
  const totalRoomsQuery = useGetRooms({
    page: 1,
    limit: 1,
    status: 'AVAILABLE',
  })
  const totalAvailableRooms = totalRoomsQuery.data?.pagination.total ?? 0

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []

    if (searchQueryParams.q) labels.push(`Từ khóa: ${searchQueryParams.q}`)
    if (searchQueryParams.city) labels.push(`Thành phố: ${searchQueryParams.city}`)
    if (searchQueryParams.district) {
      labels.push(`Quận/Huyện: ${searchQueryParams.district}`)
    }
    if (searchQueryParams.roomType) {
      labels.push(`Loại phòng: ${formatRoomType(searchQueryParams.roomType)}`)
    }

    const priceRange = formatPriceRange(
      searchQueryParams.minPrice,
      searchQueryParams.maxPrice,
    )
    if (priceRange) labels.push(`Mức giá: ${priceRange}`)

    return labels
  }, [searchQueryParams])

  const seoTitle = useMemo(() => {
    if (searchQueryParams.district) {
      return `Phòng cho thuê tại ${searchQueryParams.district} | UniNest`
    }

    if (searchQueryParams.roomType) {
      return `${formatRoomType(searchQueryParams.roomType)} cho thue tai TP.HCM | UniNest`
    }

    return 'Phòng cho thuê tại TP.HCM | UniNest'
  }, [searchQueryParams.district, searchQueryParams.roomType])

  const seoDescription = useMemo(() => {
    const base =
      'Khám phá danh sách phòng trọ, studio, phòng ghép và căn hộ sẵn có trên UniNest.'

    if (activeFilterLabels.length === 0) {
      return `${base} Lọc theo giá, khu vực và loại phòng phù hợp.`
    }

    return `${base} Bộ lọc đang áp dụng: ${activeFilterLabels.join(', ')}.`
  }, [activeFilterLabels])

  const structuredData = useMemo(() => {
    const items = visibleRooms.slice(0, 10).map((room, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(`/phong/${room._id}`),
      name: room.title,
    }))

    return [
      createBreadcrumbSchema([
        { name: 'Trang chủ', path: '/' },
        { name: 'Phòng cho thuê', path: '/phong' },
      ]),
      {
        '@type': 'CollectionPage',
        name: 'Danh sách phòng cho thuê',
        url: toAbsoluteUrl('/phong'),
        description: seoDescription,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: visibleRooms.length,
          itemListElement: items,
        },
      },
    ]
  }, [seoDescription, visibleRooms])

  function commitFilters(nextParams: URLSearchParams) {
    setSearchParams(nextParams)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextParams = new URLSearchParams(searchParams)
    const trimmedKeyword = keyword.trim()
    const trimmedCity = city.trim()
    const trimmedDistrict = district.trim()
    const trimmedMinPrice = minPrice.trim()
    const trimmedMaxPrice = maxPrice.trim()

    if (trimmedKeyword) nextParams.set('q', trimmedKeyword)
    else nextParams.delete('q')

    if (trimmedCity) nextParams.set('city', trimmedCity)
    else nextParams.delete('city')

    if (trimmedDistrict) nextParams.set('district', trimmedDistrict)
    else nextParams.delete('district')

    if (trimmedMinPrice) nextParams.set('minPrice', trimmedMinPrice)
    else nextParams.delete('minPrice')

    if (trimmedMaxPrice) nextParams.set('maxPrice', trimmedMaxPrice)
    else nextParams.delete('maxPrice')

    if (selectedRoomType) nextParams.set('roomType', selectedRoomType)
    else nextParams.delete('roomType')

    commitFilters(nextParams)
  }

  function handleRoomTypeSelect(roomType: RoomType) {
    const nextValue = selectedRoomType === roomType ? '' : roomType
    setSelectedRoomType(nextValue)

    const nextParams = new URLSearchParams(searchParams)
    if (nextValue) nextParams.set('roomType', nextValue)
    else nextParams.delete('roomType')

    commitFilters(nextParams)
  }

  function handlePricePreset(min?: number, max?: number) {
    const nextMinPrice = min ? String(min) : ''
    const nextMaxPrice = max ? String(max) : ''

    setMinPrice(nextMinPrice)
    setMaxPrice(nextMaxPrice)

    const nextParams = new URLSearchParams(searchParams)
    if (nextMinPrice) nextParams.set('minPrice', nextMinPrice)
    else nextParams.delete('minPrice')

    if (nextMaxPrice) nextParams.set('maxPrice', nextMaxPrice)
    else nextParams.delete('maxPrice')

    commitFilters(nextParams)
  }

  function handleResetFilters() {
    setKeyword('')
    setCity('')
    setDistrict('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedRoomType('')
    setSearchParams(new URLSearchParams())
  }

  return (
    <MainLayout>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path="/phong"
        keywords={[
          'phong cho thue TP.HCM',
          'tim phong tro',
          'studio cho thue',
          'phong ghep',
          'UniNest',
        ]}
        structuredData={structuredData}
      />
      <section className="bg-surface px-4 py-8 md:px-6 lg:px-12 lg:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="max-w-3xl font-serif text-3xl font-bold text-foreground lg:text-5xl">
                    Tìm phòng phù hợp với bạn
                  </h1>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <p className="text-sm font-bold text-slate-900">Loại phòng</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {ROOM_TYPE_PRESETS.map((preset) => {
                    const Icon = preset.icon
                    const isActive = selectedRoomType === preset.value

                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleRoomTypeSelect(preset.value)}
                        className={cn(
                          'rounded-2xl border px-4 py-4 text-left transition-all',
                          isActive
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                            : 'border-primary/10 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white',
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-xl bg-black/5 p-2.5 text-current">
                            <Icon className="size-4" />
                          </div>
                          <span
                            className={cn(
                              'text-xs font-bold uppercase tracking-[0.14em]',
                              isActive ? 'text-white/80' : 'text-slate-400',
                            )}
                          >
                            {preset.value}
                          </span>
                        </div>
                        <p className="mt-4 text-base font-bold">{preset.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Kết quả hiển thị
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {visibleRooms.length}
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Đang mở bán
                </p>
                <p className="mt-2 text-2xl font-black text-primary">
                  {totalAvailableRooms}
                </p>
              </div>
            </div>
          </div>

          <form
            id="room-list-filters"
            className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm"
            onSubmit={handleSearch}
          >
            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Từ khóa
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-12 rounded-xl border-primary/10 bg-slate-50 pl-9 shadow-none"
                    placeholder="Tên phòng"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
              </label>


              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Quận/Huyện
                </span>
                <Input
                  className="h-12 rounded-xl border-primary/10 bg-slate-50 shadow-none"
                  placeholder="VD: Long Bình"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                />
              </label>

              <div className="flex items-end gap-3">
                <Button type="submit" className="rounded-xl px-6">
                  Áp dụng
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl border border-primary/10 px-4"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>
          </form>

          <div className="grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[28px] border border-primary/10 bg-white px-4 py-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <BadgeDollarSign className="size-4 text-primary" />
                  <p className="text-sm font-bold text-slate-900">Khoảng giá</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Chọn nhanh theo ngân sách hoặc nhập mức giá cụ thể.
                </p>

                <div className="mt-6 space-y-4">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Tối thiểu
                    </span>
                    <Input
                      inputMode="numeric"
                      className="h-11 rounded-2xl border-primary/10 bg-slate-50 shadow-none"
                      placeholder="3000000"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Tối đa
                    </span>
                    <Input
                      inputMode="numeric"
                      className="h-11 rounded-2xl border-primary/10 bg-slate-50 shadow-none"
                      placeholder="8000000"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {PRICE_PRESETS.map((preset) => {
                    const isActive =
                      String(preset.minPrice ?? '') === minPrice &&
                      String(preset.maxPrice ?? '') === maxPrice

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          handlePricePreset(preset.minPrice, preset.maxPrice)
                        }
                        className={cn(
                          'w-full rounded-2xl border px-3 py-2.5 text-left text-xs font-bold transition-colors',
                          isActive
                            ? 'border-primary bg-primary text-white'
                            : 'border-primary/10 bg-white text-slate-600 hover:border-primary/30 hover:text-primary',
                        )}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {activeFilterLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeFilterLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}

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
                  Không thể tải danh sách phòng. Vui lòng thử lại sau.
                </div>
              ) : null}

              {!activeQuery.isLoading &&
              !activeQuery.isError &&
              visibleRooms.length === 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-white p-8 text-center">
                  <p className="text-base font-bold text-slate-900">
                    Chưa có phòng phù hợp với bộ lọc hiện tại.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thử mở rộng mức giá, đổi khu vực hoặc reset preset loại phòng
                    để xem thêm lựa chọn.
                  </p>
                </div>
              ) : null}

              {!activeQuery.isLoading &&
              !activeQuery.isError &&
              visibleRooms.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleRooms.map((room) => (
                    <RoomListCard key={room._id} room={room} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
