import {
  ArrowUpRight,
  CheckCircle2,
  TriangleAlert,
} from 'lucide-react'
import type { AdminPaymentStats } from '@/features/payment/types/payment.type'
import { formatCurrency } from '../../hooks/use-admin-dashboard'

type AdminDashboardNoticesSectionProps = {
  paymentStats?: AdminPaymentStats
  currentMonthRevenue: number
}

export function AdminDashboardNoticesSection({
  paymentStats,
  currentMonthRevenue,
}: AdminDashboardNoticesSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
      <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-500">Tín hiệu tốt</p>
            <p className="mt-1 text-base font-bold text-slate-950">
              Luồng thu tiền đang giữ nhịp ổn định
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <TriangleAlert className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-500">Cần theo dõi</p>
            <p className="mt-1 text-base font-bold text-slate-950">
              {paymentStats?.pendingCount ?? 0} giao dịch chờ xác nhận
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ArrowUpRight className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Nhịp tăng trưởng
            </p>
            <p className="mt-1 text-base font-bold text-slate-950">
              {formatCurrency(currentMonthRevenue)} trong tháng hiện tại
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}
