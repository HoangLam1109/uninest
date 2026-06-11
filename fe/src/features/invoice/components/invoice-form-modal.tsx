import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Booking } from '@/features/booking/types/booking.type'
import {
  formatBookingDate,
  getBookingRoom,
  getBookingTenant,
} from '@/features/booking/lib/booking-display'

type InvoiceFormMode = 'manual' | 'utility'

type InvoiceFormModalProps = {
  open: boolean
  isPending?: boolean
  bookings: Booking[]
  isLoadingBookings?: boolean
  onClose: () => void
  onSubmitManual: (payload: {
    bookingId: string
    billingMonth: string
    dueDate: string
    rentAmount: number
    electricityAmount?: number
    waterAmount?: number
    additionalFees?: number
    notes?: string
  }) => void
  onSubmitUtility: (payload: {
    bookingId: string
    billingMonth: string
    dueDate: string
    rentAmount: number
    electricityNewIndex?: number
    waterNewIndex?: number
    additionalFees?: number
    notes?: string
  }) => void
}

function currentBillingMonth() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

function defaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

function parseFloatSafe(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function InvoiceFormModal({
  open,
  isPending,
  bookings,
  isLoadingBookings,
  onClose,
  onSubmitManual,
  onSubmitUtility,
}: InvoiceFormModalProps) {
  const [mode, setMode] = useState<InvoiceFormMode>('manual')
  const [bookingId, setBookingId] = useState('')
  const [billingMonth, setBillingMonth] = useState(currentBillingMonth())
  const [dueDate, setDueDate] = useState(defaultDueDate())
  const [rentAmount, setRentAmount] = useState('')
  const [electricityAmount, setElectricityAmount] = useState('')
  const [waterAmount, setWaterAmount] = useState('')
  const [electricityNewIndex, setElectricityNewIndex] = useState('')
  const [waterNewIndex, setWaterNewIndex] = useState('')
  const [additionalFees, setAdditionalFees] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      bookingId,
      billingMonth: billingMonth.trim(),
      dueDate: new Date(dueDate).toISOString(),
      rentAmount: Number(rentAmount),
      additionalFees: parseFloatSafe(additionalFees),
      notes: notes.trim() || undefined,
    }

    if (mode === 'utility') {
      onSubmitUtility({
        ...base,
        electricityNewIndex: parseFloatSafe(electricityNewIndex),
        waterNewIndex: parseFloatSafe(waterNewIndex),
      })
    } else {
      onSubmitManual({
        ...base,
        electricityAmount: parseFloatSafe(electricityAmount),
        waterAmount: parseFloatSafe(waterAmount),
      })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tạo hóa đơn" className="max-w-xl">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === 'manual' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
            }`}
            onClick={() => setMode('manual')}
          >
            Nhập tiền
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === 'utility' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
            }`}
            onClick={() => setMode('utility')}
          >
            ⚡ Nhập chỉ số
          </button>
        </div>

        {/* Booking Picker */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Đơn đặt phòng *
          </label>
          {isLoadingBookings ? (
            <p className="text-sm text-slate-400">Đang tải...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có đơn đặt phòng đã duyệt.</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
              {bookings.map((b) => {
                const tenant = getBookingTenant(b)
                const room = getBookingRoom(b)
                return (
                  <label
                    key={b._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md p-2 transition ${
                      bookingId === b._id ? 'bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookingId"
                      value={b._id}
                      checked={bookingId === b._id}
                      onChange={() => setBookingId(b._id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-semibold">{tenant?.fullName ?? 'Người thuê'}</p>
                      <p className="text-slate-500">
                        {room?.title ?? 'Phòng'}
                        {room?.pricePerMonth ? ` • ${room.pricePerMonth.toLocaleString('vi-VN')}đ/tháng` : ''}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Kỳ hóa đơn (YYYY-MM) *</label>
            <Input
              required
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              placeholder="2026-06"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Hạn thanh toán *</label>
            <Input
              required
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Tiền thuê *</label>
          <Input
            required
            type="number"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            placeholder="3500000"
          />
        </div>

        {mode === 'manual' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tiền điện</label>
              <Input
                type="number"
                value={electricityAmount}
                onChange={(e) => setElectricityAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tiền nước</label>
              <Input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">⚡ Chỉ số điện mới</label>
              <Input
                type="number"
                value={electricityNewIndex}
                onChange={(e) => setElectricityNewIndex(e.target.value)}
                placeholder="Số cuối công tơ"
              />
              <p className="text-xs text-slate-400">Tự tính: usage × đơn giá phòng</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">💧 Chỉ số nước mới</label>
              <Input
                type="number"
                value={waterNewIndex}
                onChange={(e) => setWaterNewIndex(e.target.value)}
                placeholder="Số cuối đồng hồ"
              />
              <p className="text-xs text-slate-400">Tự tính: usage × đơn giá phòng</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold">Phí khác</label>
          <Input
            type="number"
            value={additionalFees}
            onChange={(e) => setAdditionalFees(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Ghi chú</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú cho người thuê..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending || !bookingId}>
            {isPending ? 'Đang tạo...' : 'Tạo hóa đơn nháp'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
