import { useState } from 'react'
import { Building2, CheckCircle2, Loader2, Save, X, XCircle, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useGetBankList, useGetMyBankInfos, useCreateBankInfo, useUpdateBankInfo } from '../hooks/use-bank-accounts'
import type { BankInfoStatus, BankOption } from '../types/bank-account.type'

const labels: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'Chờ duyệt', VERIFIED: 'Đã xác nhận', REJECTED: 'Đã từ chối' }
const styles: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200', VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200', REJECTED: 'bg-red-50 text-red-600 border-red-200' }
const icons: Record<BankInfoStatus, typeof CheckCircle2> = { PENDING_VERIFICATION: Clock3, VERIFIED: CheckCircle2, REJECTED: XCircle }

export function LandlordBankAccountPage() {
  const { data: infos, isLoading } = useGetMyBankInfos()
  const { data: banks } = useGetBankList()
  const createM = useCreateBankInfo(); const updateM = useUpdateBankInfo()
  const [show, setShow] = useState(false); const [editId, setEditId] = useState<string | null>(null)
  const [bin, setBin] = useState(''); const [bName, setBName] = useState('')
  const [accNum, setAccNum] = useState(''); const [accHolder, setAccHolder] = useState(''); const [br, setBr] = useState('')
  const hasV = infos?.some((a) => a.status === 'VERIFIED')
  const reset = () => { setBin(''); setBName(''); setAccNum(''); setAccHolder(''); setBr(''); setEditId(null) }
  const sel = (b: string) => { setBin(b); const bk = banks?.find((x: BankOption) => x.bin === b); if (bk) setBName(bk.shortName) }

  if (isLoading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>

  return <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
    <div><h1 className="text-2xl font-black text-slate-900">Tài khoản ngân hàng</h1><p className="mt-1 text-sm text-slate-500">Cung cấp thông tin để nhận tiền tự động sau khi người thuê thanh toán</p></div>
    {infos?.map((info) => { const Icon = icons[info.status]; return <div key={info._id} className={cn('rounded-2xl border p-6', styles[info.status])}>
      <div className="flex items-start justify-between"><div className="flex items-center gap-2"><Icon className="size-5" /><span className="font-bold">{labels[info.status]}</span></div>{info.status === 'REJECTED' && <Button variant="outline" size="sm" onClick={() => { setBin(info.bankBin); setBName(info.bankName); setAccNum(info.accountNumber); setAccHolder(info.accountHolder); setBr(info.branch ?? ''); setEditId(info._id); setShow(true) }}>Cập nhật lại</Button>}</div>
      <div className="mt-4 space-y-2"><p className="text-sm"><span className="font-medium">Ngân hàng:</span> {info.bankName}</p><p className="text-sm"><span className="font-medium">Số TK:</span> {info.accountNumber}</p><p className="text-sm"><span className="font-medium">Chủ TK:</span> {info.accountHolder}</p>{info.branch && <p className="text-sm"><span className="font-medium">CN:</span> {info.branch}</p>}</div>
    </div> })}

    {show && <form onSubmit={async (e) => { e.preventDefault(); if (!bin || !accNum || !accHolder) return; editId ? await updateM.mutateAsync({ id: editId, payload: { bankBin: bin, bankName: bName, accountNumber: accNum, accountHolder: accHolder, branch: br } }) : await createM.mutateAsync({ bankBin: bin, bankName: bName, accountNumber: accNum, accountHolder: accHolder, branch: br }); reset(); setShow(false) }} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">{editId ? 'Cập nhật' : 'Thêm tài khoản ngân hàng'}</h3><button type="button" onClick={() => { reset(); setShow(false) }} className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200"><X className="size-4" /></button></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-600">Ngân hàng</label><select value={bin} onChange={(e) => sel(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" required><option value="">-- Chọn --</option>{banks?.map((b: BankOption) => <option key={b.bin} value={b.bin}>{b.shortName} ({b.bin})</option>)}</select></div>
      <Input placeholder="Số tài khoản" value={accNum} onChange={(e) => setAccNum(e.target.value)} required />
      <Input placeholder="Tên chủ tài khoản" value={accHolder} onChange={(e) => setAccHolder(e.target.value)} required />
      <Input placeholder="Chi nhánh (không bắt buộc)" value={br} onChange={(e) => setBr(e.target.value)} />
      <Button type="submit" className="w-full" disabled={createM.isPending || updateM.isPending}>{(createM.isPending || updateM.isPending) ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{editId ? 'Cập nhật' : 'Lưu'}</Button>
      <p className="text-center text-xs text-slate-400">Hệ thống sẽ tự động chuyển tiền về tài khoản này sau khi người thuê thanh toán.</p>
    </form>}

    {!hasV && !show && <Button onClick={() => { reset(); setShow(true) }} className="w-full" variant="outline"><Building2 className="size-4" />Thêm tài khoản ngân hàng</Button>}
  </div>
}
