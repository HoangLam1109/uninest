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
      <div className="flex items-center justify-between border-b border-primary/10 px-6 py-6">
        <h2 className="text-lg font-bold text-slate-900">Thanh toán gần đây</h2>
        <Button variant="ghost" className="h-auto min-w-0 p-0 text-sm font-medium text-primary hover:bg-transparent">
          Xem tất cả
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-primary/5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Người thuê</th>
              <th className="px-6 py-4">Số phòng</th>
              <th className="px-6 py-4">Ngày thanh toán</th>
              <th className="px-6 py-4">Số tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment, index) => (
              <tr
                key={payment.id}
                className={index > 0 ? 'border-t border-primary/5' : undefined}
              >
                <td className="px-6 py-4">
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
                <td className="px-6 py-4 text-slate-600">{payment.room}</td>
                <td className="px-6 py-4 text-slate-600">{payment.date}</td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {payment.amount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusStyles[payment.status]}`}
                  >
                    {paymentStatusLabels[payment.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
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
