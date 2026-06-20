import { useReducer } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Booking } from '@/features/booking/types/booking.type'
import { getSchemaErrorMessage } from '@/lib/zod-error'
import {
  getBookingRoom,
  getBookingTenant,
} from '@/features/booking/lib/booking-display'
import {
  manualInvoiceFormSchema,
  utilityInvoiceFormSchema,
} from '../schemas/invoice.schema'

type InvoiceFormMode = 'manual' | 'utility'

type InvoiceFormState = {
  mode: InvoiceFormMode
  bookingId: string
  billingMonth: string
  dueDate: string
  rentAmount: string
  electricityAmount: string
  waterAmount: string
  electricityNewIndex: string
  waterNewIndex: string
  additionalFees: string
  notes: string
}

type InvoiceFormAction =
  | { type: 'fieldChanged'; name: keyof InvoiceFormState; value: string }
  | { type: 'modeChanged'; mode: InvoiceFormMode }

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

function createInvoiceFormState(): InvoiceFormState {
  return {
    mode: 'manual',
    bookingId: '',
    billingMonth: currentBillingMonth(),
    dueDate: defaultDueDate(),
    rentAmount: '',
    electricityAmount: '',
    waterAmount: '',
    electricityNewIndex: '',
    waterNewIndex: '',
    additionalFees: '',
    notes: '',
  }
}

function invoiceFormReducer(
  state: InvoiceFormState,
  action: InvoiceFormAction,
): InvoiceFormState {
  switch (action.type) {
    case 'fieldChanged':
      return { ...state, [action.name]: action.value }
    case 'modeChanged':
      return { ...state, mode: action.mode }
  }
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
  const [formState, dispatch] = useReducer(
    invoiceFormReducer,
    undefined,
    createInvoiceFormState,
  )
  const {
    mode,
    bookingId,
    billingMonth,
    dueDate,
    rentAmount,
    electricityAmount,
    waterAmount,
    electricityNewIndex,
    waterNewIndex,
    additionalFees,
    notes,
  } = formState

  function updateField(name: keyof InvoiceFormState, value: string) {
    dispatch({ type: 'fieldChanged', name, value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      bookingId,
      billingMonth,
      dueDate,
      rentAmount,
      additionalFees,
      notes,
    }

    if (mode === 'utility') {
      const validationResult = utilityInvoiceFormSchema.safeParse({
        ...payload,
        electricityNewIndex,
        waterNewIndex,
      })

      if (!validationResult.success) {
        toast.error(getSchemaErrorMessage(validationResult.error))
        return
      }

      onSubmitUtility(validationResult.data)
    } else {
      const validationResult = manualInvoiceFormSchema.safeParse({
        ...payload,
        electricityAmount,
        waterAmount,
      })

      if (!validationResult.success) {
        toast.error(getSchemaErrorMessage(validationResult.error))
        return
      }

      onSubmitManual(validationResult.data)
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
            onClick={() => dispatch({ type: 'modeChanged', mode: 'manual' })}
          >
            Nhập tiền
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === 'utility' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
            }`}
            onClick={() => dispatch({ type: 'modeChanged', mode: 'utility' })}
          >
            ⚡ Nhập chỉ số
          </button>
        </div>

        {/* Booking Picker */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Đơn đặt phòng *
          </legend>
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
                      onChange={() => updateField('bookingId', b._id)}
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
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="invoice-billing-month">Kỳ hóa đơn (YYYY-MM) *</label>
            <Input
              id="invoice-billing-month"
              required
              value={billingMonth}
              onChange={(e) => updateField('billingMonth', e.target.value)}
              placeholder="2026-06"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="invoice-due-date">Hạn thanh toán *</label>
            <Input
              id="invoice-due-date"
              required
              type="date"
              value={dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="invoice-rent-amount">Tiền thuê *</label>
          <Input
            id="invoice-rent-amount"
            required
            type="number"
            value={rentAmount}
            onChange={(e) => updateField('rentAmount', e.target.value)}
            placeholder="3500000"
          />
        </div>

        {mode === 'manual' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-electricity-amount">Tiền điện</label>
              <Input
                id="invoice-electricity-amount"
                type="number"
                value={electricityAmount}
                onChange={(e) => updateField('electricityAmount', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-water-amount">Tiền nước</label>
              <Input
                id="invoice-water-amount"
                type="number"
                value={waterAmount}
                onChange={(e) => updateField('waterAmount', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-electricity-new-index">⚡ Chỉ số điện mới</label>
              <Input
                id="invoice-electricity-new-index"
                type="number"
                value={electricityNewIndex}
                onChange={(e) => updateField('electricityNewIndex', e.target.value)}
                placeholder="Số cuối công tơ"
              />
              <p className="text-xs text-slate-400">Tự tính: usage × đơn giá phòng</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-water-new-index">💧 Chỉ số nước mới</label>
              <Input
                id="invoice-water-new-index"
                type="number"
                value={waterNewIndex}
                onChange={(e) => updateField('waterNewIndex', e.target.value)}
                placeholder="Số cuối đồng hồ"
              />
              <p className="text-xs text-slate-400">Tự tính: usage × đơn giá phòng</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="invoice-additional-fees">Phí khác</label>
          <Input
            id="invoice-additional-fees"
            type="number"
            value={additionalFees}
            onChange={(e) => updateField('additionalFees', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="invoice-notes">Ghi chú</label>
          <Input
            id="invoice-notes"
            value={notes}
            onChange={(e) => updateField('notes', e.target.value)}
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
