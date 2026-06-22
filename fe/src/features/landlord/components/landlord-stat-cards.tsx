import { landlordStats } from '../data'

export function LandlordStatCards() {
  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Tong quan chi so chu nha"
    >
      {landlordStats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm shadow-slate-200/40 md:p-5 lg:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ${stat.badgeClass}`}
            >
              {stat.badge}
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            {stat.value}
          </p>
        </article>
      ))}
    </section>
  )
}
