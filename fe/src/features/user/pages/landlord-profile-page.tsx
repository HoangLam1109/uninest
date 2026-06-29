import { useState } from 'react'
import { Building2, Camera, Loader2, Mail, Phone, Save, User, X, CheckCircle2, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '@/features/user/hooks/use-users'
import { useGetBankList, useGetMyBankInfos, useCreateBankInfo, useUpdateBankInfo } from '@/features/bank-account/hooks/use-bank-accounts'
import type { BankInfoStatus, BankOption } from '@/features/bank-account/types/bank-account.type'

const bankInfoLabels: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'Chờ duyệt', VERIFIED: 'Đã xác nhận', REJECTED: 'Đã từ chối' }
const bankInfoStyles: Record<BankInfoStatus, string> = { PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200', VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200', REJECTED: 'bg-red-50 text-red-600 border-red-200' }

function BankInfoSection() {
  const { data: bankInfos, isLoading } = useGetMyBankInfos()
  const { data: bankList } = useGetBankList()
  const createM = useCreateBankInfo()
  const updateM = useUpdateBankInfo()
  const [show, setShow] = useState(false); const [editId, setEditId] = useState<string | null>(null)
  const [bin, setBin] = useState(''); const [bName, setBName] = useState(''); const [accNum, setAccNum] = useState('')
  const [accHolder, setAccHolder] = useState(''); const [br, setBr] = useState('')
  const hasV = bankInfos?.some((a) => a.status === 'VERIFIED')
  const reset = () => { setBin(''); setBName(''); setAccNum(''); setAccHolder(''); setBr(''); setEditId(null) }
  const handleSelect = (b: string) => { setBin(b); const bk = bankList?.find((x: BankOption) => x.bin === b); if (bk) setBName(bk.shortName) }

  if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="size-6 animate-spin text-primary" /></div>

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">Tài khoản ngân hàng</h3>{hasV || show ? null : <Button size="sm" onClick={() => { reset(); setShow(true) }}><Building2 className="size-4" />Thêm</Button>}</div>
    {bankInfos?.map((info) => (
      <div key={info._id} className={cn('rounded-xl border p-4', bankInfoStyles[info.status])}>
        <div className="flex items-start justify-between">
          <div><p className="font-bold">{info.bankName}</p><p className="mt-0.5 text-sm">STK: {info.accountNumber}</p><p className="text-sm opacity-70">Chủ TK: {info.accountHolder}</p>{info.branch && <p className="text-sm opacity-70">CN: {info.branch}</p>}</div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', info.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' : info.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>{info.status === 'PENDING_VERIFICATION' ? <Clock3 className="mr-1 inline size-3" /> : info.status === 'VERIFIED' ? <CheckCircle2 className="mr-1 inline size-3" /> : null}{bankInfoLabels[info.status]}</span>
        </div>
        {info.status === 'REJECTED' && !show && <Button variant="outline" size="sm" className="mt-3" onClick={() => { setBin(info.bankBin); setBName(info.bankName); setAccNum(info.accountNumber); setAccHolder(info.accountHolder); setBr(info.branch ?? ''); setEditId(info._id); setShow(true) }}>Cập nhật lại</Button>}
      </div>
    ))}
    {show && <form onSubmit={async (e) => { e.preventDefault(); if (!bin || !accNum || !accHolder) return; editId ? await updateM.mutateAsync({ id: editId, payload: { bankBin: bin, bankName: bName, accountNumber: accNum, accountHolder: accHolder, branch: br } }) : await createM.mutateAsync({ bankBin: bin, bankName: bName, accountNumber: accNum, accountHolder: accHolder, branch: br }); reset(); setShow(false) }} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between"><h4 className="font-bold text-slate-700">{editId ? 'Cập nhật' : 'Thêm tài khoản ngân hàng'}</h4><button type="button" onClick={() => { reset(); setShow(false) }} className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200"><X className="size-4" /></button></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-600">Ngân hàng</label><select value={bin} onChange={(e) => handleSelect(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" required><option value="">-- Chọn ngân hàng --</option>{bankList?.map((b: BankOption) => <option key={b.bin} value={b.bin}>{b.shortName} ({b.bin})</option>)}</select></div>
      <Input placeholder="Số tài khoản" value={accNum} onChange={(e) => setAccNum(e.target.value)} required />
      <Input placeholder="Tên chủ tài khoản" value={accHolder} onChange={(e) => setAccHolder(e.target.value)} required />
      <Input placeholder="Chi nhánh (không bắt buộc)" value={br} onChange={(e) => setBr(e.target.value)} />
      <Button type="submit" className="w-full" disabled={createM.isPending || updateM.isPending}>{(createM.isPending || updateM.isPending) ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{editId ? 'Cập nhật' : 'Lưu'}</Button>
      <p className="text-xs text-slate-400">Hệ thống sẽ tự động chuyển tiền về tài khoản này sau khi tenant thanh toán.</p>
    </form>}
    {!bankInfos?.length && !show && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><Building2 className="mx-auto size-8 text-slate-300" /><p className="mt-2 text-sm font-medium text-slate-500">Chưa có tài khoản ngân hàng</p><p className="mt-1 text-xs text-slate-400">Thêm tài khoản để nhận tiền tự động</p></div>}
  </div>
}

// ─── Main Page ────────────────────────────────────────────────────────────
export function LandlordProfilePage() {
  const authUser = useAuthStore((s) => s.user)
  const { data: profile, isLoading: profileLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const displayUser = profile || authUser

  const handleStartEdit = () => {
    setFullName(displayUser?.fullName ?? '')
    setPhone(displayUser?.phone ?? '')
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
  }

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({ fullName, phone })
    setEditing(false)
  }

  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar.mutateAsync(file)
    return { avatarUrl: result.avatarUrl }
  }

  if (profileLoading && !authUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin cá nhân và tài khoản ngân hàng của bạn
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar
            name={displayUser?.fullName ?? '?'}
            src={displayUser?.avatarUrl}
            className="size-28 text-3xl"
          />
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                await handleAvatarUpload(file)
              }}
            />
          </label>
        </div>
        <p className="text-xs text-slate-400">Nhấn vào ảnh để thay đổi</p>
      </div>

      {/* Profile Info Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Lưu
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Họ và tên
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Số điện thoại
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ProfileRow
              icon={<User className="size-4" />}
              label="Họ và tên"
              value={displayUser?.fullName ?? '\u2014'}
            />
            <ProfileRow
              icon={<Mail className="size-4" />}
              label="Email"
              value={displayUser?.email ?? '\u2014'}
            />
            <ProfileRow
              icon={<Phone className="size-4" />}
              label="Số điện thoại"
              value={displayUser?.phone ?? '\u2014'}
            />
          </div>
        )}
      </div>

      {/* Bank Account Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <BankInfoSection />
      </div>
    </div>
  )
}

function ProfileRow({
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
      <span className="inline-flex items-center gap-2.5 text-sm text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}
