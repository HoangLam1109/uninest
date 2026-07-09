import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Home,
  Mail,
  Phone,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
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
  const canTenantCancel = mode === 'tenant' && booking.status === 'PENDING'
  const canLandlordDelete = mode === 'landlord' && !canLandlordReview

  const [showIdentity, setShowIdentity] = useState(false)
  const [viewingIdentityId, setViewingIdentityId] = useState<string | null>(null)

  const identities = booking.identityIds ?? []
  const identityIds = identities.map((identity) =>
    typeof identity === 'string' ? identity : identity._id,
  )

  const viewingIdentityQuery = useGetIdentityById(
    viewingIdentityId,
    Boolean(viewingIdentityId),
  )

  return (
    <>
      <article className="flex h-full flex-col rounded-[28px] border border-primary/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-3">
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
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Tạo ngày {formatBookingDate(booking.createdAt)}
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 line-clamp-2 text-xl font-bold text-slate-950">
              {room?.title ?? 'Phong khong kha dung'}
            </h2>
          </div>

          {room?.pricePerMonth ? (
            <div className="shrink-0 rounded-2xl bg-primary/10 px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Giá phòng
              </p>
              <p className="mt-1 whitespace-nowrap text-lg font-black text-primary">
                {formatBookingCurrency(room.pricePerMonth)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl bg-surface px-4 py-3">
          <p className="flex min-w-0 items-start gap-2 text-sm text-slate-500">
            <Home className="mt-0.5 size-4 shrink-0 text-primary" />
            {room
              ? [room.address, room.district, room.city].filter(Boolean).join(', ')
              : 'Chưa có thông tin phòng'}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Ngày đến xem phòng
            </p>
            <p className="mt-2 flex items-center gap-2 font-bold text-slate-950">
              <CalendarDays className="size-4 text-primary" />
              {formatBookingDate(booking.checkInDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {mode === 'landlord' ? 'Người thuê' : 'Trạng thái hiện tại'}
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {mode === 'landlord'
                ? tenant?.fullName ?? tenant?.email ?? 'Chưa có thông tin'
                : bookingStatusLabels[booking.status]}
            </p>
          </div>
        </div>

        {mode === 'landlord' && tenant ? (
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Users className="size-4 text-primary" />
              Liên hệ người thuê
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {tenant.email ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Mail className="size-4 text-primary" />
                  {tenant.email}
                </span>
              ) : null}
              {tenant.phone ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Phone className="size-4 text-primary" />
                  {tenant.phone}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {identityIds.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Hồ sơ định danh ({identityIds.length})
            </p>
            <div className="mt-3 space-y-2">
              {identities.map((identity, index) => {
                const id = typeof identity === 'string' ? identity : identity._id
                const name =
                  typeof identity === 'object' ? identity.fullName : `Người ${index + 1}`
                const cccd = typeof identity === 'object' ? identity.cccdNumber : ''
                const phone = typeof identity === 'object' ? identity.phone : ''

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {cccd ? `CCCD: ${cccd}` : ''}
                        {cccd && phone ? ' - ' : ''}
                        {phone}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 min-w-0 shrink-0 gap-1 px-2 text-xs text-primary"
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

        <div className="mt-auto pt-5">
          {canTenantCancel || canLandlordReview ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              {canTenantCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isActionPending}
                  onClick={() => onCancel?.(booking._id)}
                >
                  <XCircle className="size-4" />
                  Hủy yêu cầu
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

          {canLandlordDelete ? (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="h-8 min-w-0 gap-1.5 px-2 text-xs text-slate-400 hover:text-red-500"
                disabled={isActionPending}
                onClick={() => onDelete?.(booking._id)}
              >
                <Trash2 className="size-3.5" />
                Xóa
              </Button>
            </div>
          ) : null}
        </div>
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
          <p className="py-8 text-center text-sm text-slate-500">Đang tải hồ sơ...</p>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Không thể tải hồ sơ định danh. Vui lòng thử lại sau.
          </p>
        )}
      </Modal>
    </>
  )
}
