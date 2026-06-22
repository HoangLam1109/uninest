import {
  Activity,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { InsightCard } from './admin-dashboard-primitives'
import { formatCurrency, formatRelativePercent, type RoleBreakdownPoint } from '../../hooks/use-admin-dashboard'
import type { AdminPaymentStats } from '@/features/payment/types/payment.type'

type AdminDashboardHeroSectionProps = {
  collectionRate: number
  monthGrowth: number
  isLoading: boolean
  paymentStats?: AdminPaymentStats
  roleBreakdown: RoleBreakdownPoint[]
}

export function AdminDashboardHeroSection({
  collectionRate,
  monthGrowth,
  isLoading,
  paymentStats,
  roleBreakdown,
}: AdminDashboardHeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-white shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(15,23,42,0.05),transparent_28%)]" />
      <div className="relative grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1.16fr)_360px] xl:gap-8 2xl:grid-cols-[minmax(0,1.28fr)_420px] 2xl:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <Activity className="size-3.5" />
            Admin Console
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
            Toàn cảnh vận hành, dòng tiền và sức khỏe nền tảng UniNest
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Một màn hình theo dõi dành cho admin để nhìn nhanh tăng trưởng,
            chất lượng thanh toán và vùng cần can thiệp trong ngày.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
            <InsightCard
              title="Tỷ lệ thu tiền"
              value={isLoading ? '-' : formatRelativePercent(collectionRate)}
              detail={`${paymentStats?.completedCount ?? 0}/${paymentStats?.totalPayments ?? 0} giao dịch hoàn tất`}
              tone="success"
            />
            <InsightCard
              title="Tăng trưởng tháng"
              value={isLoading ? '-' : formatRelativePercent(monthGrowth)}
              detail="So với tháng trước"
            />
            <InsightCard
              title="Cần theo dõi"
              value={
                isLoading
                  ? '-'
                  : String(
                      (paymentStats?.pendingCount ?? 0) +
                        (paymentStats?.failedCount ?? 0),
                    )
              }
              detail="Pending và failed payments"
              tone="warning"
            />
          </div>
        </div>

        <div className="grid gap-3 self-start xl:gap-4">
          <article className="rounded-3xl border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Health snapshot
                </p>
                <h2 className="mt-2 text-lg font-bold">Tín hiệu hệ thống</h2>
              </div>
              <ShieldCheck className="size-5 text-emerald-300" />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Doanh thu chờ xử lý
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {isLoading
                    ? '-'
                    : formatCurrency(paymentStats?.pendingAmount ?? 0)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Thanh toán lỗi</p>
                    <TriangleAlert className="size-4 text-amber-300" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {isLoading ? '-' : paymentStats?.failedCount ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Cần kiểm tra lại luồng
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Vai trò mạnh nhất</p>
                    <Users className="size-4 text-blue-300" />
                  </div>
                  <p className="mt-3 text-lg font-bold">
                    {roleBreakdown[0]?.label ?? 'Chưa có dữ liệu'}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {roleBreakdown[0]?.value?.toLocaleString('vi-VN') ?? 0} tài khoản
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
