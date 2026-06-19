import { useState } from 'react'
import { Pagination } from '@/components/common/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LandlordDashboardHeader } from '@/features/landlord'
import { BookingCard } from '../components/booking-card'
import {
  useApproveBooking,
  useDeleteBooking,
  useGetLandlordBookings,
  useRejectBooking,
} from '../hooks/use-bookings'
import { bookingStatusLabels } from '../lib/booking-display'
import type { BookingStatus } from '../types/booking.type'

const statusOptions: Array<{ value: 'ALL' | BookingStatus; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: bookingStatusLabels.PENDING },
  { value: 'APPROVED', label: bookingStatusLabels.APPROVED },
  { value: 'REJECTED', label: bookingStatusLabels.REJECTED },
  { value: 'CANCELLED', label: bookingStatusLabels.CANCELLED },
]

export function LandlordBookingsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'ALL' | BookingStatus>('ALL')
  const bookingsQuery = useGetLandlordBookings({
    page,
    limit: 10,
    status: status === 'ALL' ? undefined : status,
  })
  const approveBooking = useApproveBooking()
  const rejectBooking = useRejectBooking()
  const deleteBooking = useDeleteBooking()
  const bookings = bookingsQuery.data?.data ?? []
  const pagination = bookingsQuery.data?.pagination
  const isActionPending =
    approveBooking.isPending || rejectBooking.isPending || deleteBooking.isPending

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <LandlordDashboardHeader
          greeting="Duyệt yêu cầu đặt phòng"
          subtitle="Kiểm tra thông tin người thuê, thời gian nhận phòng và phản hồi các yêu cầu mới."
        />
        <div className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 lg:max-w-64">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as 'ALL' | BookingStatus)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {bookingsQuery.isLoading ? (
        <div className="grid gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-border/60" />
          ))}
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải danh sách đặt phòng.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
        <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có danh sách đặt phòng phù hợp.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 ? (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              mode="landlord"
              onApprove={approveBooking.mutate}
              onReject={rejectBooking.mutate}
              onDelete={deleteBooking.mutate}
              isActionPending={isActionPending}
            />
          ))}
        </div>
      ) : null}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          isDisabled={bookingsQuery.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
