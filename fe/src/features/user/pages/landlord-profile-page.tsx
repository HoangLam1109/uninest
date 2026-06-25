import { useState } from 'react'
import {
  Building2,
  Camera,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '@/features/user/hooks/use-users'
import {
  useCreateBankAccount,
  useGetMyBankAccounts,
  useTestPayOSConnection,
  useUpdateBankAccount,
} from '@/features/bank-account/hooks/use-bank-accounts'
import type { BankAccount, BankAccountStatus } from '@/features/bank-account/types/bank-account.type'

// ─── Bank Account Status Badge ──────────────────────────────────────────
const bankStatusLabels: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'Đang chờ duyệt',
  VERIFIED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

const bankStatusStyles: Record<BankAccountStatus, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
}

// ─── Bank Account Section ────────────────────────────────────────────────
function BankAccountSection() {
  const { data: accounts, isLoading } = useGetMyBankAccounts()
  const createMutation = useCreateBankAccount()
  const updateMutation = useUpdateBankAccount()
  const testConnection = useTestPayOSConnection()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const startEdit = (account: BankAccount) => {
    setPayosClientId(account.payosClientId ?? '')
    setPayosApiKey(account.payosApiKey ?? '')
    setPayosChecksumKey(account.payosChecksumKey ?? '')
    setEditingId(account._id)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Tài khoản ngân hàng</h3>
        {canAdd && !showForm && (
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
            <Building2 className="size-4" />
            Thêm
          </Button>
        )}
      </div>

      {/* Existing bank accounts */}
      {accounts?.map((account) => (
        <div
          key={account._id}
          className={cn('rounded-xl border p-4', bankStatusStyles[account.status])}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold">PayOS Merchant</p>
              <p className="mt-0.5 text-sm">Client ID: {(account.payosClientId ?? '').slice(0, 16)}...</p>
              <p className="text-sm opacity-70">API Key: ••••••••••••••••</p>
            </div>
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-bold',
              account.status === 'PENDING_VERIFICATION' && 'bg-amber-100 text-amber-700',
              account.status === 'VERIFIED' && 'bg-emerald-100 text-emerald-700',
              account.status === 'REJECTED' && 'bg-red-100 text-red-600',
            )}>
              {bankStatusLabels[account.status]}
            </span>
          </div>

          {account.status === 'REJECTED' && !showForm && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => startEdit(account)}
            >
              Cập nhật lại
            </Button>
          )}
        </div>
      ))}

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-700">
              {editingId ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
            </h4>
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

          <p className="text-xs text-slate-400">
            Tài khoản sẽ được admin kiểm duyệt trước khi hiển thị trên hóa đơn.
          </p>
        </form>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export function LandlordProfilePage() {
  const authUser = useAuthStore((s) => s.user)
  const { data: profile, isLoading: profileLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const displayUser = profile || authUser

  const handleStartEdit = () => {
    setFullName(displayUser?.fullName ?? '')
    setPhone(displayUser?.phone ?? '')
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
  }

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({ fullName, phone })
    setEditing(false)
  }

  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar.mutateAsync(file)
    return { avatarUrl: result.avatarUrl }
  }

  if (profileLoading && !authUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin cá nhân và tài khoản ngân hàng của bạn
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar
            name={displayUser?.fullName ?? '?'}
            src={displayUser?.avatarUrl}
            className="size-28 text-3xl"
          />
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                await handleAvatarUpload(file)
              }}
            />
          </label>
        </div>
        <p className="text-xs text-slate-400">Nhấn vào ảnh để thay đổi</p>
      </div>

      {/* Profile Info Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Lưu
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Họ và tên
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Số điện thoại
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ProfileRow
              icon={<User className="size-4" />}
              label="Họ và tên"
              value={displayUser?.fullName ?? '\u2014'}
            />
            <ProfileRow
              icon={<Mail className="size-4" />}
              label="Email"
              value={displayUser?.email ?? '\u2014'}
            />
            <ProfileRow
              icon={<Phone className="size-4" />}
              label="Số điện thoại"
              value={displayUser?.phone ?? '\u2014'}
            />
          </div>
        )}
      </div>

      {/* Bank Account Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <BankAccountSection />
      </div>
    </div>
  )
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50">
      <span className="inline-flex items-center gap-2.5 text-sm text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}
