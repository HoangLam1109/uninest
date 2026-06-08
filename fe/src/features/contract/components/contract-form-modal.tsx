import { useMemo, useState, type ComponentProps } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useGetLandlordBookings } from '@/features/booking/hooks/use-bookings'
import {
  formatBookingDate,
  getBookingRoom,
  getBookingTenant,
} from '@/features/booking/lib/booking-display'
import type { Booking } from '@/features/booking/types/booking.type'
import type {
  Contract,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

type ContractFormMode = 'create' | 'edit' | 'renew'

type ContractFormModalProps = {
  open: boolean
  mode: ContractFormMode
  contract?: Contract | null
  isPending?: boolean
  onClose: () => void
  onSubmit: (
    payload: CreateContractPayload | UpdateContractPayload | RenewContractPayload,
  ) => void
}

function toDateInput(value?: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000`).toISOString()
}

function optionalNumber(value: string) {
  return value ? Number(value) : undefined
}

function getBookingSearchText(booking: Booking) {
  const tenant = getBookingTenant(booking)
  const room = getBookingRoom(booking)

  return [
    booking._id,
    tenant?.fullName,
    tenant?.email,
    tenant?.phone,
    room?.title,
    room?.address,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function ContractFormModal({
  open,
  mode,
  contract,
  isPending = false,
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const title =
    mode === 'create'
      ? 'Tạo hợp đồng'
      : mode === 'renew'
        ? 'Gia hạn hợp đồng'
        : 'Cập nhật hợp đồng'

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-2xl">
      <ContractFormFields
        key={`${mode}-${contract?._id ?? 'new'}`}
        mode={mode}
        contract={contract}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}

function ContractFormFields({
  mode,
  contract,
  isPending,
  onClose,
  onSubmit,
}: Omit<ContractFormModalProps, 'open'>) {
  const [bookingId, setBookingId] = useState('')
  const [isBookingPickerOpen, setIsBookingPickerOpen] = useState(false)
  const [monthlyRent, setMonthlyRent] = useState(
    contract?.monthlyRent ? String(contract.monthlyRent) : '',
  )
  const [depositAmount, setDepositAmount] = useState(
    contract?.depositAmount ? String(contract.depositAmount) : '',
  )
  const [startDate, setStartDate] = useState(
    mode === 'renew' ? '' : toDateInput(contract?.startDate),
  )
  const [endDate, setEndDate] = useState(
    mode === 'renew' ? '' : toDateInput(contract?.endDate),
  )
  const [contractFileUrl, setContractFileUrl] = useState(
    contract?.contractFileUrl ?? '',
  )
  const [terms, setTerms] = useState(contract?.terms ?? '')
  const landlordBookingsQuery = useGetLandlordBookings(
    { page: 1, limit: 100, status: 'APPROVED' },
    mode === 'create',
  )
  const bookingOptions = landlordBookingsQuery.data?.data ?? []
  const filteredBookingOptions = useMemo(() => {
    const keyword = bookingId.trim().toLowerCase()

    if (!keyword) return bookingOptions.slice(0, 8)

    return bookingOptions
      .filter((booking) => getBookingSearchText(booking).includes(keyword))
      .slice(0, 8)
  }, [bookingId, bookingOptions])

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()

    const payload = {
      monthlyRent: Number(monthlyRent),
      depositAmount: optionalNumber(depositAmount),
      terms: terms.trim() || undefined,
      contractFileUrl: contractFileUrl.trim() || undefined,
      startDate: startDate ? toIsoDate(startDate) : undefined,
      endDate: endDate ? toIsoDate(endDate) : undefined,
    }

    if (mode === 'create') {
      onSubmit({ ...payload, bookingId: bookingId.trim() })
      return
    }

    if (mode === 'renew') {
      onSubmit({ ...payload, startDate: toIsoDate(startDate) })
      return
    }

    onSubmit(payload)
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
        {mode === 'create' ? (
          <div className="relative block space-y-2 text-sm font-semibold text-foreground">
            <label htmlFor="contract-booking-id">Booking ID *</label>
            <Input
              id="contract-booking-id"
              required
              value={bookingId}
              onBlur={() => window.setTimeout(() => setIsBookingPickerOpen(false), 120)}
              onChange={(event) => {
                setBookingId(event.target.value)
                setIsBookingPickerOpen(true)
              }}
              onFocus={() => setIsBookingPickerOpen(true)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
              placeholder="Nhập ID hoặc tìm theo tên người đặt"
              autoComplete="off"
            />
            {isBookingPickerOpen ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-primary/10 bg-white p-1 shadow-lg">
                {landlordBookingsQuery.isLoading ? (
                  <div className="px-3 py-2 text-sm font-medium text-slate-500">
                    Đang tải booking...
                  </div>
                ) : null}

                {!landlordBookingsQuery.isLoading &&
                filteredBookingOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm font-medium text-slate-500">
                    Không tìm thấy booking phù hợp.
                  </div>
                ) : null}

                {filteredBookingOptions.map((booking) => {
                  const tenant = getBookingTenant(booking)
                  const room = getBookingRoom(booking)

                  return (
                    <button
                      key={booking._id}
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-primary/5 focus:bg-primary/5 focus:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setBookingId(booking._id)
                        setIsBookingPickerOpen(false)
                      }}
                    >
                      <span className="block font-semibold text-foreground">
                        {tenant?.fullName ?? tenant?.email ?? booking._id}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-500">
                        {room?.title ? ` · ${room.title}` : ''}
                        {booking.checkInDate
                          ? ` · ${formatBookingDate(booking.checkInDate)}`
                          : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Tiền thuê hằng tháng *</span>
            <Input
              type="number"
              min={0}
              required
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Tiền cọc</span>
            <Input
              type="number"
              min={0}
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Ngày bắt đầu {mode === 'renew' ? '*' : ''}</span>
            <Input
              type="date"
              required={mode === 'renew'}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Ngày kết thúc</span>
            <Input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-semibold text-foreground">
          <span>Link file hợp đồng</span>
          <Input
            type="url"
            value={contractFileUrl}
            onChange={(event) => setContractFileUrl(event.target.value)}
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            placeholder="https://example.com/contracts/contract-001.pdf"
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-foreground">
          <span>Điều khoản</span>
          <textarea
            value={terms}
            onChange={(event) => setTerms(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            <FileText className="size-4" />
            {isPending ? 'Đang lưu...' : 'Lưu hợp đồng'}
          </Button>
        </div>
    </form>
  )
}
