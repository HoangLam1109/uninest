import {
  CheckCircle2,
  Clock3,
  FileText,
  PenLine,
  XCircle,
} from 'lucide-react'
import type { Contract, ContractStatus } from '../types/contract.type'

type ContractSummaryProps = {
  contracts: Contract[]
  total?: number
  mode: 'tenant' | 'landlord'
}

const defaultSummary: Record<ContractStatus, number> = {
  DRAFT: 0,
  PENDING_TENANT_SIGNATURE: 0,
  ACTIVE: 0,
  EXPIRED: 0,
  TERMINATED: 0,
}

export function ContractSummary({ contracts, total, mode }: ContractSummaryProps) {
  const summary = contracts.reduce(
    (acc, contract) => {
      acc[contract.status] += 1
      return acc
    },
    { ...defaultSummary },
  )

  const items = [
    {
      label: 'Tổng hợp đồng',
      value: total ?? contracts.length,
      icon: FileText,
      className: 'text-slate-900',
    },
    {
      label: 'Đang hiệu lực',
      value: summary.ACTIVE,
      icon: CheckCircle2,
      className: 'text-green-700',
    },
    {
      label: mode === 'tenant' ? 'Chờ bạn ký' : 'Chờ người thuê ký',
      value: summary.PENDING_TENANT_SIGNATURE,
      icon: PenLine,
      className: 'text-blue-700',
    },
    {
      label: 'Bản nháp',
      value: summary.DRAFT,
      icon: Clock3,
      className: 'text-amber-700',
    },
    {
      label: 'Đã kết thúc',
      value: summary.EXPIRED + summary.TERMINATED,
      icon: XCircle,
      className: 'text-red-600',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article
            key={item.label}
            className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {item.label}
              </p>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${item.className}`}>
              {item.value}
            </p>
          </article>
        )
      })}
    </div>
  )
}
