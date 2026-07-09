import { useState } from 'react'
import {
  ArrowUpDown,
  Banknote,
  CheckCircle2,
  Clock3,
  Loader2,
  TrendingUp,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentApi } from '../api/payment.api'
import { useQuery } from '@tanstack/react-query'
import type { AdminPayment, AdminPaymentStats } from '../types/payment.type'

const TYPE_LABELS: Record<string, string> = {
  TENANT_PACKAGE: 'Gói Tenant',
  LANDLORD_PACKAGE: 'Gói Landlord',
  SERVICE_FEE: 'Phí dịch vụ',
  RENT: 'Thuê',
  DEPOSIT: 'Cọc',
  UTILITY: 'Tiện ích',
  REFUND: 'Hoàn tiền',
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
  REFUNDED: 'bg-blue-50 text-blue-600',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle2 className="size-3.5" />,
  PENDING: <Clock3 className="size-3.5" />,
  FAILED: <XCircle className="size-3.5" />,
  CANCELLED: <XCircle className="size-3.5" />,
  REFUNDED: <RefreshCw className="size-3.5" />,
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Thành công',
  PENDING: 'Đang xử lý',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn',
}

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + 'đ'
}

function formatDate(iso: string) {
  if (!iso) return '\u2014'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserName(user: string | { fullName?: string; email?: string }): string {
  if (typeof user === 'object' && user !== null) {
    return user.fullName || user.email || '\u2014'
  }
  return '\u2014'
}

export function AdminPackageRevenuePage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const limit = 20

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      const { data } = await paymentApi.adminGetPaymentStats()
      return data.data
    },
    refetchInterval: 30000,
  })

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: async () => {
      const { data } = await paymentApi.adminListPayments({ page, limit })
      return data
    },
  })

  const stats = statsData
  const payments = paymentsData?.data ?? []
  const pagination = paymentsData?.pagination

  // Filter by status on client side
  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter((p: AdminPayment) => p.status === statusFilter)

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Doanh thu gói dịch vụ</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các khoản tiền thu được từ việc bán gói Tenant và Landlord
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Tổng giao dịch"
            value={String(stats.totalPayments)}
            icon={<ArrowUpDown className="size-4" />}
          />
          <StatCard
            label="Tổng doanh thu"
            value={formatPrice(stats.totalAmount)}
            icon={<Banknote className="size-4" />}
            highlight
          />
          <StatCard
            label="Thành công"
            value={`${stats.completedCount} (${formatPrice(stats.completedAmount)})`}
            icon={<CheckCircle2 className="size-4" />}
            className="border-emerald-200 bg-emerald-50/50"
          />
          <StatCard
            label="Đang xử lý / Thất bại"
            value={`${stats.pendingCount} / ${stats.failedCount}`}
            icon={<Clock3 className="size-4" />}
            className="border-amber-200 bg-amber-50/50"
          />
        </div>
      ) : null}

      {/* Payment Table */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-bold text-slate-800">Danh sách giao dịch</h2>
          <div className="flex gap-1.5 rounded-lg bg-slate-100 p-1">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'COMPLETED', label: 'Thành công' },
              { value: 'PENDING', label: 'Đang xử lý' },
              { value: 'FAILED', label: 'Thất bại' },
              { value: 'CANCELLED', label: 'Đã hủy' },
              { value: 'REFUNDED', label: 'Đã hoàn' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1) }}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {paymentsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Chưa có giao dịch nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-6 py-3">Người mua</th>
                  <th className="px-6 py-3">Loại</th>
                  <th className="px-6 py-3">Số tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Mã GD</th>
                  <th className="px-6 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((p: AdminPayment) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {getUserName(p.payerId)}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {TYPE_LABELS[p.type] || p.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-bold text-slate-800">
                        {formatPrice(p.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
                        STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-500'
                      )}>
                        {STATUS_ICONS[p.status]}
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-slate-500">
                        {p.transactionRef || '\u2014'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-slate-400">
                        {formatDate(p.createdAt || '')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
            <span className="text-xs text-slate-400">
              Trang {pagination.page}/{pagination.totalPages} — Tổng {pagination.total} GD
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </button>
              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight,
  className,
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border bg-white p-4', className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
        {icon}
        {label}
      </p>
      <p className={cn('mt-1 text-xl font-bold', highlight ? 'text-emerald-600' : 'text-slate-900')}>
        {value}
      </p>
    </div>
  )
}
