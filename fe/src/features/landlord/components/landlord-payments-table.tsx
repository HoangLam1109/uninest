import { Eye } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  paymentStatusLabels,
  paymentStatusStyles,
  recentPayments,
} from '../data'

export function LandlordPaymentsTable() {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/10 bg-white">
      <div className="flex flex-col gap-2 border-b border-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-6">
        <h2 className="text-base font-bold text-slate-900 md:text-lg">
          Thanh toán gần đây
        </h2>
        <Button
          variant="ghost"
          className="h-auto w-fit min-w-0 p-0 text-sm font-medium text-primary hover:bg-transparent"
        >
          Xem tất cả
        </Button>
      </div>

      {/* Mobile & small tablet: card list */}
      <ul className="divide-y divide-primary/5 md:hidden">
        {recentPayments.map((payment) => (
          <li key={payment.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  name={payment.tenantName}
                  className="size-9 shrink-0 bg-slate-200 text-xs text-slate-700"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {payment.tenantName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {payment.room} · {payment.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 text-slate-400 transition-colors hover:text-primary"
                aria-label={`Xem chi tiết ${payment.tenantName}`}
              >
                <Eye className="size-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-bold text-slate-900">{payment.amount}</p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusStyles[payment.status]}`}
              >
                {paymentStatusLabels[payment.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet & laptop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm lg:min-w-[720px]">
          <thead className="bg-primary/5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Người thuê</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Số phòng</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Ngày thanh toán</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Số tiền</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Trạng thái</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment, index) => (
              <tr
                key={payment.id}
                className={index > 0 ? 'border-t border-primary/5' : undefined}
              >
                <td className="px-4 py-3 lg:px-6 lg:py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={payment.tenantName}
                      className="size-8 bg-slate-200 text-xs text-slate-700"
                    />
                    <span className="font-medium text-slate-900">
                      {payment.tenantName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 lg:px-6 lg:py-4">
                  {payment.room}
                </td>
                <td className="px-4 py-3 text-slate-600 lg:px-6 lg:py-4">
                  {payment.date}
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 lg:px-6 lg:py-4">
                  {payment.amount}
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusStyles[payment.status]}`}
                  >
                    {paymentStatusLabels[payment.status]}
                  </span>
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4">
                  <button
                    type="button"
                    className="text-slate-400 transition-colors hover:text-primary"
                    aria-label={`Xem chi tiết ${payment.tenantName}`}
                  >
                    <Eye className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
