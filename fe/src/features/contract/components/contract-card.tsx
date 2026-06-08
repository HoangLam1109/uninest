import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import { contractApi } from '../api/contract.api'
import type { Contract } from '../types/contract.type'
import {
  contractStatusLabels,
  contractStatusStyles,
  formatContractCurrency,
  formatContractDate,
  getContractPartyName,
  getContractRoomTitle,
} from '../lib/contract-display'

type ContractCardProps = {
  contract: Contract
  mode: 'tenant' | 'landlord'
  isActionPending?: boolean
  onEdit?: (contract: Contract) => void
  onActivate?: (contractId: string) => void
  onTerminate?: (contractId: string) => void
  onRenew?: (contract: Contract) => void
  onTenantSign?: (contract: Contract) => void
}

export function ContractCard({
  contract,
  mode,
  isActionPending,
  onEdit,
  onActivate,
  onTerminate,
  onRenew,
  onTenantSign,
}: ContractCardProps) {
  const [isOpeningFile, setIsOpeningFile] = useState(false)
  const canEdit = mode === 'landlord' && contract.status === 'DRAFT'
  const canActivate = mode === 'landlord' && contract.status === 'DRAFT'
  const canTerminate = mode === 'landlord' && contract.status === 'ACTIVE'
  const canTenantSign =
    mode === 'tenant' && contract.status === 'PENDING_TENANT_SIGNATURE'
  const canRenew =
    mode === 'landlord' &&
    (contract.status === 'ACTIVE' || contract.status === 'EXPIRED')
  const hasContractFile = Boolean(
    contract.signedContractStorageKey ??
      contract.signedContractFileUrl ??
      contract.contractFileUrl,
  )

  async function handleOpenFile() {
    try {
      setIsOpeningFile(true)
      const { data } = await contractApi.file(contract._id)
      const fileUrl = URL.createObjectURL(
        new Blob([data], { type: data.type || 'application/pdf' }),
      )
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error('Không thể mở file hợp đồng', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    } finally {
      setIsOpeningFile(false)
    }
  }

  return (
    <article className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                contractStatusStyles[contract.status],
              )}
            >
              {contractStatusLabels[contract.status]}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Tạo ngày {formatContractDate(contract.createdAt)}
            </span>
          </div>
          <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-950">
            {getContractRoomTitle(contract)}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <User className="size-4 shrink-0" />
            {mode === 'landlord'
              ? getContractPartyName(contract.tenantId)
              : getContractPartyName(contract.landlordId)}
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 px-4 py-3 text-left lg:text-right">
          <p className="text-xs font-bold uppercase text-primary">Tiền thuê</p>
          <p className="mt-1 text-lg font-bold text-primary">
            {formatContractCurrency(contract.monthlyRent)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">Ngày bắt đầu</p>
          <p className="mt-1 flex items-center gap-2 font-bold text-slate-950">
            <CalendarDays className="size-4 text-primary" />
            {formatContractDate(contract.startDate)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">Ngày kết thúc</p>
          <p className="mt-1 font-bold text-slate-950">
            {formatContractDate(contract.endDate)}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-slate-500">Tiền cọc</p>
          <p className="mt-1 font-bold text-slate-950">
            {formatContractCurrency(contract.depositAmount)}
          </p>
        </div>
      </div>

      {contract.terms ? (
        <p className="mt-4 rounded-lg border border-primary/10 bg-white p-3 text-sm leading-6 text-slate-600">
          {contract.terms}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {hasContractFile ? (
          <Button
            type="button"
            variant="outline"
            disabled={isActionPending || isOpeningFile}
            onClick={handleOpenFile}
          >
            <ExternalLink className="size-4" />
            {isOpeningFile ? 'Đang mở file' : 'Xem file'}
          </Button>
        ) : null}
        {canTenantSign ? (
          <Button
            type="button"
            disabled={isActionPending}
            onClick={() => onTenantSign?.(contract)}
          >
            <CheckCircle2 className="size-4" />
            Ký hợp đồng
          </Button>
        ) : null}
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            disabled={isActionPending}
            onClick={() => onEdit?.(contract)}
          >
            <FileText className="size-4" />
            Sửa
          </Button>
        ) : null}
        {canRenew ? (
          <Button
            type="button"
            variant="outline"
            disabled={isActionPending}
            onClick={() => onRenew?.(contract)}
          >
            <RefreshCw className="size-4" />
            Gia hạn
          </Button>
        ) : null}
        {canTerminate ? (
          <Button
            type="button"
            variant="outline"
            disabled={isActionPending}
            onClick={() => onTerminate?.(contract._id)}
          >
            <XCircle className="size-4" />
            Chấm dứt
          </Button>
        ) : null}
        {canActivate ? (
          <Button
            type="button"
            disabled={isActionPending}
            onClick={() => onActivate?.(contract._id)}
          >
            <CheckCircle2 className="size-4" />
            Gửi ký
          </Button>
        ) : null}
      </div>
    </article>
  )
}
