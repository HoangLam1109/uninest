import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Zap,
  Droplets,
  Banknote,
  CircleDollarSign,
  User,
  ReceiptText,
} from 'lucide-react'
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
  if (value === undefined || value === null) return '\u2014'
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-slate-400">Đang tải hóa đơn...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50">
          <ReceiptText className="size-8 text-red-400" />
        </div>
        <p className="text-lg font-semibold text-slate-700">Không tìm thấy hóa đơn</p>
        <Button variant="outline" onClick={() => navigate('/cu-dan/hoa-don')}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const isPaid = invoice.status === 'PAID'
  const hasMeterDetail =
    (detail?.electricityAmount != null || (invoice.electricityAmount ?? 0) > 0) ||
    (detail?.waterAmount != null || (invoice.waterAmount ?? 0) > 0)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate('/cu-dan/hoa-don')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Chi tiết hóa đơn
          </p>
          <h1 className="text-2xl font-black text-slate-900">
            {formatBillingMonth(invoice.billingMonth)}
          </h1>
        </div>
        <span
          className={cn(
            'ml-auto rounded-full px-4 py-1.5 text-xs font-bold tracking-wide',
            invoiceStatusStyles[invoice.status],
          )}
        >
          {invoiceStatusLabels[invoice.status]}
        </span>
      </div>

      {/* Hero Card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-8',
          isPaid
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
            : 'bg-gradient-to-br from-primary to-primary/80',
        )}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <User className="size-4" />
            <span>{getLandlordName(invoice)}</span>
          </div>
          <p className="mt-3 text-5xl font-black tracking-tight">
            {formatPrice(invoice.totalAmount)}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              Hạn: {formatInvoiceDate(invoice.dueDate)}
            </span>
            {invoice.paidAt ? (
              <span className="inline-flex items-center gap-1.5 text-white">
                <CheckCircle2 className="size-4" />
                Đã thanh toán: {formatInvoiceDate(invoice.paidAt)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-white/60">
                <Clock className="size-4" />
                Chưa thanh toán
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Cost Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <CircleDollarSign className="size-5 text-primary" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Chi phí</h2>
          </div>

          <div className="space-y-1">
            <CostRow
              icon={<Home className="size-4" />}
              label="Tiền thuê"
              value={amountOrDash(invoice.rentAmount)}
            />
            <CostRow
              icon={<Zap className="size-4" />}
              label="Tiền điện"
              value={amountOrDash(invoice.electricityAmount)}
            />
            <CostRow
              icon={<Droplets className="size-4" />}
              label="Tiền nước"
              value={amountOrDash(invoice.waterAmount)}
            />
            {(invoice.additionalFees ?? 0) > 0 ? (
              <CostRow
                icon={<Banknote className="size-4" />}
                label="Phí khác"
                value={formatPrice(invoice.additionalFees!)}
              />
            ) : null}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Tổng cộng</span>
              <span className="text-xl font-black text-primary">
                {formatPrice(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Meter Readings */}
        {hasMeterDetail ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50">
                <BarChart3 className="size-5 text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Chỉ số điện nước</h2>
            </div>

            <div className="space-y-4">
              {/* Electricity */}
              {(detail?.electricityAmount != null || (invoice.electricityAmount ?? 0) > 0) ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
                    <Zap className="size-4" /> Điện
                  </p>
                  <div className="space-y-2 text-sm">
                    {detail?.electricityOldIndex != null && detail?.electricityNewIndex != null ? (
                      <>
                        <MeterRow label="Chỉ số cũ" value={detail.electricityOldIndex} unit="kWh" />
                        <MeterRow label="Chỉ số mới" value={detail.electricityNewIndex} unit="kWh" />
                        <div className="flex items-center justify-between rounded-lg bg-amber-100/50 px-3 py-2">
                          <span className="text-amber-700">Tiêu thụ</span>
                          <span className="font-bold text-amber-800">
                            {detail.electricityNewIndex - detail.electricityOldIndex} kWh
                          </span>
                        </div>
                      </>
                    ) : null}
                    {detail?.electricityRate != null && detail?.electricityRate > 0 ? (
                      <MeterRow label="Đơn giá" value={detail.electricityRate} unit="đ/kWh" />
                    ) : null}
                    <div className="flex items-center justify-between border-t border-amber-200 pt-2">
                      <span className="font-semibold text-amber-800">Thành tiền</span>
                      <span className="font-bold text-amber-900">
                        {formatPrice(detail?.electricityAmount ?? invoice.electricityAmount ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Water */}
              {(detail?.waterAmount != null || (invoice.waterAmount ?? 0) > 0) ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
                    <Droplets className="size-4" /> Nước
                  </p>
                  <div className="space-y-2 text-sm">
                    {detail?.waterOldIndex != null && detail?.waterNewIndex != null ? (
                      <>
                        <MeterRow label="Chỉ số cũ" value={detail.waterOldIndex} unit="m³" />
                        <MeterRow label="Chỉ số mới" value={detail.waterNewIndex} unit="m³" />
                        <div className="flex items-center justify-between rounded-lg bg-blue-100/50 px-3 py-2">
                          <span className="text-blue-700">Tiêu thụ</span>
                          <span className="font-bold text-blue-800">
                            {detail.waterNewIndex - detail.waterOldIndex} m³
                          </span>
                        </div>
                      </>
                    ) : null}
                    {detail?.waterRate != null && detail?.waterRate > 0 ? (
                      <MeterRow label="Đơn giá" value={detail.waterRate} unit="đ/m³" />
                    ) : null}
                    <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                      <span className="font-semibold text-blue-800">Thành tiền</span>
                      <span className="font-bold text-blue-900">
                        {formatPrice(detail?.waterAmount ?? invoice.waterAmount ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate('/cu-dan/chi-so')}
            >
              <BarChart3 className="size-4" />
              Xem lịch sử chỉ số
            </Button>
          </div>
        ) : null}
      </div>

      {/* Notes */}
      {invoice.notes ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            Ghi chú từ chủ nhà
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">{invoice.notes}</p>
        </div>
      ) : null}

      {/* Pay hint */}
      {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') ? (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="size-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800">Cần thanh toán</p>
            <p className="mt-1 text-sm text-amber-600">
              Vui lòng thanh toán trước hạn. Liên hệ chủ nhà nếu cần xác nhận đã chuyển khoản.
            </p>
          </div>
        </div>
      ) : null}

      {/* Paid badge */}
      {isPaid ? (
        <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-emerald-800">Đã thanh toán</p>
            <p className="mt-1 text-sm text-emerald-600">
              Hóa đơn này đã được thanh toán vào {formatInvoiceDate(invoice.paidAt!)}.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CostRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50">
      <span className="inline-flex items-center gap-2.5 text-sm text-slate-600">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function MeterRow({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">
        {value.toLocaleString('vi-VN')} {unit}
      </span>
    </div>
  )
}
