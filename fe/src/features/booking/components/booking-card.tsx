import { useState } from 'react'
import { CalendarDays, CheckCircle2, Eye, Home, Mail, Phone, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { IdentityDetail } from '@/features/identity/components/identity-detail'
import { useGetIdentityById } from '@/features/identity/hooks/use-identities'
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
  onDelete?: (bookingId: string) => void
  isActionPending?: boolean
}

export function BookingCard({
  booking,
  mode,
  onApprove,
  onReject,
  onCancel,
  onDelete,
  isActionPending,
}: BookingCardProps) {
  const room = getBookingRoom(booking)
  const tenant = getBookingTenant(booking)
  const canLandlordReview = mode === 'landlord' && booking.status === 'PENDING'
  const canTenantCancel =
    mode === 'tenant' && booking.status === 'PENDING'

  const [showIdentity, setShowIdentity] = useState(false)
  const [viewingIdentityId, setViewingIdentityId] = useState<string | null>(null)

  const identityIds: string[] = booking.identityIds?.map((id: any) =>
    typeof id === 'string' ? id : id._id,
  ) ?? []

  const viewingIdentityQuery = useGetIdentityById(
    viewingIdentityId,
    Boolean(viewingIdentityId),
  )

  return (
    <>
      <article className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
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
                  Tạo ngày {formatBookingDate(booking.createdAt)}
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-950">
              {room?.title ?? 'Phòng không khả dụng'}
            </h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
              <Home className="mt-0.5 size-4 shrink-0" />
              {room
                ? [room.address, room.district, room.city].filter(Boolean).join(', ')
                : 'Chưa có thông tin phòng'}
            </p>
          </div>

          {room?.pricePerMonth ? (
            <div className="rounded-xl bg-primary/10 px-4 py-3 text-left lg:text-right">
              <p className="text-xs font-bold uppercase text-primary">Giá phòng</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatBookingCurrency(room.pricePerMonth)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
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

        {identityIds.length > 0 ? (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-primary">
              Hồ sơ định danh ({identityIds.length})
            </p>
            <div className="space-y-2">
              {booking.identityIds?.map((identity: any, index: number) => {
                const id = typeof identity === 'string' ? identity : identity._id
                const name = typeof identity === 'object' ? identity.fullName : `Người ${index + 1}`
                const cccd = typeof identity === 'object' ? identity.cccdNumber : ''
                const phone = typeof identity === 'object' ? identity.phone : ''
                const status = typeof identity === 'object' ? identity.status : ''
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {cccd ? `CCCD: ${cccd}` : ''}
                        {cccd && phone ? ' • ' : ''}
                        {phone || ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 gap-1 text-xs text-primary"
                      onClick={() => {
                        setViewingIdentityId(id)
                        setShowIdentity(true)
                      }}
                    >
                      <Eye className="size-3.5" />
                      Xem
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {booking.notes ? (
          <p className="mt-4 rounded-lg border border-primary/10 bg-white p-3 text-sm leading-6 text-slate-600">
            {booking.notes}
          </p>
        ) : null}

        {canLandlordReview || canTenantCancel ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                  Từ chối
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

        {mode === 'landlord' && !canLandlordReview ? (
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-slate-400 hover:text-red-500"
              disabled={isActionPending}
              onClick={() => onDelete?.(booking._id)}
            >
              <Trash2 className="size-3.5" />
              Xóa
            </Button>
          </div>
        ) : null}
      </article>

      <Modal
        open={showIdentity}
        onClose={() => {
          setShowIdentity(false)
          setViewingIdentityId(null)
        }}
        title="Hồ sơ định danh người thuê"
        className="max-w-lg"
      >
        {viewingIdentityQuery.data ? (
          <IdentityDetail identity={viewingIdentityQuery.data} />
        ) : viewingIdentityQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Đang tải hồ sơ...
          </p>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Không thể tải hồ sơ
          </p>
        )}
      </Modal>
    </>
  )
}
