import { useState } from 'react'
import { Eye, FileText, Mail, Phone, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'
import { useGetMyIdentities } from '@/features/identity/hooks/use-identities'
import { IdentityFormModal } from '@/features/identity/components/identity-form-modal'
import { IdentityDetail } from '@/features/identity/components/identity-detail'
import { userApi } from '@/features/user/api/user.api'
import type { Identity } from '@/features/identity/types/identity.type'
import { cn } from '@/lib/utils'

export function TenantProfilePage() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const { data: identities = [], isLoading } = useGetMyIdentities()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewingIdentity, setViewingIdentity] = useState<Identity | null>(null)

  async function handleAvatarUpload(file: File) {
    const { data } = await userApi.uploadAvatar(file)
    if (user && data.data) {
      setUser({ ...user, avatarUrl: data.data.avatarUrl })
    }
    return { avatarUrl: data.data.avatarUrl }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin cá nhân và hồ sơ định danh của bạn.
        </p>
      </header>

      {/* ── User info card ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <AvatarUpload
            name={user?.fullName ?? ''}
            src={user?.avatarUrl}
            onUpload={handleAvatarUpload}
          />
          <div className="min-w-0 pt-1">
            <h2 className="text-lg font-bold text-slate-950">{user?.fullName}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              {user?.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
              ) : null}
              {user?.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {user.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Identity section ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Hồ sơ định danh</h2>
            <p className="text-sm text-slate-500">
              Hồ sơ định danh giúp chủ trọ xác minh danh tính khi bạn đặt phòng.
            </p>
          </div>
          <Button
            className="shrink-0 gap-1.5"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="size-4" />
            Tạo hồ sơ
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-border/60" />
            ))}
          </div>
        ) : identities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <Shield className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Bạn chưa có hồ sơ định danh nào
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Tạo hồ sơ định danh để có thể đặt phòng và ký hợp đồng thuê.
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-1.5"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="size-4" />
              Tạo hồ sơ ngay
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {identities.map((identity) => (
              <div
                key={identity._id}
                className="flex items-center gap-4 rounded-xl border border-primary/10 bg-white p-4 shadow-sm transition hover:border-primary/30"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="size-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{identity.fullName}</p>
                  <p className="text-sm text-slate-500">
                    CCCD: {identity.cccdNumber} • {identity.phone}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
                    identity.status === 'VERIFIED'
                      ? 'bg-green-500/10 text-green-600'
                      : identity.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-600'
                        : 'bg-amber-500/10 text-amber-600',
                  )}
                >
                  {identity.status === 'VERIFIED'
                    ? 'Đã xác minh'
                    : identity.status === 'REJECTED'
                      ? 'Từ chối'
                      : 'Chờ xác minh'}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => setViewingIdentity(identity)}
                >
                  <Eye className="size-3.5" />
                  Xem
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <IdentityFormModal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        hideUserSearch
      />

      <Modal
        open={Boolean(viewingIdentity)}
        onClose={() => setViewingIdentity(null)}
        title="Chi tiết hồ sơ định danh"
        className="max-w-lg"
      >
        {viewingIdentity ? (
          <IdentityDetail identity={viewingIdentity} />
        ) : null}
      </Modal>
    </div>
  )
}
