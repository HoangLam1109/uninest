import { TrendingUp } from 'lucide-react'
import { landlordStats } from '../data'

export function LandlordStatCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {landlordStats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-primary/10 bg-white p-6"
        >
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${stat.badgeClass}`}
            >
              {stat.label === 'Doanh thu tháng này' ? (
                <TrendingUp className="size-3" />
              ) : null}
              {stat.badge}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
