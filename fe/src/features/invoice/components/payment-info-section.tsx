import { useState, useEffect } from 'react'
import { Building2, Loader2, Save, X, QrCode, CreditCard, User, FileText, AlertCircle, Clock3, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  useGetMyPaymentInfo,
  useUpsertMyPaymentInfo,
} from '@/features/invoice/hooks/use-invoices'
import type { LandlordPaymentInfo, PaymentInfoStatus } from '@/features/invoice/types/landlord-payment-info.type'

const statusLabels: Record<PaymentInfoStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

const statusStyles: Record<PaymentInfoStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
}

const statusIcons: Record<PaymentInfoStatus, React.ReactNode> = {
  PENDING: <Clock3 className="size-4" />,
  APPROVED: <CheckCircle2 className="size-4" />,
  REJECTED: <XCircle className="size-4" />,
}

export function PaymentInfoSection() {
  const { data: paymentInfo, isLoading } = useGetMyPaymentInfo()
  const upsertMutation = useUpsertMyPaymentInfo()

  const [editing, setEditing] = useState(false)
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountHolder, setBankAccountHolder] = useState('')
  const [paymentQrUrl, setPaymentQrUrl] = useState('')
  const [paymentNoteTemplate, setPaymentNoteTemplate] = useState('THANHTOAN {invoiceCode}')

  useEffect(() => {
    if (paymentInfo) {
      setBankName(paymentInfo.bankName || '')
      setBankAccountNumber(paymentInfo.bankAccountNumber || '')
      setBankAccountHolder(paymentInfo.bankAccountHolder || '')
      setPaymentQrUrl(paymentInfo.paymentQrUrl || '')
      setPaymentNoteTemplate(paymentInfo.paymentNoteTemplate || 'THANHTOAN {invoiceCode}')
    }
  }, [paymentInfo])

  const hasPaymentInfo = paymentInfo && paymentInfo.bankName && paymentInfo.bankAccountNumber && paymentInfo.bankAccountHolder

  const handleSave = async () => {
    if (!bankName || !bankAccountNumber || !bankAccountHolder) return
    await upsertMutation.mutateAsync({
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      paymentQrUrl: paymentQrUrl || undefined,
      paymentNoteTemplate: paymentNoteTemplate || undefined,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    if (paymentInfo) {
      setBankName(paymentInfo.bankName || '')
      setBankAccountNumber(paymentInfo.bankAccountNumber || '')
      setBankAccountHolder(paymentInfo.bankAccountHolder || '')
      setPaymentQrUrl(paymentInfo.paymentQrUrl || '')
      setPaymentNoteTemplate(paymentInfo.paymentNoteTemplate || 'THANHTOAN {invoiceCode}')
    }
    setEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Thông tin thanh toán</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Thông tin này sẽ hiển thị trên hóa đơn để người thuê chuyển khoản
          </p>
        </div>
        {!editing && (
          <Button
            size="sm"
            variant={hasPaymentInfo ? 'outline' : 'default'}
            onClick={() => setEditing(true)}
          >
            {hasPaymentInfo ? 'Cập nhật' : 'Thêm'}
          </Button>
        )}
      </div>

      {/* Alert khi chưa có thông tin */}
      {!hasPaymentInfo && !editing && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Bạn cần cập nhật thông tin thanh toán trước khi tạo hóa đơn
            </p>
            <p className="mt-1 text-xs text-amber-600">
              Vui lòng nhập tối thiểu: tên ngân hàng, số tài khoản và tên chủ tài khoản.
            </p>
          </div>
        </div>
      )}

      {/* Display Mode */}
      {!editing && hasPaymentInfo && (
        <div className={cn('rounded-xl border p-4 space-y-2', statusStyles[paymentInfo.status])}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold">
              {statusIcons[paymentInfo.status]}
              {statusLabels[paymentInfo.status]}
            </span>
            {paymentInfo.status === 'REJECTED' && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Cập nhật lại
              </Button>
            )}
          </div>
          {paymentInfo.status === 'PENDING' && (
            <p className="text-xs text-amber-600">
              Đang chờ admin duyệt. Bạn chỉ có thể tạo hóa đơn sau khi được duyệt.
            </p>
          )}
          {paymentInfo.status === 'REJECTED' && paymentInfo.rejectionReason && (
            <p className="text-xs text-red-600">Lý do: {paymentInfo.rejectionReason}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="size-4 shrink-0" />
            <span className="opacity-70">Ngân hàng:</span>
            <span className="font-semibold">{paymentInfo.bankName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="size-4 shrink-0" />
            <span className="opacity-70">Số tài khoản:</span>
            <span className="font-semibold">{paymentInfo.bankAccountNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 shrink-0" />
            <span className="opacity-70">Chủ tài khoản:</span>
            <span className="font-semibold">{paymentInfo.bankAccountHolder}</span>
          </div>
          {paymentInfo.paymentQrUrl && (
            <div className="flex items-center gap-2 text-sm">
              <QrCode className="size-4 shrink-0" />
              <span className="opacity-70">QR:</span>
              <img src={paymentInfo.paymentQrUrl} alt="QR" className="h-16 w-16 rounded-lg border object-contain" />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 shrink-0" />
            <span className="opacity-70">Nội dung CK:</span>
            <span className="font-semibold">{paymentInfo.paymentNoteTemplate || 'THANHTOAN {invoiceCode}'}</span>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {editing && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleSave() }}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-700">
              {hasPaymentInfo ? 'Cập nhật thông tin thanh toán' : 'Thêm thông tin thanh toán'}
            </h4>
            <button
              type="button"
              onClick={handleCancel}
              className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200"
            >
              <X className="size-4" />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Tên ngân hàng <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="VD: Vietcombank, BIDV, Techcombank..."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập số tài khoản ngân hàng"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="VD: NGUYEN VAN A"
              value={bankAccountHolder}
              onChange={(e) => setBankAccountHolder(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              URL ảnh QR chuyển khoản <span className="text-slate-400">(tùy chọn)</span>
            </label>
            <Input
              placeholder="https://... (URL ảnh QR code)"
              value={paymentQrUrl}
              onChange={(e) => setPaymentQrUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              Dán link ảnh QR từ dịch vụ lưu trữ ảnh (Cloudinary, Imgur...)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Nội dung chuyển khoản gợi ý
            </label>
            <Input
              placeholder="THANHTOAN {invoiceCode}"
              value={paymentNoteTemplate}
              onChange={(e) => setPaymentNoteTemplate(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              {'{invoiceCode}'} sẽ được thay bằng mã hóa đơn thực tế
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={upsertMutation.isPending || !bankName || !bankAccountNumber || !bankAccountHolder}
            >
              {upsertMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {hasPaymentInfo ? 'Cập nhật' : 'Lưu'}
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Sau khi lưu, thông tin sẽ được gửi cho admin duyệt.
            Bạn chỉ có thể tạo hóa đơn sau khi được duyệt.
          </p>
        </form>
      )}

      {/* Empty state */}
      {!hasPaymentInfo && !editing && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Building2 className="mx-auto size-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-500">
            Chưa có thông tin thanh toán
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Cần cập nhật để có thể tạo hóa đơn cho người thuê
          </p>
        </div>
      )}
    </div>
  )
}
