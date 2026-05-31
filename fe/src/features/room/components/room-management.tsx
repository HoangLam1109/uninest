import { useMemo, useState } from 'react'
import {
  BadgeDollarSign,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LandlordDashboardHeader } from '@/features/landlord'
import {
  useCreateRoom,
  useDeleteRoom,
  useGetRoomById,
  useGetRooms,
  useUpdateRoom,
} from '../hooks/use-rooms'
import type { Room, RoomPayload, RoomStatus } from '../types/room.type'
import { RoomFormModal } from './room-form-modal'

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: 'Còn trống',
  RENTED: 'Đã thuê',
  MAINTENANCE: 'Bảo trì',
}

const statusClasses: Record<RoomStatus, string> = {
  AVAILABLE: 'bg-green-500/10 text-green-700',
  RENTED: 'bg-primary/10 text-primary',
  MAINTENANCE: 'bg-red-500/10 text-red-600',
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatCurrency(value?: number) {
  return currencyFormatter.format(value ?? 0)
}

export function RoomManagement() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<RoomStatus | ''>('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

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

  const roomsQuery = useGetRooms(params)
  const roomDetailQuery = useGetRoomById(
    editingRoomId,
    formOpen && Boolean(editingRoomId),
  )
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()

  const rooms = roomsQuery.data?.data ?? []
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
      { total: 0, AVAILABLE: 0, RENTED: 0, MAINTENANCE: 0 },
    )
  }, [rooms])

  const closeForm = () => {
    setFormOpen(false)
    setEditingRoomId(null)
  }

  const openCreateForm = () => {
    setEditingRoomId(null)
    setFormOpen(true)
  }

  const openEditForm = (room: Room) => {
    setEditingRoomId(room._id)
    setFormOpen(true)
  }

  const handleSubmit = (payload: RoomPayload) => {
    if (editingRoomId) {
      updateRoom.mutate(
        { id: editingRoomId, payload },
        { onSuccess: closeForm },
      )
      return
    }

    createRoom.mutate(payload, { onSuccess: closeForm })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      <LandlordDashboardHeader
        greeting="Quản lý phòng"
        subtitle="Theo dõi trạng thái, giá thuê và thông tin hiển thị của từng phòng."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="flex flex-col gap-3 border-b border-primary/10 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-3 lg:flex-1">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Trạng thái
              </span>
              <select
                className="h-10 w-full rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(event) => {
                  setPage(1)
                  setStatus(event.target.value as RoomStatus | '')
                }}
              >
                <option value="">Tất cả</option>
                <option value="AVAILABLE">Còn trống</option>
                <option value="RENTED">Đã thuê</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Thành phố
              </span>
              <Input
                value={city}
                onChange={(event) => {
                  setPage(1)
                  setCity(event.target.value)
                }}
                className="h-10 border border-primary/10 px-3 text-sm shadow-none"
                placeholder="VD: Hà Nội"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Quận/Huyện
              </span>
              <Input
                value={district}
                onChange={(event) => {
                  setPage(1)
                  setDistrict(event.target.value)
                }}
                className="h-10 border border-primary/10 px-3 text-sm shadow-none"
                placeholder="VD: Cầu Giấy"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            <Button type="button" onClick={openCreateForm}>
              <Plus className="size-4" />
              Thêm phòng
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Phòng</th>
                <th className="px-4 py-3 font-semibold">Vị trí</th>
                <th className="px-4 py-3 font-semibold">Giá thuê</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Hiển thị</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {roomsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Đang tải danh sách phòng...
                  </td>
                </tr>
              ) : null}

              {roomsQuery.isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-red-600">
                    Không thể tải danh sách phòng.
                  </td>
                </tr>
              ) : null}

              {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Chưa có phòng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : null}

              {rooms.map((room) => (
                <tr key={room._id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{room.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {room.roomType ?? 'Chưa chọn'} · {room.areaSqm ?? 0} m2 ·{' '}
                      {room.maxOccupants} người
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <p>{room.address}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[room.district, room.city].filter(Boolean).join(', ') ||
                        'Chưa cập nhật'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <BadgeDollarSign className="size-4 text-primary" />
                      {formatCurrency(room.pricePerMonth)}
                    </p>
                    {room.depositAmount ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Cọc {formatCurrency(room.depositAmount)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${statusClasses[room.status]}`}
                    >
                      {statusLabels[room.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {room.isPublished ? 'Đang hiển thị' : 'Bản nháp'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Sửa phòng"
                        onClick={() => openEditForm(room)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Xóa phòng"
                        disabled={deleteRoom.isPending}
                        onClick={() => deleteRoom.mutate(room._id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-primary/10 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Trang {pagination?.page ?? page} / {pagination?.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || roomsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={
                roomsQuery.isFetching ||
                Boolean(pagination && page >= pagination.totalPages)
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </section>

      <RoomFormModal
        open={formOpen}
        room={editingRoom}
        isPending={
          createRoom.isPending ||
          updateRoom.isPending ||
          roomDetailQuery.isFetching
        }
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
