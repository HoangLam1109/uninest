import { useEffect, useReducer, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { paths } from '@/config/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { identityApi } from '@/features/identity/api/identity.api'
import type { Identity } from '@/features/identity/types/identity.type'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { getSchemaErrorMessage } from '@/lib/zod-error'
import { useCreateBooking } from '../hooks/use-bookings'
import { bookingRequestSchema } from '../schemas/booking.schema'

type BookingRequestModalProps = {
  open: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
}

type BookingRequestState = {
  identities: Identity[]
  loadingIdentities: boolean
  identitiesExpanded: boolean
  selectedIdentityIds: string[]
  checkInDate: string
  notes: string
}

type BookingRequestAction =
  | { type: 'patch'; value: Partial<BookingRequestState> }
  | { type: 'reset' }

function createBookingRequestState(): BookingRequestState {
  return {
    identities: [],
    loadingIdentities: false,
    identitiesExpanded: true,
    selectedIdentityIds: [],
    checkInDate: '',
    notes: '',
  }
}

function bookingRequestReducer(
  state: BookingRequestState,
  action: BookingRequestAction,
): BookingRequestState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.value }
    case 'reset':
      return createBookingRequestState()
  }
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000`).toISOString()
}

export function BookingRequestModal({
  open,
  onClose,
  roomId,
  roomTitle,
}: BookingRequestModalProps) {
  const navigate = useNavigate()
  const createBooking = useCreateBooking()
  const { user } = useAuth()
  const [state, dispatch] = useReducer(
    bookingRequestReducer,
    undefined,
    createBookingRequestState,
  )
  const {
    identities,
    loadingIdentities,
    identitiesExpanded,
    selectedIdentityIds,
    checkInDate,
    notes,
  } = state

  const handleClose = () => {
    dispatch({ type: 'reset' })
    onClose()
  }

  const handleNavigateToProfile = () => {
    handleClose()
    navigate(`${paths.tenantDashboard}/ho-so`)
  }

  useEffect(() => {
    if (!open) return

    let ignore = false
    dispatch({ type: 'patch', value: { loadingIdentities: true } })

    identityApi
      .getMy()
      .then(({ data }) => {
        if (ignore) return

        dispatch({
          type: 'patch',
          value: {
            identities: (data.data ?? []).filter(
              (identity) => identity.status === 'VERIFIED',
            ),
          },
        })
      })
      .catch(() => {
        if (ignore) return
        dispatch({ type: 'patch', value: { identities: [] } })
      })
      .finally(() => {
        if (ignore) return
        dispatch({ type: 'patch', value: { loadingIdentities: false } })
      })

    return () => {
      ignore = true
    }
  }, [open])

  const toggleIdentity = (id: string) => {
    dispatch({
      type: 'patch',
      value: {
        selectedIdentityIds: selectedIdentityIds.includes(id)
          ? selectedIdentityIds.filter((identityId) => identityId !== id)
          : [...selectedIdentityIds, id],
      },
    })
  }

  const canSubmit =
    selectedIdentityIds.length > 0 &&
    Boolean(checkInDate) &&
    !loadingIdentities &&
    !createBooking.isPending

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    const validationResult = bookingRequestSchema.safeParse({
      roomId,
      identityIds: selectedIdentityIds,
      checkInDate,
      notes,
    })

    if (!validationResult.success) {
      toast.error(getSchemaErrorMessage(validationResult.error))
      return
    }

    const values = validationResult.data

    createBooking.mutate(
      {
        roomId: values.roomId,
        identityIds: values.identityIds,
        checkInDate: toIsoDate(values.checkInDate),
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đặt phòng')
          handleClose()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Dat phong" className="max-w-lg">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">Phòng đang đặt</p>
          <p className="mt-1 text-base font-bold text-foreground">{roomTitle}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Hồ sơ định danh <span className="text-red-500">*</span>
          </p>

          <div className="rounded-lg border border-border bg-white">
            <div className="flex items-center gap-3 p-3">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'patch',
                    value: { identitiesExpanded: !identitiesExpanded },
                  })
                }
                className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600"
              >
                {identitiesExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {user?.fullName ?? 'Nguoi thue'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.phone ? `${user.phone} - ` : ''}
                  {user?.email ?? ''}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {loadingIdentities
                  ? '...'
                  : `${selectedIdentityIds.length}/${identities.length} hồ sơ`}
              </span>
            </div>

            {identitiesExpanded ? (
              <div className="border-t border-border px-3 pb-3 pt-2">
                {loadingIdentities ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Đang tải hồ sơ...
                  </div>
                ) : identities.length > 0 ? (
                  <div className="grid gap-2">
                    {identities.map((identity) => {
                      const isSelected = selectedIdentityIds.includes(identity._id)

                      return (
                        <label
                          key={identity._id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border hover:border-primary/40',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIdentity(identity._id)}
                            className="size-4 accent-primary"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {identity.fullName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              CCCD: {identity.cccdNumber} - {identity.phone}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                              identity.status === 'VERIFIED'
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-amber-500/10 text-amber-600',
                            )}
                          >
                            {identity.status === 'VERIFIED'
                              ? 'Đã xác minh'
                              : 'Chờ xác minh'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-surface p-3 text-center">
                    <FileText className="mx-auto size-6 text-slate-300" />
                    <p className="mt-1 text-sm text-slate-500">
                      ạn chưa có hồ sơ định danh.
                    </p>
                    <p className="text-xs text-slate-400">
                      Vui lòng tạo hồ sơ định danh và chờ xác minh để có thể đặt phòng.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3"
                      onClick={handleNavigateToProfile}
                    >
                      Táº¡o há»“ sÆ¡ Ä‘á»‹nh danh
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {selectedIdentityIds.length > 0 ? (
            <p className="text-xs text-primary">
              Đã chọn {selectedIdentityIds.length} hồ sơ định danh
            </p>
          ) : !loadingIdentities && identities.length === 0 ? (
            <p className="text-xs font-semibold text-amber-600">
              Bạn cần có hồ sơ định danh đã xác minh mới được đặt phòng.
            </p>
          ) : null}
        </div>

        <label
          className="block space-y-1.5 text-sm font-semibold text-foreground"
          htmlFor="booking-check-in-date"
        >
          <span>
            Ngày đến xem phòng <span className="text-red-500">*</span>
          </span>
          <Input
            id="booking-check-in-date"
            type="date"
            required
            value={checkInDate}
            onChange={(event) =>
              dispatch({
                type: 'patch',
                value: { checkInDate: event.target.value },
              })
            }
          />
        </label>

        <label
          className="block space-y-1.5 text-sm font-semibold text-foreground"
          htmlFor="booking-notes"
        >
          <span>Ghi chú</span>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={(event) =>
              dispatch({ type: 'patch', value: { notes: event.target.value } })
            }
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Ví dụ: tôi muốn thuê dài hạn, cần tư vấn về phòng"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createBooking.isPending}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            <CalendarDays className="size-4" />
            {createBooking.isPending ? 'Đang gửi' : 'Gửi yêu cầu đặt phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
