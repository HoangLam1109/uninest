import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  useGetAdminBankAccounts,
  useVerifyBankAccount,
  useRejectBankAccount,
} from '../hooks/use-bank-accounts'
import type { BankAccount, BankAccountStatus } from '../types/bank-account.type'

type StatusFilter = 'all' | BankAccountStatus

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING_VERIFICATION', label: 'Chờ duyệt' },
  { value: 'VERIFIED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

const statusLabels: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'Chờ duyệt',
  VERIFIED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

const statusStyles: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getOwner(bankAccount: BankAccount) {
  const owner = bankAccount.userId
  return typeof owner === 'object' && owner !== null ? owner : null
}

export function AdminBankAccountModerationPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('PENDING_VERIFICATION')
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  const { data: accounts = [], isLoading } = useGetAdminBankAccounts(
    status === 'all' ? undefined : status,
  )
  const verifyMutation = useVerifyBankAccount()
  const rejectMutation = useRejectBankAccount()

  const filtered = accounts.filter((account) => {
    if (!search.trim()) return true
    const q = normalize(search)
    const owner = getOwner(account)
    return (
      (owner?.fullName && normalize(owner.fullName).includes(q)) ||
      (owner?.email && normalize(owner.email).includes(q))
    )
  })

  const handleVerify = async (id: string) => {
    await verifyMutation.mutateAsync(id)
    setSelectedAccount(null)
  }

  const handleReject = async (id: string) => {
    await rejectMutation.mutateAsync(id)
    setSelectedAccount(null)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Duyệt tài khoản ngân hàng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kiểm duyệt thông tin tài khoản ngân hàng của chủ nhà
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, số TK, ngân hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                status === opt.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
          <Building2 className="size-10" />
          <p className="text-sm font-medium">Không có tài khoản nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((account) => {
            const owner = getOwner(account)
            return (
              <div
                key={account._id}
                className={cn(
                  'rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md',
                  statusStyles[account.status],
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4" />
                      <span className="font-bold text-slate-900">
                        {owner?.fullName ?? 'PayOS Merchant'}
                      </span>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold',
                        account.status === 'PENDING_VERIFICATION' && 'bg-amber-100 text-amber-700',
                        account.status === 'VERIFIED' && 'bg-emerald-100 text-emerald-700',
                        account.status === 'REJECTED' && 'bg-red-100 text-red-600',
                      )}>
                        {statusLabels[account.status]}
                      </span>
                    </div>
                    {owner && (
                      <div className="text-sm text-slate-500">
                        {owner.email}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      Keys đã được ẩn vì lý do bảo mật
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <Eye className="size-4" />
                    </Button>

                    {account.status === 'PENDING_VERIFICATION' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleVerify(account._id)}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle2 className="size-4" />
                          Duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(account._id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="size-4" />
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title="Chi tiết tài khoản PayOS"
      >
        {selectedAccount && (() => {
          const owner = getOwner(selectedAccount)
          return (
          <div className="space-y-4">
            <DetailRow label="Chủ sở hữu" value={owner?.fullName ?? '\u2014'} />
            <DetailRow label="Email" value={owner?.email ?? '\u2014'} />
            <DetailRow
              label="Trạng thái"
              value={statusLabels[selectedAccount.status]}
            />

            {selectedAccount.status === 'PENDING_VERIFICATION' && (
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleVerify(selectedAccount._id)}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Duyệt
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(selectedAccount._id)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="size-4" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>
          )
        })()}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}
