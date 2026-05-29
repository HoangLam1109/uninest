import { LandlordCharts } from './landlord-charts'
import { LandlordDashboardHeader } from './landlord-dashboard-header'
import { LandlordPaymentsTable } from './landlord-payments-table'
import { LandlordStatCards } from './landlord-stat-cards'

export function LandlordDashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      <LandlordDashboardHeader />
      <LandlordStatCards />
      <LandlordCharts />
      <LandlordPaymentsTable />
    </div>
  )
}
