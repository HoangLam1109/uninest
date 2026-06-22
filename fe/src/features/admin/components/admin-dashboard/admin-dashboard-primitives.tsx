import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function StatTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{detail}</p>
    </article>
  )
}

export function InsightCard({
  title,
  value,
  detail,
  tone = 'default',
}: {
  title: string
  value: string
  detail: string
  tone?: 'default' | 'warning' | 'success'
}) {
  const toneClasses =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-primary/10 bg-slate-50'

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </article>
  )
}

export function SectionPanel({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      {children}
    </article>
  )
}
