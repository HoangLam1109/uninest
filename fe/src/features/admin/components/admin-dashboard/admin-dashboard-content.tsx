import { useAdminDashboard } from '../../hooks/use-admin-dashboard'
import { AdminDashboardActivitySection } from './admin-dashboard-activity-section'
import { AdminDashboardErrorState } from './admin-dashboard-error-state'
import { AdminDashboardHeroSection } from './admin-dashboard-hero-section'
import { AdminDashboardNoticesSection } from './admin-dashboard-notices-section'
import { AdminDashboardRevenueSection } from './admin-dashboard-revenue-section'
import { AdminDashboardStatsSection } from './admin-dashboard-stats-section'

type AdminDashboardContentProps = {
  dashboard: ReturnType<typeof useAdminDashboard>
}

export function AdminDashboardContent({
  dashboard,
}: AdminDashboardContentProps) {
  const {
    users,
    paymentStats,
    dashboardStats,
    revenueSeries,
    typeRevenue,
    roleBreakdown,
    recentPayments,
    currentMonthRevenue,
    collectionRate,
    monthGrowth,
    isLoading,
    hasError,
  } = dashboard

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-5 md:px-6 lg:px-8 xl:max-w-[1440px] xl:gap-7 xl:px-10 2xl:max-w-[1640px] 2xl:gap-8">
        <AdminDashboardHeroSection
          collectionRate={collectionRate}
          monthGrowth={monthGrowth}
          isLoading={isLoading}
          paymentStats={paymentStats}
          roleBreakdown={roleBreakdown}
        />

        {hasError ? <AdminDashboardErrorState /> : null}

        <AdminDashboardStatsSection stats={dashboardStats} isLoading={isLoading} />

        <AdminDashboardRevenueSection
          isLoading={isLoading}
          revenueSeries={revenueSeries}
          typeRevenue={typeRevenue}
        />

        <AdminDashboardActivitySection
          usersCount={users.length}
          roleBreakdown={roleBreakdown}
          recentPayments={recentPayments}
          isLoading={isLoading}
        />

        <AdminDashboardNoticesSection
          paymentStats={paymentStats}
          currentMonthRevenue={currentMonthRevenue}
        />
      </div>
    </div>
  )
}
