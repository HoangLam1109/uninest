import {
  LandlordCharts,
  LandlordDashboardHeader,
  LandlordPaymentsTable,
  LandlordStatCards,
} from '@/features/landlord'

export function LandlordDashboardPage() {
  return (
    <>
      <LandlordDashboardHeader />
      <LandlordStatCards />
      <LandlordCharts />
      <LandlordPaymentsTable />
    </>
  )
}
