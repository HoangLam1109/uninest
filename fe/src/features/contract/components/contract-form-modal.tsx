import { useMemo, useReducer, useState, type ComponentProps } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
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
import { getSchemaErrorMessage } from '@/lib/zod-error'
import {
  createContractSchema,
  renewContractSchema,
  updateContractSchema,
} from '../schemas/contract.schema'
import type {
  Contract,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

type ContractFormMode = 'create' | 'edit' | 'renew'

type ContractFieldsState = {
  bookingId: string
  bookingSearch: string
  isBookingPickerOpen: boolean
  monthlyRent: string
  depositAmount: string
  startDate: string
  endDate: string
  terms: string
}

type ContractFieldsAction =
  | { type: 'fieldChanged'; name: keyof ContractFieldsState; value: string }
  | { type: 'bookingPickerChanged'; open: boolean }

type ContractFieldsInit = {
  mode: ContractFormMode
  contract?: Contract | null
}

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

function createContractFieldsState({
  mode,
  contract,
}: ContractFieldsInit): ContractFieldsState {
  return {
    bookingId: '',
    bookingSearch: '',
    isBookingPickerOpen: false,
    monthlyRent: contract?.monthlyRent ? String(contract.monthlyRent) : '',
    depositAmount: contract?.depositAmount ? String(contract.depositAmount) : '',
    startDate: mode === 'renew' ? '' : toDateInput(contract?.startDate),
    endDate: mode === 'renew' ? '' : toDateInput(contract?.endDate),
    terms: contract?.terms ?? '',
  }
}

function contractFieldsReducer(
  state: ContractFieldsState,
  action: ContractFieldsAction,
): ContractFieldsState {
  switch (action.type) {
    case 'fieldChanged':
      return { ...state, [action.name]: action.value }
    case 'bookingPickerChanged':
      return { ...state, isBookingPickerOpen: action.open }
  }
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

function getExistingContractFileName(contract?: Contract | null) {
  if (!contract) return null
  const filename = contract.contractFileUrl?.split('/').pop()?.split('?')[0]
  return filename || 'contract.pdf'
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
  const [fields, dispatchFields] = useReducer(
    contractFieldsReducer,
    { mode, contract },
    createContractFieldsState,
  )
  const [contractFile, setContractFile] = useState<File | undefined>()

  const {
    bookingId,
    bookingSearch,
    isBookingPickerOpen,
    monthlyRent,
    depositAmount,
    startDate,
    endDate,
    terms,
  } = fields

  const landlordBookingsQuery = useGetLandlordBookings(
    { page: 1, limit: 100, status: 'APPROVED' },
    mode === 'create',
  )

  const filteredBookingOptions = useMemo(() => {
    const bookingOptions = landlordBookingsQuery.data?.data ?? []
    const keyword = bookingSearch.trim().toLowerCase()

    if (!keyword) return bookingOptions.slice(0, 8)

    return bookingOptions
      .filter((booking) => getBookingSearchText(booking).includes(keyword))
      .slice(0, 8)
  }, [bookingSearch, landlordBookingsQuery.data?.data])

  const selectedBooking = useMemo(
    () =>
      (landlordBookingsQuery.data?.data ?? []).find(
        (booking) => booking._id === bookingId,
      ),
    [bookingId, landlordBookingsQuery.data?.data],
  )

  const hasExistingContractFile = Boolean(
    contract?.contractFileStorageKey ?? contract?.contractFileUrl,
  )
  const existingContractFileName = getExistingContractFileName(contract)

  function updateField(name: keyof ContractFieldsState, value: string) {
    dispatchFields({ type: 'fieldChanged', name, value })
  }

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()

    const payload = {
      monthlyRent: Number(monthlyRent),
      depositAmount: optionalNumber(depositAmount),
      terms: terms.trim() || undefined,
      startDate: startDate ? toIsoDate(startDate) : undefined,
      endDate: endDate ? toIsoDate(endDate) : undefined,
    }

    if (mode === 'create') {
      const validationResult = createContractSchema.safeParse({
        ...payload,
        bookingId: bookingId.trim(),
      })

      if (!validationResult.success) {
        toast.error(getSchemaErrorMessage(validationResult.error))
        return
      }

      onSubmit({
        ...validationResult.data,
        contractFile,
      })
      return
    }

    if (mode === 'renew') {
      const validationResult = renewContractSchema.safeParse({
        ...payload,
        startDate: toIsoDate(startDate),
      })

      if (!validationResult.success) {
        toast.error(getSchemaErrorMessage(validationResult.error))
        return
      }

      onSubmit({
        ...validationResult.data,
        contractFile,
      })
      return
    }

    const validationResult = updateContractSchema.safeParse(payload)

    if (!validationResult.success) {
      toast.error(getSchemaErrorMessage(validationResult.error))
      return
    }

    onSubmit({
      ...validationResult.data,
      contractFile,
    })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {mode === 'create' ? (
        <div className="relative block space-y-2 text-sm font-semibold text-foreground">
          <label htmlFor="contract-booking-id">Booking *</label>
          <Input
            id="contract-booking-id"
            required={!bookingId}
            value={bookingSearch}
            onBlur={() =>
              window.setTimeout(
                () =>
                  dispatchFields({
                    type: 'bookingPickerChanged',
                    open: false,
                  }),
                120,
              )
            }
            onChange={(event) => {
              updateField('bookingSearch', event.target.value)
              updateField('bookingId', '')
              dispatchFields({ type: 'bookingPickerChanged', open: true })
            }}
            onFocus={() =>
              dispatchFields({ type: 'bookingPickerChanged', open: true })
            }
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
            placeholder="Nhập ID hoặc tìm theo tên người đặt"
            autoComplete="off"
          />
          {selectedBooking ? (
            <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-2.5">
              <p className="truncate text-sm font-bold text-foreground">
                {getBookingTenant(selectedBooking)?.fullName ??
                  getBookingTenant(selectedBooking)?.email ??
                  'Người thuê'}
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                {getBookingRoom(selectedBooking)?.title ?? 'Phòng chưa có thông tin'}
                {selectedBooking.checkInDate
                  ? ` - Xem phòng ${formatBookingDate(selectedBooking.checkInDate)}`
                  : ''}
              </p>
            </div>
          ) : null}
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
                      updateField('bookingId', booking._id)
                      updateField('bookingSearch', '')
                      dispatchFields({
                        type: 'bookingPickerChanged',
                        open: false,
                      })
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
        <label
          className="block space-y-2 text-sm font-semibold text-foreground"
          htmlFor="contract-monthly-rent"
        >
          <span>Tiền thuê hàng tháng *</span>
          <Input
            id="contract-monthly-rent"
            type="number"
            min={0}
            required
            value={monthlyRent}
            onChange={(event) => updateField('monthlyRent', event.target.value)}
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
          />
        </label>
        <label
          className="block space-y-2 text-sm font-semibold text-foreground"
          htmlFor="contract-deposit-amount"
        >
          <span>Tiền cọc</span>
          <Input
            id="contract-deposit-amount"
            type="number"
            min={0}
            value={depositAmount}
            onChange={(event) => updateField('depositAmount', event.target.value)}
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
          />
        </label>
        <label
          className="block space-y-2 text-sm font-semibold text-foreground"
          htmlFor="contract-start-date"
        >
          <span>Ngày bắt đầu {mode === 'renew' ? '*' : ''}</span>
          <Input
            id="contract-start-date"
            type="date"
            required={mode === 'renew'}
            value={startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
          />
        </label>
        <label
          className="block space-y-2 text-sm font-semibold text-foreground"
          htmlFor="contract-end-date"
        >
          <span>Ngày kết thúc</span>
          <Input
            id="contract-end-date"
            type="date"
            min={startDate || undefined}
            value={endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            className="h-11 border border-primary/10 px-3 text-sm shadow-none"
          />
        </label>
      </div>

      <label
        className="block space-y-2 text-sm font-semibold text-foreground"
        htmlFor="contract-file"
      >
        <span>File hợp đồng (PDF)</span>
        <Input
          id="contract-file"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const nextFile = event.target.files?.[0]
            if (!nextFile) {
              setContractFile(undefined)
              return
            }

            if (nextFile.type !== 'application/pdf') {
              toast.error('Vui lòng chọn file PDF')
              event.target.value = ''
              return
            }

            setContractFile(nextFile)
          }}
          className="h-11 border border-primary/10 px-3 py-2 text-sm shadow-none file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
        />
        <p className="text-xs font-medium text-slate-500">
          {contractFile
            ? `Đã chọn: ${contractFile.name}`
            : hasExistingContractFile
              ? `Giữ file hiện tại: ${existingContractFileName}`
              : 'Chưa tải file hợp đồng'}
        </p>
      </label>

      <label
        className="block space-y-2 text-sm font-semibold text-foreground"
        htmlFor="contract-terms"
      >
        <span>Điều khoản</span>
        <textarea
          id="contract-terms"
          value={terms}
          onChange={(event) => updateField('terms', event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isPending || (mode === 'create' && !bookingId)}
        >
          <FileText className="size-4" />
          {isPending ? 'Đang lưu...' : 'Lưu hợp đồng'}
        </Button>
      </div>
    </form>
  )
}
