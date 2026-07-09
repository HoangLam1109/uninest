import { CheckCircle2, Clock3, FileText, SlidersHorizontal, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
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

const defaultSummary: Record<BookingStatus, number> = {
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
}

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

  const summary = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          acc[booking.status] += 1
          return acc
        },
        { ...defaultSummary },
      ),
    [bookings],
  )

  const summaryItems = [
    {
      label: 'Kết quả hiện có',
      value: pagination?.total ?? bookings.length,
      icon: FileText,
      valueClassName: 'text-slate-900',
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: bookingStatusLabels.PENDING,
      value: summary.PENDING,
      icon: Clock3,
      valueClassName: 'text-amber-700',
      iconClassName: 'bg-amber-500/10 text-amber-700',
    },
    {
      label: bookingStatusLabels.APPROVED,
      value: summary.APPROVED,
      icon: CheckCircle2,
      valueClassName: 'text-green-700',
      iconClassName: 'bg-green-500/10 text-green-700',
    },
    {
      label: 'Đã kết thúc',
      value: summary.REJECTED + summary.CANCELLED,
      icon: XCircle,
      valueClassName: 'text-red-600',
      iconClassName: 'bg-red-500/10 text-red-600',
    },
  ]

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-[32px] border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <LandlordDashboardHeader
            greeting="Duyệt yêu cầu đặt phòng"
            subtitle="Kiểm tra thông tin người thuê, thời gian nhận phòng và phản hồi các yêu cầu mới."
          />

          <div className="w-full rounded-2xl border border-primary/10 bg-slate-50 p-3 lg:max-w-xs">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <SlidersHorizontal className="size-4 text-primary" />
              Bộ lọc trạng thái
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as 'ALL' | BookingStatus)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Lọc theo trạng thái" className="bg-white">
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
        </div>
      </section>

      {!bookingsQuery.isError ? (
        <section className="rounded-[32px] border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Tổng hợp booking</h2>
            {!bookingsQuery.isLoading ? (
              <p className="mt-1 text-sm text-slate-500">
                Số liệu được tính theo bộ lọc hiện tại.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {bookingsQuery.isLoading
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

      {bookingsQuery.isLoading ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[28px] bg-border/60" />
          ))}
        </section>
      ) : null}

      {bookingsQuery.isError ? (
        <div className="rounded-[28px] border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải danh sách đặt phòng.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
        <div className="rounded-[28px] border border-primary/10 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có danh sách đặt phòng phù hợp.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 ? (
        <section className="rounded-[32px] border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Danh sách booking</h2>
              <p className="mt-1 text-sm text-slate-500">
                Hiển thị từng yêu cầu theo dạng card để thao tác duyệt nhanh hơn.
              </p>
            </div>
            {pagination ? (
              <p className="text-sm text-slate-500">
                Trang {pagination.page}/{pagination.totalPages}
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
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
        </section>
      ) : null}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          isDisabled={bookingsQuery.isFetching}
          className="justify-center sm:justify-end"
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
