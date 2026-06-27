import { useState } from 'react'
import { Building2, CheckCircle2, Eye, Loader2, Search, XCircle, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { useGetAdminBankInfos, useVerifyBankInfo, useRejectBankInfo } from '../hooks/use-bank-accounts'
import type { LandlordBankInfo, BankInfoStatus, BankAccountUser } from '../types/bank-account.type'

type Filter = 'all' | BankInfoStatus
const opts: Array<{ value: Filter; label: string }> = [{ value: 'all', label: 'Tất cả' }, { value: 'PENDING_VERIFICATION', label: 'Chờ duyệt' }, { value: 'VERIFIED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Đã từ chối' }]
const lbs: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'Chờ duyệt', VERIFIED: 'Đã duyệt', REJECTED: 'Đã từ chối' }
const sts: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200', VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200', REJECTED: 'bg-red-50 text-red-600 border-red-200' }
const nrm = (v: string) => v.trim().toLowerCase()
const owner = (i: LandlordBankInfo): BankAccountUser | null => { const o = i.userId; return typeof o === 'object' && o && '_id' in o ? o as BankAccountUser : null }

export function AdminBankAccountModerationPage() {
  const [s, setS] = useState(''); const [st, setSt] = useState<Filter>('all'); const [sel, setSel] = useState<LandlordBankInfo | null>(null)
  const { data: list = [], isLoading } = useGetAdminBankInfos(st === 'all' ? undefined : st)
  const vm = useVerifyBankInfo(); const rm = useRejectBankInfo()

  const f = list.filter((i) => { if (!s.trim()) return true; const q = nrm(s); const o = owner(i); return (o?.fullName && nrm(o.fullName).includes(q)) || (o?.email && nrm(o.email).includes(q)) || (i.bankName && nrm(i.bankName).includes(q)) || (i.accountNumber && i.accountNumber.includes(s)) })

  return <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <div><h1 className="text-2xl font-black text-slate-900">Duyệt tài khoản ngân hàng</h1><p className="mt-1 text-sm text-slate-500">Kiểm duyệt thông tin tài khoản ngân hàng của chủ trọ</p></div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input placeholder="Tìm theo tên, STK, ngân hàng..." value={s} onChange={(e) => setS(e.target.value)} className="pl-9" /></div>
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">{opts.map((o) => <button key={o.value} onClick={() => setSt(o.value)} className={cn('rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors', st === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{o.label}</button>)}</div>
    </div>
    {isLoading ? <div className="flex min-h-[30vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div> : f.length === 0 ? <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400"><Building2 className="size-10" /><p className="text-sm font-medium">Không có tài khoản nào</p></div> : <div className="grid gap-4">{f.map((i) => { const o = owner(i); return <div key={i._id} className={cn('rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md', sts[i.status])}>
      <div className="flex items-start justify-between"><div className="space-y-1.5"><div className="flex items-center gap-2"><Building2 className="size-4" /><span className="font-bold text-slate-900">{o?.fullName ?? 'Chủ trọ'}</span><span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', i.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' : i.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>{lbs[i.status]}</span></div>{o && <div className="text-sm text-slate-500">{o.email}{o.phone ? ` • ${o.phone}` : ''}</div>}<div className="text-sm text-slate-600"><span className="font-medium">{i.bankName}</span> — STK: {i.accountNumber} — Chủ TK: {i.accountHolder}</div>{i.branch && <div className="text-xs text-slate-400">CN: {i.branch}</div>}</div>
      <div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={() => setSel(i)}><Eye className="size-4" /></Button>{i.status === 'PENDING_VERIFICATION' ? <><Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => vm.mutateAsync(i._id)} disabled={vm.isPending}><CheckCircle2 className="size-4" />Duyệt</Button><Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => rm.mutateAsync(i._id)} disabled={rm.isPending}><XCircle className="size-4" />Từ chối</Button></> : i.status === 'REJECTED' ? <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => vm.mutateAsync(i._id)} disabled={vm.isPending}><CheckCircle2 className="size-4" />Duyệt lại</Button> : <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => rm.mutateAsync(i._id)} disabled={rm.isPending}><XCircle className="size-4" />Từ chối</Button>}</div>
    </div></div> })}</div>}

    <Modal open={!!sel} onClose={() => setSel(null)} title="Chi tiết tài khoản ngân hàng">{sel && (() => { const o = owner(sel); return <div className="space-y-4">
      <Row l="Chủ sở hữu" v={o?.fullName ?? '\u2014'} /><Row l="Email" v={o?.email ?? '\u2014'} /><Row l="SĐT" v={o?.phone ?? '\u2014'} /><Row l="Ngân hàng" v={sel.bankName} /><Row l="Số TK" v={sel.accountNumber} /><Row l="Chủ TK" v={sel.accountHolder} /><Row l="Chi nhánh" v={sel.branch || '\u2014'} /><Row l="Trạng thái" v={lbs[sel.status]} />
      {sel.status === 'PENDING_VERIFICATION' && <div className="flex gap-3 pt-2"><Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => vm.mutateAsync(sel._id)} disabled={vm.isPending}>{vm.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Duyệt</Button><Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => rm.mutateAsync(sel._id)} disabled={rm.isPending}><XCircle className="size-4" />Từ chối</Button></div>}
      {sel.status === 'REJECTED' && <div className="flex gap-3 pt-2"><Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => vm.mutateAsync(sel._id)} disabled={vm.isPending}>{vm.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Duyệt lại</Button></div>}
    </div> })()}</Modal>
  </div>
}
function Row({ l, v }: { l: string; v: string }) { return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-sm text-slate-500">{l}</span><span className="text-sm font-semibold text-slate-800">{v}</span></div> }

