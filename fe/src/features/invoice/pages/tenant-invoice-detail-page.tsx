import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useGetInvoiceById,
  useGetInvoiceDetail,
} from '../hooks/use-invoices'
import {
  formatBillingMonth,
  formatInvoiceDate,
  formatPrice,
  getLandlordName,
  invoiceStatusLabels,
  invoiceStatusStyles,
} from '../lib/invoice-display'
import { cn } from '@/lib/utils'

function amountOrDash(value?: number) {
  if (value === undefined || value === null) return '—'
  return formatPrice(value)
}

export function TenantInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const invoiceQuery = useGetInvoiceById(id ?? null)
  const detailQuery = useGetInvoiceDetail(id ?? null)

  const invoice = invoiceQuery.data
  const detail = detailQuery.data

  const isLoading = invoiceQuery.isLoading
  const error = invoiceQuery.error

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-slate-400">Đang tải hóa đơn...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-red-500">Không tìm thấy hóa đơn</p>
        <Button variant="outline" onClick={() => navigate('/cu-dan/hoa-don')}>
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 2xl:mx-0 2xl:max-w-none">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/cu-dan/hoa-don')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Chi tiết hóa đơn</p>
          <h1 className="text-2xl font-bold text-slate-950">
            {formatBillingMonth(invoice.billingMonth)}
          </h1>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl bg-linear-to-br from-primary to-primary/80 p-6 text-white shadow-lg md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">
              {getLandlordName(invoice)}
            </p>
            <p className="mt-2 text-4xl font-bold">{formatPrice(invoice.totalAmount)}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              invoiceStatusStyles[invoice.status],
            )}
          >
            {invoiceStatusLabels[invoice.status]}
          </span>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-white/80">
          <span>Hạn: {formatInvoiceDate(invoice.dueDate)}</span>
          {invoice.paidAt ? (
            <span>Đã TT: {formatInvoiceDate(invoice.paidAt)}</span>
          ) : null}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-sm font-bold uppercase text-slate-400">Chi phí</h2>
        <div className="mt-4 space-y-3">
          <Row label="Tiền thuê" value={amountOrDash(invoice.rentAmount)} />
          <Row label="Tiền điện" value={amountOrDash(invoice.electricityAmount)} />
          <Row label="Tiền nước" value={amountOrDash(invoice.waterAmount)} />
          {(invoice.additionalFees ?? 0) > 0 ? (
            <Row label="Phí khác" value={amountOrDash(invoice.additionalFees)} />
          ) : null}
          <div className="border-t pt-3">
            <Row label="Tổng cộng" value={formatPrice(invoice.totalAmount)} bold />
          </div>
        </div>
      </div>

      {/* Meter Indices */}
      {detail ? (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-bold uppercase text-slate-400">Chỉ số điện nước</h2>
          <div className="mt-4 space-y-3">
            {detail.electricityUsage != null ? (
              <Row label="Điện tiêu thụ" value={`${detail.electricityUsage} kWh`} />
            ) : null}
            {detail.electricityOldIndex != null && detail.electricityNewIndex != null ? (
              <Row
                label="Chỉ số điện"
                value={`${detail.electricityOldIndex} → ${detail.electricityNewIndex}`}
              />
            ) : null}
            {detail.waterUsage != null ? (
              <Row label="Nước tiêu thụ" value={`${detail.waterUsage} m³`} />
            ) : null}
            {detail.waterOldIndex != null && detail.waterNewIndex != null ? (
              <Row
                label="Chỉ số nước"
                value={`${detail.waterOldIndex} → ${detail.waterNewIndex}`}
              />
            ) : null}
          </div>

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => navigate('/cu-dan/chi-so')}
          >
            <BarChart3 className="size-4" />
            Xem lịch sử chỉ số điện nước
          </Button>
        </div>
      ) : null}

      {/* Notes */}
      {invoice.notes ? (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-bold uppercase text-slate-400">Ghi chú</h2>
          <p className="mt-2 text-sm text-slate-600">{invoice.notes}</p>
        </div>
      ) : null}

      {/* Pay hint */}
      {invoice.status === 'SENT' || invoice.status === 'OVERDUE' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            💳 Vui lòng thanh toán trước hạn.
          </p>
          <p className="mt-1 text-sm text-amber-600">
            Liên hệ chủ nhà nếu cần xác nhận đã chuyển khoản.
          </p>
        </div>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={cn(
          'text-sm',
          bold ? 'font-bold text-slate-900' : 'font-semibold text-slate-700',
        )}
      >
        {value}
      </span>
    </div>
  )
}
