import { useState } from 'react'
import { Camera, Loader2, Mail, Phone, Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth.store'
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '@/features/user/hooks/use-users'
import { PaymentInfoSection } from '@/features/invoice/components/payment-info-section'

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

      {/* Payment Info Section — dành cho tenant chuyển khoản */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <PaymentInfoSection />
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
