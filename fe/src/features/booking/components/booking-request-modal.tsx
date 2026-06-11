import { useState, type ComponentProps } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useCreateBooking } from '../hooks/use-bookings'

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
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()

    createBooking.mutate(
      {
        roomId,
        checkInDate: toIsoDate(checkInDate),
        checkOutDate: checkOutDate ? toIsoDate(checkOutDate) : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCheckInDate('')
          setCheckOutDate('')
          setNotes('')
          onClose()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Dat phong" className="max-w-lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">Phong dang dat</p>
          <p className="mt-1 text-base font-bold text-foreground">{roomTitle}</p>
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
            placeholder="Vi du:tôi muốn thuê dài hạn, cần tư vấn về phòng"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createBooking.isPending}
          >
            Huy
          </Button>
          <Button type="submit" disabled={createBooking.isPending}>
            <CalendarDays className="size-4" />
            {createBooking.isPending ? 'Đang gửi' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
