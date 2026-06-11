import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, BarChart3 } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { InvoiceCard } from '../components/invoice-card'
import { useGetTenantInvoices } from '../hooks/use-invoices'
import { sumUnpaidAmount, formatPrice } from '../lib/invoice-display'

export function TenantInvoicesPage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const invoicesQuery = useGetTenantInvoices({ page, limit: 10 })
  const invoices = invoicesQuery.data?.data ?? []
  const pagination = invoicesQuery.data?.pagination

  const unpaidTotal = sumUnpaidAmount(invoices)
  const paidCount = invoices.filter((i) => i.status === 'PAID').length

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
            Hóa đơn của bạn
          </h1>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Cần thanh toán
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatPrice(unpaidTotal)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Đã thanh toán
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {paidCount}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Tổng
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {invoices.length}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900">Danh sách hóa đơn</h2>

      {invoicesQuery.isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Đang tải...</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-500">
            Chưa có hóa đơn
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Hóa đơn sẽ hiển thị khi chủ nhà gửi cho bạn.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv._id}
              invoice={inv}
              mode="tenant"
              onClick={(invoice) =>
                navigate(`/cu-dan/hoa-don/${invoice._id}`)
              }
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
