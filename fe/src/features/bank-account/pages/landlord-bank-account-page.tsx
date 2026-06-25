import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateBankAccount, useGetMyBankAccounts, useUpdateBankAccount, useTestPayOSConnection } from '../hooks/use-bank-accounts'
import type { BankAccountStatus } from '../types/bank-account.type'

const statusLabels: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'Đang chờ duyệt',
  VERIFIED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

const statusStyles: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
}

const statusIcons: Record<BankAccountStatus, typeof Clock3> = {
  PENDING_VERIFICATION: Clock3,
  VERIFIED: CheckCircle2,
  REJECTED: XCircle,
}

export function LandlordBankAccountPage() {
  const { data: accounts, isLoading } = useGetMyBankAccounts()
  const createMutation = useCreateBankAccount()
  const updateMutation = useUpdateBankAccount()
  const testConnection = useTestPayOSConnection()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [payosClientId, setPayosClientId] = useState('')
  const [payosApiKey, setPayosApiKey] = useState('')
  const [payosChecksumKey, setPayosChecksumKey] = useState('')

  const hasVerified = accounts?.some((a) => a.status === 'VERIFIED')
  const hasPending = accounts?.some((a) => a.status === 'PENDING_VERIFICATION')
  const canAdd = !hasVerified && !hasPending

  const resetForm = () => {
    setPayosClientId('')
    setPayosApiKey('')
    setPayosChecksumKey('')
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payosClientId || !payosApiKey || !payosChecksumKey) return

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        payload: { payosClientId, payosApiKey, payosChecksumKey },
      })
    } else {
      await createMutation.mutateAsync({
        payosClientId, payosApiKey, payosChecksumKey,
      })
    }

    resetForm()
    setShowForm(false)
  }

  const startEdit = (account: NonNullable<typeof accounts>[number]) => {
    setPayosClientId(account.payosClientId ?? '')
    setPayosApiKey(account.payosApiKey ?? '')
    setPayosChecksumKey(account.payosChecksumKey ?? '')
    setEditingId(account._id)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Tài khoản PayOS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kết nối tài khoản PayOS để nhận thanh toán từ người thuê
        </p>
      </div>

      {/* Status Cards */}
      {accounts?.map((account) => {
        const StatusIcon = statusIcons[account.status]
        return (
          <div
            key={account._id}
            className={cn(
              'rounded-2xl border p-6',
              statusStyles[account.status],
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className="size-5" />
                <span className="font-bold">{statusLabels[account.status]}</span>
              </div>
              {account.status === 'REJECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(account)}
                >
                  Cập nhật lại
                </Button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Client ID:</span>{' '}
                {(account.payosClientId ?? '').slice(0, 16)}...
              </p>
              <p className="text-sm">
                <span className="font-medium">API Key:</span> ••••••••••••••••
              </p>
              <p className="text-sm">
                <span className="font-medium">Checksum Key:</span> ••••••••••••••••
              </p>
            </div>
          </div>
        )
      })}

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
            </h3>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(false) }}
              className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200"
            >
              <X className="size-4" />
            </button>
          </div>

          <Input
            placeholder="PayOS Client ID"
            value={payosClientId}
            onChange={(e) => setPayosClientId(e.target.value)}
            required
          />
          <Input
            placeholder="PayOS API Key"
            value={payosApiKey}
            onChange={(e) => setPayosApiKey(e.target.value)}
            required
          />
          <Input
            placeholder="PayOS Checksum Key"
            value={payosChecksumKey}
            onChange={(e) => setPayosChecksumKey(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {editingId ? 'Cập nhật' : 'Gửi duyệt'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={!payosClientId || !payosApiKey || !payosChecksumKey || testConnection.isPending}
            onClick={() =>
              testConnection.mutate({ payosClientId, payosApiKey, payosChecksumKey })
            }
          >
            {testConnection.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4" />
            )}
            Kiểm tra kết nối
          </Button>

          <p className="text-center text-xs text-slate-400">
            Tài khoản sẽ được admin kiểm duyệt trước khi hiển thị trên hóa đơn.
          </p>
        </form>
      )}

      {/* Add new button */}
      {canAdd && !showForm && (
        <Button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="w-full"
          variant="outline"
        >
          <Building2 className="size-4" />
          Thêm tài khoản PayOS
        </Button>
      )}
    </div>
  )
}
