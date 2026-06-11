import { useState } from 'react'
import {
  CalendarDays,
  CreditCard,
  Phone,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Identity } from '../types/identity.type'

type IdentityDetailProps = {
  identity: Identity
  className?: string
}

const statusLabels: Record<string, string> = {
  PENDING_VERIFICATION: 'Chờ xác minh',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Đã từ chối',
}

const statusStyles: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-amber-500/10 text-amber-700',
  VERIFIED: 'bg-green-500/10 text-green-700',
  REJECTED: 'bg-red-500/10 text-red-600',
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Chưa cập nhật'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

function ImageLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="overflow-hidden rounded-lg border border-border transition hover:ring-2 hover:ring-primary/50"
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="aspect-16/10 w-full object-cover"
        />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  )
}

export function IdentityDetail({ identity, className }: IdentityDetailProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold',
            statusStyles[identity.status],
          )}
        >
          {statusLabels[identity.status] ?? identity.status}
        </span>
        {identity.verifiedAt ? (
          <span className="text-xs text-slate-400">
            Xác minh {formatDate(identity.verifiedAt)}
          </span>
        ) : null}
      </div>

      {/* Personal Info */}
      <div className="grid gap-2 rounded-xl border border-border bg-surface p-4 text-sm">
        <InfoRow icon={<User className="size-4" />} label="Họ tên" value={identity.fullName} />
        <InfoRow
          icon={<CalendarDays className="size-4" />}
          label="Ngày sinh"
          value={formatDate(identity.dateOfBirth)}
        />
        <InfoRow icon={<Phone className="size-4" />} label="Số điện thoại" value={identity.phone} />
        <InfoRow
          icon={<CreditCard className="size-4" />}
          label="CCCD/CMND"
          value={identity.cccdNumber}
        />
      </div>

      {/* CCCD Images */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Ảnh CCCD/CMND</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <ImageLightbox src={identity.cccdFrontImage} alt="CCCD mặt trước" />
            <p className="mt-1 text-center text-xs text-slate-500">Mặt trước</p>
          </div>
          <div>
            <ImageLightbox src={identity.cccdBackImage} alt="CCCD mặt sau" />
            <p className="mt-1 text-center text-xs text-slate-500">Mặt sau</p>
          </div>
        </div>
      </div>

      {/* Co-tenants */}
      {identity.coTenants.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Users className="size-4" />
            Người thuê cùng ({identity.coTenants.length})
          </p>
          <div className="space-y-2">
            {identity.coTenants.map((ct, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-surface p-3 text-sm"
              >
                <p className="font-bold text-foreground">{ct.fullName}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                  {ct.dateOfBirth ? <span>🎂 {formatDate(ct.dateOfBirth)}</span> : null}
                  {ct.phone ? <span>📱 {ct.phone}</span> : null}
                  {ct.cccdNumber ? <span>🪪 {ct.cccdNumber}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span className="min-w-0 text-slate-500">{label}:</span>
      <span className="truncate font-semibold text-foreground">{value}</span>
    </div>
  )
}
