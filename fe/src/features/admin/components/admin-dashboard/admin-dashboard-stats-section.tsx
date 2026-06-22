import type { DashboardStat } from '../../hooks/use-admin-dashboard'
import { StatTile } from './admin-dashboard-primitives'

type AdminDashboardStatsSectionProps = {
  stats: DashboardStat[]
  isLoading: boolean
}

export function AdminDashboardStatsSection({
  stats,
  isLoading,
}: AdminDashboardStatsSectionProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4 2xl:gap-5">
      {stats.map((stat) => (
        <StatTile
          key={stat.label}
          label={stat.label}
          value={isLoading ? '-' : stat.value}
          detail={stat.detail}
          icon={stat.icon}
        />
      ))}
    </section>
  )
}
