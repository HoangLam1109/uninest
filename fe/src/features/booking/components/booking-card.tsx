import { CalendarDays, CheckCircle2, Home, Mail, Phone, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Booking } from '../types/booking.type'
import {
  bookingStatusLabels,
  bookingStatusStyles,
  formatBookingCurrency,
  formatBookingDate,
  getBookingRoom,
  getBookingTenant,
} from '../lib/booking-display'

type BookingCardProps = {
  booking: Booking
  mode: 'tenant' | 'landlord'
  onApprove?: (bookingId: string) => void
  onReject?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  isActionPending?: boolean
}

export function BookingCard({
  booking,
  mode,
  onApprove,
  onReject,
  onCancel,
  isActionPending,
}: BookingCardProps) {
  const room = getBookingRoom(booking)
  const tenant = getBookingTenant(booking)
  const canLandlordReview = mode === 'landlord' && booking.status === 'PENDING'
  const canTenantCancel =
    mode === 'tenant' &&
    (booking.status === 'PENDING' || booking.status === 'APPROVED')

  return (
    <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0 pr-0 lg:pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                bookingStatusStyles[booking.status],
              )}
            >
              {bookingStatusLabels[booking.status]}
            </span>
            {booking.createdAt ? (
              <span className="text-xs font-semibold text-slate-400">
                Tạo ngay {formatBookingDate(booking.createdAt)}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-950">
            {room?.title ?? 'Phòng không khả dụng'}
          </h2>
          <p className="mt-2 flex min-w-0 items-start gap-2 text-sm text-slate-500">
            <Home className="mt-0.5 size-4 shrink-0" />
            {room
              ? [room.address, room.district, room.city].filter(Boolean).join(', ')
              : 'Chưa có thông tin phòng'}
          </p>
        </div>

        {room?.pricePerMonth ? (
          <div className="w-full rounded-xl bg-primary/10 px-4 py-3 text-left sm:w-fit sm:min-w-44 lg:text-right">
            <p className="text-xs font-bold uppercase text-primary">Giá phòng</p>
            <p className="mt-1 whitespace-nowrap text-lg font-bold text-primary">
              {formatBookingCurrency(room.pricePerMonth)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">Ngày nhận phòng</p>
          <p className="mt-1 flex items-center gap-2 font-bold text-slate-950">
            <CalendarDays className="size-4 text-primary" />
            {formatBookingDate(booking.checkInDate)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">Ngày trả phòng</p>
          <p className="mt-1 font-bold text-slate-950">
            {formatBookingDate(booking.checkOutDate)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">
            {mode === 'landlord' ? 'Người thuê' : 'Trạng thái hiện tại'}
          </p>
          <p className="mt-1 font-bold text-slate-950">
            {mode === 'landlord'
              ? tenant?.fullName ?? tenant?.email ?? 'Chưa có thông tin'
              : bookingStatusLabels[booking.status]}
          </p>
        </div>
      </div>

      {mode === 'landlord' && tenant ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          {tenant.email ? (
            <span className="inline-flex items-center gap-2">
              <Mail className="size-4" />
              {tenant.email}
            </span>
          ) : null}
          {tenant.phone ? (
            <span className="inline-flex items-center gap-2">
              <Phone className="size-4" />
              {tenant.phone}
            </span>
          ) : null}
        </div>
      ) : null}

      {booking.notes ? (
        <p className="mt-4 rounded-lg border border-primary/10 bg-white p-3 text-sm leading-6 text-slate-600">
          {booking.notes}
        </p>
      ) : null}

      {canLandlordReview || canTenantCancel ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          {canTenantCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isActionPending}
              onClick={() => onCancel?.(booking._id)}
            >
              <XCircle className="size-4" />
              Hủy booking
            </Button>
          ) : null}
          {canLandlordReview ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isActionPending}
                onClick={() => onReject?.(booking._id)}
              >
                <XCircle className="size-4" />
                Tu choi
              </Button>
              <Button
                type="button"
                disabled={isActionPending}
                onClick={() => onApprove?.(booking._id)}
              >
                <CheckCircle2 className="size-4" />
                Phê duyệt
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
