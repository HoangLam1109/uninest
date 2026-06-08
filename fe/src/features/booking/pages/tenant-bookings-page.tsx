import { useState } from 'react'
import { Pagination } from '@/components/common/pagination'
import { BookingCard } from '../components/booking-card'
import { useCancelBooking, useGetTenantBookings } from '../hooks/use-bookings'

export function TenantBookingsPage() {
  const [page, setPage] = useState(1)
  const bookingsQuery = useGetTenantBookings({ page, limit: 10 })
  const cancelBooking = useCancelBooking()
  const bookings = bookingsQuery.data?.data ?? []
  const pagination = bookingsQuery.data?.pagination

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase text-primary">
          Booking của tôi
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
          Theo dõi yêu cầu đặt phòng
        </h1>
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
          Ban chưa có người đặt phòng.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 ? (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              mode="tenant"
              onCancel={cancelBooking.mutate}
              isActionPending={cancelBooking.isPending}
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
