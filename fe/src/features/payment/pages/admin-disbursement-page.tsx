import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, CheckCircle2, Loader2, RefreshCw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { disbursementApi, type Disbursement } from '../api/disbursement.api'

const stateLabels: Record<string, string> = { PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', SUCCEEDED: 'Đã chuyển', FAILED: 'Thất bại' }
const stateStyles: Record<string, string> = { PENDING: 'bg-amber-50 border-amber-200', PROCESSING: 'bg-blue-50 border-blue-200', SUCCEEDED: 'bg-emerald-50 border-emerald-200', FAILED: 'bg-red-50 border-red-200' }
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'
const getName = (d: Disbursement) => { const ll = d.landlordId; return typeof ll === 'object' && ll ? (ll.fullName ?? ll.email ?? 'Chủ trọ') : 'Chủ trọ' }

export function AdminDisbursementPage() {
  const qc = useQueryClient()
  const { data: list = [], isLoading } = useQuery({ queryKey: ['disbursements', 'pending'], queryFn: async () => { const { data } = await disbursementApi.getPending(); return data.data }, refetchInterval: 30_000 })
  const complete = useMutation({ mutationFn: (id: string) => disbursementApi.manualComplete(id, 'Admin chuyển khoản thủ công'), onSuccess: () => { qc.invalidateQueries({ queryKey: ['disbursements'] }); toast.success('Đã xác nhận') }, onError: (e: any) => toast.error('Lỗi', { description: e?.message }) })

  if (isLoading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <div><h1 className="text-2xl font-black text-slate-900">Giải ngân</h1><p className="mt-1 text-sm text-slate-500">{list.length === 0 ? 'Không có khoản nào đang chờ' : `${list.length} khoản đang chờ giải ngân`}</p></div>
      {list.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400"><CheckCircle2 className="size-10" /><p className="text-sm font-medium">Tất cả đã được giải ngân</p></div>
      ) : (
        <div className="grid gap-4">
          {list.map((d) => (
            <div key={d._id} className={cn('rounded-2xl border bg-white p-5', stateStyles[d.state])}>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" /><span className="font-bold text-slate-900">{getName(d)}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', d.state === 'PENDING' && 'bg-amber-100 text-amber-700', d.state === 'PROCESSING' && 'bg-blue-100 text-blue-700', d.state === 'SUCCEEDED' && 'bg-emerald-100 text-emerald-700', d.state === 'FAILED' && 'bg-red-100 text-red-600')}>{stateLabels[d.state]}</span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Tổng:</span> {fmt(d.amount)} → <span className="font-medium">Nhận:</span> {fmt(d.netAmount)} <span className="text-xs text-slate-400">(phí {fmt(d.payoutFee)})</span></p>
                    <p className="text-xs">{d.bankSnapshot.bankName} — STK: {d.bankSnapshot.accountNumber} — {d.bankSnapshot.accountHolder}</p>
                    {d.note && <p className="text-xs text-slate-400 italic">{d.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(d.state === 'PENDING' || d.state === 'FAILED') && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => complete.mutate(d._id)} disabled={complete.isPending}><Send className="size-4" />Đã chuyển</Button>
                  )}
                  {d.state === 'FAILED' && (
                    <Button variant="outline" size="sm" onClick={() => disbursementApi.retry(d._id).then(() => { toast.success('Đang retry...'); qc.invalidateQueries({ queryKey: ['disbursements'] }) }).catch((e: any) => toast.error('Retry thất bại', { description: e?.message }))}><RefreshCw className="size-4" />Retry</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
