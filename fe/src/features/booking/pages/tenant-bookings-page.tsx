import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookingCard } from '../components/booking-card'
import { useCancelBooking, useGetTenantBookings } from '../hooks/use-bookings'

export function TenantBookingsPage() {
  const [page, setPage] = useState(1)
  const bookingsQuery = useGetTenantBookings({ page, limit: 10 })
  const cancelBooking = useCancelBooking()
  const bookings = bookingsQuery.data?.data ?? []
  const pagination = bookingsQuery.data?.pagination

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase text-primary">
          Booking cua toi
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
          Theo doi yeu cau dat phong
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
          Khong the tai danh sach booking.
        </div>
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
        <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-slate-500">
          Ban chua co booking nao.
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

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-slate-500">
            Trang {pagination.page}/{pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            disabled={page <= 1 || bookingsQuery.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="bg-white"
          >
            Truoc
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={bookingsQuery.isFetching || page >= pagination.totalPages}
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
