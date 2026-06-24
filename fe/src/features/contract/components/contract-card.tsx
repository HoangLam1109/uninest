import { useState } from 'react'
import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import { contractApi } from '../api/contract.api'
import {
  contractStatusLabels,
  contractStatusStyles,
  formatContractCurrency,
  formatContractDate,
  getContractPartyName,
  getContractRoomTitle,
} from '../lib/contract-display'
import type { Contract } from '../types/contract.type'

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
      contract.contractFileStorageKey ??
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
    <article className="relative flex min-h-full flex-col overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="h-1.5 bg-primary/80" />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              contractStatusStyles[contract.status],
            )}
          >
            {contractStatusLabels[contract.status]}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock3 className="size-3.5" />
            {formatContractDate(contract.createdAt)}
          </span>
        </div>

        <div className="mt-3 min-w-0">
          <h2 className="line-clamp-2 text-lg font-bold text-slate-950">
            {getContractRoomTitle(contract)}
          </h2>
          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500">
            <UserRound className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              {mode === 'landlord'
                ? getContractPartyName(contract.tenantId)
                : getContractPartyName(contract.landlordId)}
            </span>
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary">
            <BadgeDollarSign className="size-4" />
            Tiền thuê
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {formatContractCurrency(contract.monthlyRent)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Cọc {formatContractCurrency(contract.depositAmount)}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <CalendarDays className="size-3.5" />
              Bắt đầu
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {formatContractDate(contract.startDate)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <CalendarDays className="size-3.5" />
              Kết thúc
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {formatContractDate(contract.endDate)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600">
          {hasContractFile ? (
            <>
              <FileCheck2 className="size-4 text-green-700" />
              Đã có file hợp đồng
            </>
          ) : (
            <>
              <ShieldCheck className="size-4 text-slate-400" />
              Chưa có file hợp đồng
            </>
          )}
        </div>

        {contract.terms ? (
          <p className="mt-3 line-clamp-2 rounded-lg border border-primary/10 bg-white p-3 text-sm leading-6 text-slate-600">
            {contract.terms}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
          {hasContractFile ? (
            <Button
              type="button"
              size="sm"
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
              size="sm"
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
              size="sm"
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
              size="sm"
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
              size="sm"
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
              size="sm"
              disabled={isActionPending}
              onClick={() => onActivate?.(contract._id)}
            >
              <CheckCircle2 className="size-4" />
              Gửi ký
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
