import { CreditCard, Users } from 'lucide-react'
import type { AdminPayment } from '@/features/payment/types/payment.type'
import {
  formatCurrency,
  getPaymentDate,
  getPaymentUserName,
  type RoleBreakdownPoint,
  typeLabels,
} from '../../hooks/use-admin-dashboard'
import { SectionPanel } from './admin-dashboard-primitives'

type AdminDashboardActivitySectionProps = {
  usersCount: number
  roleBreakdown: RoleBreakdownPoint[]
  recentPayments: AdminPayment[]
  isLoading: boolean
}

export function AdminDashboardActivitySection({
  usersCount,
  roleBreakdown,
  recentPayments,
  isLoading,
}: AdminDashboardActivitySectionProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.12fr)] 2xl:grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)] 2xl:gap-5">
      <SectionPanel
        eyebrow="Phân bổ người dùng"
        title="Cơ cấu vai trò trên hệ thống"
        icon={Users}
      >
        <div className="space-y-4">
          {roleBreakdown.map((item, index) => {
            const width =
              usersCount > 0 ? `${(item.value / usersCount) * 100}%` : '0%'

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-950">
                    {item.value.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </SectionPanel>

      <SectionPanel
        eyebrow="Thanh toán mới"
        title="5 giao dịch gần nhất"
        icon={CreditCard}
      >
        <div className="space-y-3">
          {recentPayments.length === 0 && !isLoading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
              Chưa có thanh toán gần đây.
            </div>
          ) : null}

          {recentPayments.map((payment) => (
            <article
              key={payment._id}
              className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  {getPaymentUserName(payment.payerId)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {typeLabels[payment.type]} ·{' '}
                  {new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(getPaymentDate(payment))}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-slate-950">
                  {formatCurrency(payment.amount)}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    payment.status === 'COMPLETED'
                      ? 'bg-green-50 text-green-700'
                      : payment.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  {payment.status === 'COMPLETED'
                    ? 'Hoàn tất'
                    : payment.status === 'PENDING'
                      ? 'Đang chờ'
                      : payment.status === 'FAILED'
                        ? 'Thất bại'
                        : payment.status === 'REFUNDED'
                          ? 'Hoàn tiền'
                          : 'Đã hủy'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </SectionPanel>
    </section>
  )
}
