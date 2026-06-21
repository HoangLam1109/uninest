import { useMemo } from 'react'
import {
  BadgeDollarSign,
  Edit3,
  Home,
  ImageIcon,
  MapPin,
  Ruler,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LandlordDashboardHeader } from '@/features/landlord'
import { useAuthStore } from '@/stores/auth.store'
import {
  useDeleteRoom,
  useGetMyRooms,
  useGetRoomById,
  useGetRoomImages,
  useUpdateRoom,
} from '../hooks/use-rooms'
import { useFilteredRooms } from '../hooks/use-filtered-rooms'
import {
  formatRoomCurrency,
  formatRoomType,
  getDisplayRoomImage,
  getRoomAmenityNames,
  resolveRoomImageUrl,
  roomStatusClasses,
  roomStatusLabels,
} from '../../../utils/room-display'
import { useRoomUiStore, type RoomSortOption } from '../stores/room-ui.store'
import type { Room, RoomPayload, RoomStatus } from '../types/room.type'
import { RoomFormModal } from './room-form-modal'

function getRoomLandlordId(room: Room) {
  if (typeof room.landlordId === 'string') return room.landlordId
  return room.landlordId?._id
}

function sortRooms(rooms: Room[], sort: RoomSortOption) {
  return [...rooms].sort((first, second) => {
    if (sort === 'price-asc') return first.pricePerMonth - second.pricePerMonth
    if (sort === 'price-desc') return second.pricePerMonth - first.pricePerMonth
    if (sort === 'title-asc') return first.title.localeCompare(second.title)

    const firstTime = new Date(first.createdAt ?? 0).getTime()
    const secondTime = new Date(second.createdAt ?? 0).getTime()
    return sort === 'oldest' ? firstTime - secondTime : secondTime - firstTime
  })
}

function RoomManagementCard({
  room,
  isDeleting,
  onEdit,
  onDelete,
}: {
  room: Room
  isDeleting: boolean 
  onEdit: (roomId: string) => void
  onDelete: (roomId: string) => void
}) {
  const imagesQuery = useGetRoomImages(room._id)
  const primaryImage = getDisplayRoomImage(imagesQuery.data ?? [])
  const amenityNames = getRoomAmenityNames(room)
  const location = [room.district, room.city].filter(Boolean).join(', ')

  return (
    <article className="flex min-h-full flex-col overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="relative bg-slate-100">
        <AspectRatio ratio={16 / 9}>
          {primaryImage ? (
            <img
              src={resolveRoomImageUrl(primaryImage.url)}
              alt={primaryImage.caption || room.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <ImageIcon className="size-7 text-slate-300" />
              Chưa có ảnh phòng
            </div>
          )}
        </AspectRatio>
        <span
          className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm ${roomStatusClasses[room.status]}`}
        >
          {roomStatusLabels[room.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold text-slate-900">
              {room.title}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
              <Home className="size-3.5 text-primary" />
              {formatRoomType(room.roomType)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2.5 text-sm text-slate-600">
          <div className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="line-clamp-2">{room.address}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {location || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Ruler className="size-3.5" />
                Diện tích
              </p>
              <p className="mt-1 font-bold text-slate-900">{room.areaSqm ?? 0} m2</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users className="size-3.5" />
                Sốm người thuê
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {room.maxOccupants} người
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2">
          <p className="inline-flex items-center gap-1.5 text-base font-black text-slate-900">
            <BadgeDollarSign className="size-4 text-primary" />
            {formatRoomCurrency(room.pricePerMonth)}
          </p>
          {room.depositAmount ? (
            <p className="mt-1 text-xs font-medium text-slate-500">
              Cọc {formatRoomCurrency(room.depositAmount)}
            </p>
          ) : null}
        </div>

        {amenityNames.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {amenityNames.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
              >
                {amenity}
              </span>
            ))}
            {amenityNames.length > 3 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                +{amenityNames.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              room.isPublished
                ? 'bg-green-50 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {room.isPublished ? 'Đang hiển thị' : 'Bản nháp'}
          </span>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Sửa phòng"
              onClick={() => onEdit(room._id)}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Xóa phòng"
              disabled={isDeleting}
              onClick={() => onDelete(room._id)}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function RoomManagement() {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const search = useRoomUiStore((state) => state.search)
  const status = useRoomUiStore((state) => state.status)
  const city = useRoomUiStore((state) => state.city)
  const district = useRoomUiStore((state) => state.district)
  const sort = useRoomUiStore((state) => state.sort)
  const page = useRoomUiStore((state) => state.page)
  const formOpen = useRoomUiStore((state) => state.modalOpen)
  const editingRoomId = useRoomUiStore((state) => state.editingRoomId)
  const setSearch = useRoomUiStore((state) => state.setSearch)
  const setStatus = useRoomUiStore((state) => state.setStatus)
  const setDistrict = useRoomUiStore((state) => state.setDistrict)
  const setSort = useRoomUiStore((state) => state.setSort)
  const setPage = useRoomUiStore((state) => state.setPage)
  const openEditModal = useRoomUiStore((state) => state.openEditModal)
  const closeModal = useRoomUiStore((state) => state.closeModal)

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      status: status || undefined,
      city: city.trim() || undefined,
      district: district.trim() || undefined,
    }),
    [city, district, page, status],
  )

  const roomsQuery = useGetMyRooms(params)
  const roomDetailQuery = useGetRoomById(
    editingRoomId,
    formOpen && Boolean(editingRoomId),
  )
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()

  const rooms = useMemo(() => {
    const data = roomsQuery.data?.data ?? []
    if (!currentUserId) return []
    return data.filter((room) => getRoomLandlordId(room) === currentUserId)
  }, [currentUserId, roomsQuery.data?.data])
  const matchedRooms = useFilteredRooms(rooms, search)
  const displayedRooms = useMemo(
    () => sortRooms(matchedRooms, sort),
    [matchedRooms, sort],
  )
  const editingRoom =
    roomDetailQuery.data ??
    rooms.find((room) => room._id === editingRoomId) ??
    null
  const pagination = roomsQuery.data?.pagination

  const summary = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        acc.total += 1
        acc[room.status] += 1
        return acc
      },
      { total: 0, AVAILABLE: 0, DEPOSITED: 0, RENTED: 0, MAINTENANCE: 0 },
    )
  }, [rooms])

  const handleSubmit = (payload: RoomPayload) => {
    if (editingRoomId) {
      updateRoom.mutate(
        { id: editingRoomId, payload },
        { onSuccess: closeModal },
      )
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      <LandlordDashboardHeader
        greeting="Quản lý phòng"
        subtitle="Theo dõi trạng thái, giá thuê và thông tin hiển thị của từng phòng."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <article className="rounded-xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Tổng phòng</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pagination?.total ?? summary.total}
          </p>
        </article>
        <article className="rounded-xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Còn trống</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {summary.AVAILABLE}
          </p>
        </article>
        <article className="rounded-xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Đã cọc</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.DEPOSITED}
          </p>
        </article>
        <article className="rounded-xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Đã thuê</p>
          <p className="mt-2 text-2xl font-bold text-primary">{summary.RENTED}</p>
        </article>
        <article className="rounded-xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Bảo trì</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {summary.MAINTENANCE}
          </p>
        </article>
      </div>

      <section className="rounded-xl border border-primary/10 bg-white">
        <div className="border-b border-primary/10 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="sm:col-span-2 lg:col-span-1" htmlFor="rooms-search">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Tìm kiếm
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="rooms-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                  placeholder="Tên phòng, địa chỉ..."
                />
              </div>
            </label>

            <label htmlFor="rooms-status">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Trạng thái
              </span>
              <select
                id="rooms-status"
                className="h-10 w-full rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(event) => setStatus(event.target.value as RoomStatus | '')}
              >
                <option value="">Tất cả</option>
                <option value="AVAILABLE">Còn trống</option>
                <option value="DEPOSITED">Đã cọc</option>
                <option value="RENTED">Đã thuê</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </label>

            <label htmlFor="rooms-district">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Quận/Huyện
              </span>
              <Input
                id="rooms-district"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="h-10 border border-primary/10 px-3 text-sm shadow-none"
                placeholder="VD: Cầu Giấy"
              />
            </label>

            <label htmlFor="rooms-sort">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Sắp xếp
              </span>
              <select
                id="rooms-sort"
                className="h-10 w-full rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={sort}
                onChange={(event) => setSort(event.target.value as RoomSortOption)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="title-asc">Tên A-Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="p-4">
          {roomsQuery.isLoading ? (
            <div className="rounded-xl border border-dashed border-primary/20 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              Đang tải danh sách phòng...
            </div>
          ) : null}

          {roomsQuery.isError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-12 text-center text-sm font-semibold text-red-600">
              Không thể tải danh sách phòng.
            </div>
          ) : null}

          {!roomsQuery.isLoading &&
          !roomsQuery.isError &&
          displayedRooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-primary/20 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              Chưa có phòng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : null}

          {!roomsQuery.isLoading && !roomsQuery.isError && displayedRooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {displayedRooms.map((room) => (
                <RoomManagementCard
                  key={room._id}
                  room={room}
                  isDeleting={deleteRoom.isPending}
                  onEdit={openEditModal}
                  onDelete={(roomId) => deleteRoom.mutate(roomId)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <Pagination
          page={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 1}
          isDisabled={roomsQuery.isFetching}
          showWhenSinglePage
          buttonVariant="outline"
          buttonClassName=""
          className="flex flex-col gap-3 border-t border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          controlsClassName="gap-2"
          pageClassName="text-slate-600"
          pageSeparator=" / "
          previousLabel="Trước"
          onPageChange={setPage}
        />
      </section>

      <RoomFormModal
        open={formOpen}
        room={editingRoom}
        isPending={updateRoom.isPending || roomDetailQuery.isFetching}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
