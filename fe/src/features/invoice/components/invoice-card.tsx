import { CalendarDays, CheckCircle2, Trash2, Send, XCircle, RotateCcw, Copy, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Invoice } from '../types/invoice.type'
import {
  formatBillingMonth,
  formatInvoiceDate,
  formatPrice,
  getRoomTitleFromInvoice,
  getTenantName,
  invoiceStatusLabels,
  invoiceStatusStyles,
} from '../lib/invoice-display'

type InvoiceCardProps = {
  invoice: Invoice
  mode: 'tenant' | 'landlord'
  isActionPending?: boolean
  onSend?: (invoice: Invoice) => void
  onMarkPaid?: (invoice: Invoice) => void
  onMarkUnpaid?: (invoice: Invoice) => void
  onCancel?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  onClick?: (invoice: Invoice) => void
}

export function InvoiceCard({
  invoice,
  mode,
  isActionPending,
  onSend,
  onMarkPaid,
  onMarkUnpaid,
  onCancel,
  onDelete,
  onClick,
}: InvoiceCardProps) {
  const roomTitle = getRoomTitleFromInvoice(invoice)

  return (
    <article
      className={cn(
        'rounded-xl border border-primary/10 bg-white p-5 shadow-sm transition',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
      onClick={onClick ? () => onClick(invoice) : undefined}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                invoiceStatusStyles[invoice.status],
              )}
            >
              {invoiceStatusLabels[invoice.status]}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {formatBillingMonth(invoice.billingMonth)}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-950">
            {formatPrice(invoice.totalAmount)}
          </h2>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {mode === 'landlord' ? (
              <span>{getTenantName(invoice)}</span>
            ) : null}
            {roomTitle ? <span>{roomTitle}</span> : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              Hạn: {formatInvoiceDate(invoice.dueDate)}
            </span>
            {invoice.paidAt ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                Đã TT: {formatInvoiceDate(invoice.paidAt)}
              </span>
            ) : null}
          </div>

          {/* Quick breakdown */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>Thuê: {formatPrice(invoice.rentAmount)}</span>
            {(invoice.electricityAmount ?? 0) > 0 ? (
              <span>Điện: {formatPrice(invoice.electricityAmount!)}</span>
            ) : null}
            {(invoice.waterAmount ?? 0) > 0 ? (
              <span>Nước: {formatPrice(invoice.waterAmount!)}</span>
            ) : null}
            {(invoice.additionalFees ?? 0) > 0 ? (
              <span>Khác: {formatPrice(invoice.additionalFees!)}</span>
            ) : null}
          </div>

          {invoice.notes ? (
            <p className="mt-2 text-xs italic text-slate-400">
              {invoice.notes}
            </p>
          ) : null}

          {/* Payment note (nội dung chuyển khoản) cho landlord */}
          {mode === 'landlord' && invoice.paymentNote ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <FileText className="size-3 text-slate-400" />
              <span className="font-mono text-slate-500">{invoice.paymentNote}</span>
              <button
                className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(invoice.paymentNote!)
                  toast.success('Đã sao chép nội dung chuyển khoản')
                }}
              >
                <Copy className="size-3" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {mode === 'landlord' ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
            {invoice.status === 'DRAFT' ? (
              <>
                <Button
                  variant="outline"
                  className="h-8 min-w-0 px-3 text-xs"
                  disabled={isActionPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSend?.(invoice)
                  }}
                >
                  <Send className="size-3.5" />
                  Gửi
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 min-w-0 px-3 text-xs text-red-600 hover:text-red-700"
                  disabled={isActionPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(invoice)
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Xóa
                </Button>
              </>
            ) : null}
            {invoice.status === 'SENT' || invoice.status === 'OVERDUE' ? (
              <>
                <Button
                  className="h-8 min-w-0 px-3 text-xs"
                  disabled={isActionPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkPaid?.(invoice)
                  }}
                >
                  <CheckCircle2 className="size-3.5" />
                  Đã thu
                </Button>
                <Button
                  variant="outline"
                  className="h-8 min-w-0 px-3 text-xs text-red-600 hover:text-red-700"
                  disabled={isActionPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCancel?.(invoice)
                  }}
                >
                  <XCircle className="size-3.5" />
                  Hủy
                </Button>
              </>
            ) : null}
            {invoice.status === 'PAID' ? (
              <Button
                variant="outline"
                className="h-8 min-w-0 px-3 text-xs text-amber-600 hover:text-amber-700"
                disabled={isActionPending}
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkUnpaid?.(invoice)
                }}
              >
                <RotateCcw className="size-3.5" />
                Chưa TT
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
