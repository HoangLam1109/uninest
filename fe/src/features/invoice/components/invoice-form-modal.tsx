import { useEffect, useMemo, useReducer } from 'react'
import { AlertCircle } from 'lucide-react'
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
import { utilityInvoiceFormSchema } from '../schemas/invoice.schema'
import { useGetPreviousReading } from '../hooks/use-invoices'
import { useGetMyVerifiedBankAccount } from '@/features/bank-account/hooks/use-bank-accounts'

type InvoiceFormState = {
  bookingId: string
  billingMonth: string
  dueDate: string
  rentAmount: string
  electricityNewIndex: string
  waterNewIndex: string
  electricityOldIndex: string
  waterOldIndex: string
  electricityRate: string
  waterRate: string
  additionalFees: string
  notes: string
}

type InvoiceFormAction =
  | { type: 'fieldChanged'; name: keyof InvoiceFormState; value: string }
  | { type: 'setPreviousReading'; payload: { electricityOldIndex: string; waterOldIndex: string; electricityRate: string; waterRate: string } }

type InvoiceFormModalProps = {
  open: boolean
  isPending?: boolean
  bookings: Booking[]
  isLoadingBookings?: boolean
  onClose: () => void
  onSubmit: (payload: {
    bookingId: string
    billingMonth: string
    dueDate: string
    rentAmount: number
    electricityNewIndex?: number
    waterNewIndex?: number
    electricityOldIndex?: number
    waterOldIndex?: number
    electricityRate?: number
    waterRate?: number
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
    bookingId: '',
    billingMonth: currentBillingMonth(),
    dueDate: defaultDueDate(),
    rentAmount: '',
    electricityNewIndex: '',
    waterNewIndex: '',
    electricityOldIndex: '',
    waterOldIndex: '',
    electricityRate: '',
    waterRate: '',
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
    case 'setPreviousReading':
      return { ...state, ...action.payload }
  }
}

export function InvoiceFormModal({
  open,
  isPending,
  bookings,
  isLoadingBookings,
  onClose,
  onSubmit,
}: InvoiceFormModalProps) {
  const [formState, dispatch] = useReducer(
    invoiceFormReducer,
    undefined,
    createInvoiceFormState,
  )
  const {
    bookingId,
    billingMonth,
    dueDate,
    rentAmount,
    electricityNewIndex,
    waterNewIndex,
    electricityOldIndex,
    waterOldIndex,
    electricityRate,
    waterRate,
    additionalFees,
    notes,
  } = formState

  // Fetch previous reading when a booking is selected, using the form's billingMonth
  const previousReadingQuery = useGetPreviousReading(bookingId || null, billingMonth || undefined)
  const previousReading = previousReadingQuery.data

  // Check if landlord has verified PayOS account
  const bankAccountQuery = useGetMyVerifiedBankAccount()
  const hasBankAccount = !!bankAccountQuery.data
  const bankAccountLoading = bankAccountQuery.isLoading

  // Auto-fill old indices & rates from previous invoice
  useEffect(() => {
    if (!previousReading?.hasMeterData || !previousReading.previousInvoice) return

    const prev = previousReading.previousInvoice
    dispatch({
      type: 'setPreviousReading',
      payload: {
        electricityOldIndex: prev.electricityNewIndex != null && prev.electricityNewIndex >= 0
          ? String(prev.electricityNewIndex)
          : '',
        waterOldIndex: prev.waterNewIndex != null && prev.waterNewIndex >= 0
          ? String(prev.waterNewIndex)
          : '',
        electricityRate: prev.electricityRate != null
          ? String(prev.electricityRate)
          : '',
        waterRate: prev.waterRate != null
          ? String(prev.waterRate)
          : '',
      },
    })
  }, [previousReading])

  // Track if previous data exists for display
  const hasPreviousData = useMemo(
    () => previousReading?.hasMeterData ?? false,
    [previousReading],
  )

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

    const validationResult = utilityInvoiceFormSchema.safeParse({
      ...payload,
      electricityNewIndex,
      waterNewIndex,
    })

    if (!validationResult.success) {
      toast.error(getSchemaErrorMessage(validationResult.error))
      return
    }

    // Always send old indices if filled — backend will prioritize explicit values
    // If not filled and has previous data, backend auto-resolves
    onSubmit({
      ...validationResult.data,
      electricityOldIndex: electricityOldIndex.trim() ? parseFloat(electricityOldIndex) : undefined,
      waterOldIndex: waterOldIndex.trim() ? parseFloat(waterOldIndex) : undefined,
      electricityRate: electricityRate.trim() ? parseFloat(electricityRate) : undefined,
      waterRate: waterRate.trim() ? parseFloat(waterRate) : undefined,
    })
  }

  const hasElectricity = electricityNewIndex.trim() !== ''
  const hasWater = waterNewIndex.trim() !== ''

  return (
    <Modal open={open} onClose={onClose} title="Tạo hóa đơn" className="max-w-2xl">
      <form className="grid gap-4 max-h-[80vh] overflow-y-auto pr-1" onSubmit={handleSubmit}>
        {/* Booking Picker — full width */}
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

        {/* 3-column: billing month, due date, rent */}
        <div className="grid grid-cols-3 gap-3">
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
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="invoice-rent-amount">Tiền thuê *</label>
            <Input
              id="invoice-rent-amount"
              required
              type="number"
              value={rentAmount}
              onChange={(e) => updateField('rentAmount', e.target.value)}
              placeholder="3.500.000"
            />
          </div>
        </div>

        {/* Meter readings — full width */}
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <p className="mb-3 text-sm font-bold text-primary">⚡ Chỉ số điện nước</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-electricity-new-index">Chỉ số điện mới</label>
              <Input
                id="invoice-electricity-new-index"
                type="number"
                value={electricityNewIndex}
                onChange={(e) => updateField('electricityNewIndex', e.target.value)}
                placeholder="Số cuối công tơ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="invoice-water-new-index">Chỉ số nước mới</label>
              <Input
                id="invoice-water-new-index"
                type="number"
                value={waterNewIndex}
                onChange={(e) => updateField('waterNewIndex', e.target.value)}
                placeholder="Số cuối đồng hồ"
              />
            </div>
          </div>

          {/* Old indices + rates — always visible when new indices are entered */}
          {(hasElectricity || hasWater) ? (
            <div className="mt-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-amber-700">
                  📐 Chỉ số cũ & đơn giá
                </p>
                {hasPreviousData ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Đã điền từ tháng trước
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Nhập thủ công
                  </span>
                )}
              </div>

              {/* Show billing month of previous data if available */}
              {hasPreviousData && previousReading?.previousInvoice && (
                <p className="mb-3 text-xs text-green-700">
                  Dữ liệu từ hóa đơn tháng{' '}
                  <strong>{previousReading.previousInvoice.billingMonth}</strong>
                  {'. Bạn có thể sửa lại nếu cần.'}
                </p>
              )}

              {/* Always show old indices + rates in 4 columns */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="invoice-elec-old-idx">⚡ Chỉ số điện cũ</label>
                  <Input
                    id="invoice-elec-old-idx"
                    type="number"
                    value={electricityOldIndex}
                    onChange={(e) => updateField('electricityOldIndex', e.target.value)}
                    placeholder="vd: 1000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="invoice-elec-rate">⚡ Đơn giá điện</label>
                  <Input
                    id="invoice-elec-rate"
                    type="number"
                    value={electricityRate}
                    onChange={(e) => updateField('electricityRate', e.target.value)}
                    placeholder="vd: 3.500 đ/kWh"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="invoice-water-old-idx">💧 Chỉ số nước cũ</label>
                  <Input
                    id="invoice-water-old-idx"
                    type="number"
                    value={waterOldIndex}
                    onChange={(e) => updateField('waterOldIndex', e.target.value)}
                    placeholder="vd: 50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="invoice-water-rate">💧 Đơn giá nước</label>
                  <Input
                    id="invoice-water-rate"
                    type="number"
                    value={waterRate}
                    onChange={(e) => updateField('waterRate', e.target.value)}
                    placeholder="vd: 15.000 đ/m³"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Extras — 2-column */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {!bankAccountLoading && !hasBankAccount ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Bạn chưa có tài khoản PayOS được duyệt.{' '}
              <strong>Vào Hồ sơ để thêm tài khoản PayOS</strong> trước khi tạo hóa đơn.
            </span>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending || !bookingId || !hasBankAccount}>
            {isPending ? 'Đang tạo...' : 'Tạo hóa đơn nháp'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
