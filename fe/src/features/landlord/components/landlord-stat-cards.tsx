import { TrendingUp } from 'lucide-react'
import { landlordStats } from '../data'

export function LandlordStatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-4">
      {landlordStats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-primary/10 bg-white p-4 md:p-5 lg:p-6"
        >
          <p className="text-xs font-medium text-slate-500 md:text-sm">{stat.label}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <p className="text-xl font-bold text-slate-900 md:text-2xl">{stat.value}</p>
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
