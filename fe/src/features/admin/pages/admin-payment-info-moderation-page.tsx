import { useState } from 'react'
import { CheckCircle2, Eye, Loader2, Search, XCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoiceApi } from '@/features/invoice/api/invoice.api'
import type { LandlordPaymentInfo, PaymentInfoStatus } from '@/features/invoice/types/landlord-payment-info.type'

type Filter = 'all' | PaymentInfoStatus
const opts: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]
const lbs: Record<PaymentInfoStatus, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Đã từ chối' }
const sts: Record<PaymentInfoStatus, string> = { PENDING: 'bg-amber-50 text-amber-700 border-amber-200', APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200', REJECTED: 'bg-red-50 text-red-600 border-red-200' }
const nrm = (v: string) => v.trim().toLowerCase()

function getUser(info: LandlordPaymentInfo): { fullName?: string; email?: string; phone?: string } | null {
  const u = info.userId
  return typeof u === 'object' && u && 'fullName' in u ? u as any : null
}

export function AdminPaymentInfoModerationPage() {
  const [s, setS] = useState('')
  const [st, setSt] = useState<Filter>('all')
  const [sel, setSel] = useState<LandlordPaymentInfo | null>(null)
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-payment-infos', st],
    queryFn: async () => {
      const { data } = await invoiceApi.adminGetPaymentInfos(
        st === 'all' ? undefined : { status: st }
      )
      return data.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.adminApprovePaymentInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-infos'] })
      toast.success('Đã duyệt thông tin thanh toán')
    },
    onError: () => toast.error('Không thể duyệt'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      invoiceApi.adminRejectPaymentInfo(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-infos'] })
      toast.success('Đã từ chối thông tin thanh toán')
    },
    onError: () => toast.error('Không thể từ chối'),
  })

  const f = list.filter((i) => {
    if (!s.trim()) return true
    const q = nrm(s)
    const u = getUser(i)
    return (
      (u?.fullName && nrm(u.fullName).includes(q)) ||
      (u?.email && nrm(u.email).includes(q)) ||
      nrm(i.bankName).includes(q) ||
      i.bankAccountNumber.includes(s)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Duyệt thông tin thanh toán</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kiểm duyệt thông tin ngân hàng hiển thị trên hóa đơn cho người thuê
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, STK, ngân hàng..."
            value={s}
            onChange={(e) => setS(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
          {opts.map((o) => (
            <button
              key={o.value}
              onClick={() => setSt(o.value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                st === o.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : f.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
          <CreditCard className="size-10" />
          <p className="text-sm font-medium">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {f.map((i) => {
            const u = getUser(i)
            return (
              <div
                key={i._id}
                className={cn(
                  'rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md',
                  sts[i.status]
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4" />
                      <span className="font-bold text-slate-900">
                        {u?.fullName ?? 'Chủ trọ'}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold',
                          i.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : i.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        )}
                      >
                        {lbs[i.status]}
                      </span>
                    </div>
                    {u && (
                      <div className="text-sm text-slate-500">
                        {u.email}
                        {u.phone ? ` • ${u.phone}` : ''}
                      </div>
                    )}
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{i.bankName}</span> — STK:{' '}
                      {i.bankAccountNumber} — Chủ TK: {i.bankAccountHolder}
                    </div>
                    {i.paymentNoteTemplate && (
                      <div className="text-xs text-slate-400">
                        Nội dung CK: {i.paymentNoteTemplate}
                      </div>
                    )}
                    {i.status === 'REJECTED' && i.rejectionReason && (
                      <div className="text-xs text-red-600">
                        Lý do từ chối: {i.rejectionReason}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSel(i)}>
                      <Eye className="size-4" />
                    </Button>
                    {i.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => approveMutation.mutate(i._id!)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle2 className="size-4" />
                          Duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            const reason = prompt('Lý do từ chối (tùy chọn):')
                            rejectMutation.mutate({ id: i._id!, reason: reason || undefined })
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="size-4" />
                          Từ chối
                        </Button>
                      </>
                    ) : i.status === 'REJECTED' ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => approveMutation.mutate(i._id!)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="size-4" />
                        Duyệt lại
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const reason = prompt('Lý do từ chối (tùy chọn):')
                          rejectMutation.mutate({ id: i._id!, reason: reason || undefined })
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="size-4" />
                        Từ chối
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!sel} onClose={() => setSel(null)} title="Chi tiết thông tin thanh toán">
        {sel &&
          (() => {
            const u = getUser(sel)
            return (
              <div className="space-y-4">
                <Row l="Chủ trọ" v={u?.fullName ?? '\u2014'} />
                <Row l="Email" v={u?.email ?? '\u2014'} />
                <Row l="SĐT" v={u?.phone ?? '\u2014'} />
                <Row l="Ngân hàng" v={sel.bankName} />
                <Row l="Số TK" v={sel.bankAccountNumber} />
                <Row l="Chủ TK" v={sel.bankAccountHolder} />
                {sel.paymentQrUrl && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-2 text-sm text-slate-500">QR Code</p>
                    <img src={sel.paymentQrUrl} alt="QR" className="h-40 w-40 rounded-lg border object-contain" />
                  </div>
                )}
                <Row l="Nội dung CK" v={sel.paymentNoteTemplate || 'THANHTOAN {invoiceCode}'} />
                <Row l="Trạng thái" v={lbs[sel.status]} />
                {sel.status === 'REJECTED' && sel.rejectionReason && (
                  <Row l="Lý do từ chối" v={sel.rejectionReason} />
                )}
                {sel.status === 'PENDING' && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => approveMutation.mutate(sel._id!)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        const reason = prompt('Lý do từ chối (tùy chọn):')
                        rejectMutation.mutate({ id: sel._id!, reason: reason || undefined })
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="size-4" />
                      Từ chối
                    </Button>
                  </div>
                )}
                {sel.status === 'REJECTED' && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => approveMutation.mutate(sel._id!)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Duyệt lại
                    </Button>
                  </div>
                )}
              </div>
            )
          })()}
      </Modal>
    </div>
  )
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{l}</span>
      <span className="text-sm font-semibold text-slate-800">{v}</span>
    </div>
  )
}
