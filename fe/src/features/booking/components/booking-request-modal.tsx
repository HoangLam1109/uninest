import { useState, type ComponentProps } from 'react'
import { CalendarDays, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useCreateBooking } from '../hooks/use-bookings'
import { useGetMyIdentities } from '@/features/identity/hooks/use-identities'
import { IdentityFormModal } from '@/features/identity/components/identity-form-modal'

type BookingRequestModalProps = {
  open: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
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
  const createBooking = useCreateBooking()
  const { data: identities = [] } = useGetMyIdentities()
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [notes, setNotes] = useState('')
  const [identityIds, setIdentityIds] = useState<string[]>([])
  const [showIdentityForm, setShowIdentityForm] = useState(false)

  // Auto-select latest verified/pending identity
  const selectableIdentities = identities.filter(
    (id) => id.status !== 'REJECTED',
  )

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()

    if (identityIds.length === 0) return

    createBooking.mutate(
      {
        roomId,
        identityIds,
        checkInDate: toIsoDate(checkInDate),
        checkOutDate: checkOutDate ? toIsoDate(checkOutDate) : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCheckInDate('')
          setCheckOutDate('')
          setNotes('')
          setIdentityIds([])
          onClose()
        },
      },
    )
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Đặt phòng" className="max-w-lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-sm font-semibold text-primary">Phòng đang đặt</p>
            <p className="mt-1 text-base font-bold text-foreground">{roomTitle}</p>
          </div>

          {/* Identity Selection */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Hồ sơ định danh <span className="text-red-500">*</span>
            </p>
            {selectableIdentities.length > 0 ? (
              <div className="grid gap-2">
                {selectableIdentities.map((identity) => {
                  const isSelected = identityIds.includes(identity._id)
                  return (
                    <label
                      key={identity._id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setIdentityIds((prev) =>
                            prev.includes(identity._id)
                              ? prev.filter((id) => id !== identity._id)
                              : [...prev, identity._id],
                          )
                        }}
                        className="size-4 accent-primary"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {identity.fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          CCCD: {identity.cccdNumber} • {identity.phone}
                        </p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          identity.status === 'VERIFIED'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {identity.status === 'VERIFIED' ? 'Đã xác minh' : 'Chờ xác minh'}
                      </span>
                    </label>
                  )
                })}
                {identityIds.length > 0 ? (
                  <p className="text-xs text-primary">
                    Đã chọn {identityIds.length} hồ sơ định danh
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface p-4 text-center">
                <FileText className="mx-auto size-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  Bạn chưa có hồ sơ định danh
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setShowIdentityForm(true)}
                >
                  <Plus className="size-3.5" />
                  Tạo hồ sơ định danh
                </Button>
              </div>
            )}
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setShowIdentityForm(true)}
            >
              + Tạo hồ sơ định danh mới
            </button>
          </div>

          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Ngày nhận phòng *</span>
            <Input
              type="date"
              required
              value={checkInDate}
              onChange={(event) => setCheckInDate(event.target.value)}
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Ngày trả phòng dự kiến</span>
            <Input
              type="date"
              min={checkInDate || undefined}
              value={checkOutDate}
              onChange={(event) => setCheckOutDate(event.target.value)}
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Ghi chú</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ví dụ: tôi muốn thuê dài hạn, cần tư vấn về phòng"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={createBooking.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createBooking.isPending || identityIds.length === 0}
            >
              <CalendarDays className="size-4" />
              {createBooking.isPending ? 'Đang gửi' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </Modal>

      <IdentityFormModal
        open={showIdentityForm}
        onClose={() => setShowIdentityForm(false)}
      />
    </>
  )
}
