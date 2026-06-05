import { useState, type ComponentProps } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
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
          <label className="block space-y-2 text-sm font-semibold text-foreground">
            <span>Booking ID *</span>
            <Input
              required
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
              className="h-11 border border-primary/10 px-3 text-sm shadow-none"
              placeholder="665a1b2c3d4e5f6a7b8c9d0e"
            />
          </label>
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
