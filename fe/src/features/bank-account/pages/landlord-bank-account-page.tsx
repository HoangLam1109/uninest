import { useState } from 'react'
import {
  Building2,
  CreditCard,
  Upload,
  User,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateBankAccount, useGetMyBankAccounts, useUpdateBankAccount } from '../hooks/use-bank-accounts'
import type { BankAccount, BankAccountStatus } from '../types/bank-account.type'

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

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)

  const hasVerified = accounts?.some((a) => a.status === 'VERIFIED')
  const hasPending = accounts?.some((a) => a.status === 'PENDING_VERIFICATION')
  const rejectedAccount = accounts?.find((a) => a.status === 'REJECTED')

  const resetForm = () => {
    setBankName('')
    setAccountNumber('')
    setAccountHolder('')
    setQrFile(null)
    setQrPreview(null)
    setEditingId(null)
  }

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setQrFile(file)
    setQrPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankName || !accountNumber || !accountHolder) return

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        payload: {
          bankName,
          accountNumber,
          accountHolder,
          ...(qrFile ? { qrCode: qrFile } : {}),
        },
      })
    } else {
      await createMutation.mutateAsync({
        bankName,
        accountNumber,
        accountHolder,
        ...(qrFile ? { qrCode: qrFile } : {}),
      })
    }

    resetForm()
    setShowForm(false)
  }

  const startEdit = (account: BankAccount) => {
    setBankName(account.bankName)
    setAccountNumber(account.accountNumber)
    setAccountHolder(account.accountHolder)
    setQrPreview(account.qrCodeImage ?? null)
    setQrFile(null)
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
        <h1 className="text-2xl font-black text-slate-900">Tài khoản ngân hàng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin tài khoản sẽ được đính kèm vào hóa đơn gửi cho người thuê
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
              <InfoRow icon={Building2} label="Ngân hàng" value={account.bankName} />
              <InfoRow icon={CreditCard} label="Số tài khoản" value={account.accountNumber} />
              <InfoRow icon={User} label="Chủ tài khoản" value={account.accountHolder} />
            </div>

            {account.qrCodeImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={account.qrCodeImage}
                  alt="QR Code"
                  className="max-h-48 rounded-lg border bg-white object-contain"
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Add / Edit Form */}
      {(!hasVerified && !hasPending) || rejectedAccount ? (
        <>
          {!showForm ? (
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="w-full"
            >
              <Building2 className="size-4" />
              {rejectedAccount ? 'Tạo tài khoản mới' : 'Thêm tài khoản ngân hàng'}
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                {editingId ? 'Cập nhật tài khoản' : 'Thêm tài khoản ngân hàng'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tên ngân hàng
                  </label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="VD: Vietcombank, Techcombank..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Số tài khoản
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Nhập số tài khoản"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Chủ tài khoản
                  </label>
                  <Input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Tên chủ tài khoản"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Mã QR (tùy chọn)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition-colors hover:border-primary hover:text-primary">
                      <Upload className="size-4" />
                      Tải QR lên
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrChange}
                        className="hidden"
                      />
                    </label>
                    {qrPreview && (
                      <img
                        src={qrPreview}
                        alt="QR Preview"
                        className="h-12 w-12 rounded-lg border object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {editingId ? 'Cập nhật' : 'Gửi duyệt'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                >
                  Hủy
                </Button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Tài khoản của bạn sẽ được admin kiểm duyệt trước khi hiển thị trên hóa đơn.
                </span>
              </div>
            </form>
          )}
        </>
      ) : null}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 opacity-60" />
      <span className="opacity-70">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
