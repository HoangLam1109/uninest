import { useState } from 'react'
import {
  CalendarDays,
  CreditCard,
  Phone,
  User,
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

const identityDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Chưa cập nhật'
  return identityDateFormatter.format(d)
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
