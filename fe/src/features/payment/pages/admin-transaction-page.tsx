import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
  AlertTriangle,
  HandCoins,
  Eye,
  Ban,
  Wallet,
} from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { adminTransactionApi, type TransactionLog, type TxCategory, type TxStatus } from '../api/admin-transaction.api'

type TabFilter = 'ALL' | 'PACKAGE_UPGRADE' | 'INVOICE_RENT' | 'INVOICE_DISBURSEMENT' | 'FAILED'

const tabConfig: { key: TabFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'ALL', label: 'Tất cả', icon: <Wallet className="size-4" /> },
  { key: 'PACKAGE_UPGRADE', label: 'Thu gói nâng cấp', icon: <ArrowDownRight className="size-4" /> },
  { key: 'INVOICE_RENT', label: 'Thu tiền thuê', icon: <ArrowDownRight className="size-4" /> },
  { key: 'INVOICE_DISBURSEMENT', label: 'Chi giải ngân', icon: <ArrowUpRight className="size-4" /> },
  { key: 'FAILED', label: 'Thất bại', icon: <AlertTriangle className="size-4" /> },
]

const TX_PER_PAGE = 15

const categoryLabels: Record<TxCategory, string> = {
  PACKAGE_UPGRADE: 'Gói nâng cấp',
  INVOICE_RENT: 'Thu tiền thuê',
  INVOICE_DISBURSEMENT: 'Chi giải ngân',
  DEPOSIT: 'Đặt cọc',
  OTHER: 'Khác',
}

const statusLabels: Record<TxStatus, string> = {
  PENDING: 'Đang xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  MANUAL_RESOLVED: 'Đã chuyển tay',
}
const statusStyles: Record<TxStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  SUCCESS: 'bg-green-500/10 text-green-700',
  FAILED: 'bg-red-500/10 text-red-600',
  MANUAL_RESOLVED: 'bg-purple-500/10 text-purple-700',
}

function fmtCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function fmtDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function getName(value: string | { fullName?: string; email?: string } | undefined): string {
  if (!value) return '-'
  if (typeof value === 'string') return value
  return value.fullName || value.email || '-'
}

export function AdminTransactionPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [detailTx, setDetailTx] = useState<TransactionLog | null>(null)

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: TX_PER_PAGE }
    if (activeTab === 'PACKAGE_UPGRADE') {
      params.category = 'PACKAGE_UPGRADE'
    } else if (activeTab === 'INVOICE_RENT') {
      params.category = 'INVOICE_RENT'
    } else if (activeTab === 'INVOICE_DISBURSEMENT') {
      params.category = 'INVOICE_DISBURSEMENT'
    } else if (activeTab === 'FAILED') {
      params.status = 'FAILED'
    }
    if (searchText.trim()) {
      params.search = searchText.trim()
    }
    return params
  }, [activeTab, searchText, page])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', queryParams],
    queryFn: async () => {
      const { data: res } = await adminTransactionApi.list(queryParams as any)
      return res
    },
    refetchInterval: 30_000,
  })

  const { data: statsData } = useQuery({
    queryKey: ['admin-transaction-stats'],
    queryFn: async () => {
      const { data: res } = await adminTransactionApi.stats()
      return res.data
    },
    refetchInterval: 60_000,
  })

  // Reset page khi đổi filter
  useEffect(() => { setPage(1) }, [activeTab, searchText])

  const transactions = data?.transactions || []
  const pagination = data?.pagination

  const failCount = statsData?.failedSummary?.count || 0
  const failAmount = statsData?.failedSummary?.totalAmount || 0

  // Mutations
  const markPaymentFailed = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => adminTransactionApi.markPaymentFailed(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-transactions'] }); toast.success('Đã đánh dấu thất bại') },
    onError: (e: any) => toast.error('Lỗi', { description: e?.response?.data?.message || e?.message }),
  })

  const markPaymentResolved = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => adminTransactionApi.markPaymentResolved(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-transactions'] }); toast.success('Đã xác nhận chuyển tay') },
    onError: (e: any) => toast.error('Lỗi', { description: e?.response?.data?.message || e?.message }),
  })

  const markDisbursementFailed = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => adminTransactionApi.markDisbursementFailed(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-transactions'] }); toast.success('Đã đánh dấu thất bại') },
    onError: (e: any) => toast.error('Lỗi', { description: e?.response?.data?.message || e?.message }),
  })

  const markDisbursementResolved = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => adminTransactionApi.markDisbursementResolved(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-transactions'] }); toast.success('Đã xác nhận chuyển tay') },
    onError: (e: any) => toast.error('Lỗi', { description: e?.response?.data?.message || e?.message }),
  })

  const handleAction = (tx: TransactionLog, action: 'mark-failed' | 'mark-resolved') => {
    const note = prompt(action === 'mark-failed' ? 'Ghi chú lý do thất bại:' : 'Ghi chú xác nhận chuyển tay:')
    if (note === null) return // cancelled

    if (tx.direction === 'IN') {
      const paymentId = typeof tx.paymentId === 'object' ? tx.paymentId._id : tx.paymentId
      if (!paymentId) { toast.error('Không tìm thấy payment ID'); return }
      if (action === 'mark-failed') {
        markPaymentFailed.mutate({ id: paymentId, note })
      } else {
        markPaymentResolved.mutate({ id: paymentId, note })
      }
    } else {
      const disbursementId = typeof tx.disbursementId === 'object' ? tx.disbursementId._id : tx.disbursementId
      if (!disbursementId) { toast.error('Không tìm thấy disbursement ID'); return }
      if (action === 'mark-failed') {
        markDisbursementFailed.mutate({ id: disbursementId, note })
      } else {
        markDisbursementResolved.mutate({ id: disbursementId, note })
      }
    }
  }

  const openDetail = async (tx: TransactionLog) => {
    try {
      const { data: res } = await adminTransactionApi.detail(tx._id)
      setDetailTx(res.data)
    } catch {
      setDetailTx(tx)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Giao dịch</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi tất cả giao dịch thu/chi qua PayOS</p>
        </div>
        {failCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm">
            <AlertTriangle className="size-4 text-red-600" />
            <span className="font-bold text-red-700">{failCount} giao dịch thất bại</span>
            <span className="text-red-500">({fmtCurrency(failAmount)})</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <ArrowDownRight className="size-4" />
              <span className="font-medium">Thu tiền thuê</span>
            </div>
            <p className="mt-2 text-xl font-black text-green-900">
              {fmtCurrency(statsData.byDirection.find(d => d._id === 'IN')?.totalAmount || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <ArrowUpRight className="size-4" />
              <span className="font-medium">Chi giải ngân</span>
            </div>
            <p className="mt-2 text-xl font-black text-blue-900">
              {fmtCurrency(statsData.byDirection.find(d => d._id === 'OUT')?.totalAmount || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <Wallet className="size-4" />
              <span className="font-medium">Gói nâng cấp</span>
            </div>
            <p className="mt-2 text-xl font-black text-purple-900">
              {statsData.byStatus.find(s => s._id === 'SUCCESS')?.count || 0} giao dịch
            </p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <XCircle className="size-4" />
              <span className="font-medium">Cần xử lý</span>
            </div>
            <p className="mt-2 text-xl font-black text-red-900">
              {failCount + (statsData.byStatus.find(s => s._id === 'PENDING')?.count || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tabConfig.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'FAILED' && failCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{failCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Tìm mã GD, tên người dùng..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
          <Wallet className="size-12" />
          <p className="text-sm font-medium">Không có giao dịch nào</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Mã GD</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Dòng tiền</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Người gửi</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Người nhận</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Số tiền</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thời gian</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Ref ID */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[120px] truncate" title={tx.referenceId}>
                      {tx.referenceId.startsWith('manual_') ? '(Thủ công)' : tx.referenceId.slice(0, 16) + '...'}
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', tx.category === 'INVOICE_RENT' || tx.category === 'PACKAGE_UPGRADE' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700')}>
                        {tx.category === 'INVOICE_RENT' || tx.category === 'PACKAGE_UPGRADE' ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                        {categoryLabels[tx.category] || tx.category}
                      </span>
                    </td>
                    {/* From */}
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[150px] truncate">
                      {tx.fromName || getName(tx.fromUserId) || '-'}
                    </td>
                    {/* To */}
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[150px] truncate">
                      {tx.toName || getName(tx.toUserId) || '-'}
                    </td>
                    {/* Amount */}
                    <td className={cn('px-4 py-3 text-right font-bold tabular-nums', tx.direction === 'IN' ? 'text-green-600' : 'text-blue-600')}>
                      {fmtCurrency(tx.amount)}
                      {tx.fee && tx.fee > 0 && (
                        <div className="text-xs font-normal text-slate-400">Phí: {fmtCurrency(tx.fee)}</div>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', statusStyles[tx.status])}>
                          {tx.status === 'SUCCESS' && <CheckCircle2 className="size-3" />}
                          {tx.status === 'FAILED' && <XCircle className="size-3" />}
                          {tx.status === 'PENDING' && <Clock3 className="size-3" />}
                          {tx.status === 'MANUAL_RESOLVED' && <HandCoins className="size-3" />}
                          {statusLabels[tx.status]}
                        </span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(tx.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openDetail(tx)} title="Xem chi tiết">
                          <Eye className="size-3.5" />
                        </Button>
                        {(tx.status === 'FAILED' || tx.status === 'PENDING') && (
                          <>
                            <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:bg-red-50" onClick={() => handleAction(tx, 'mark-failed')} title="Đánh dấu thất bại">
                              <Ban className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-purple-600 hover:bg-purple-50" onClick={() => handleAction(tx, 'mark-resolved')} title="Xác nhận đã chuyển tay">
                              <HandCoins className="size-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detail Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailTx(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Chi tiết giao dịch</h3>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setDetailTx(null)}>
                <XCircle className="size-4" />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã tham chiếu</span>
                <span className="font-mono text-xs text-slate-700 max-w-[250px] truncate">{detailTx.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dòng tiền</span>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', detailTx.category === 'INVOICE_RENT' || detailTx.category === 'PACKAGE_UPGRADE' ? 'bg-green-500/10 text-green-700' : detailTx.category === 'INVOICE_DISBURSEMENT' ? 'bg-blue-500/10 text-blue-700' : 'bg-slate-500/10 text-slate-700')}>
                  {detailTx.category === 'INVOICE_RENT' || detailTx.category === 'PACKAGE_UPGRADE' ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                  {categoryLabels[detailTx.category] || detailTx.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái</span>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold', statusStyles[detailTx.status])}>{statusLabels[detailTx.status]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền</span>
                <span className="font-bold text-slate-900">{fmtCurrency(detailTx.amount)}</span>
              </div>
              {detailTx.netAmount != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Thực nhận</span>
                  <span className="font-bold text-emerald-600">{fmtCurrency(detailTx.netAmount)}</span>
                </div>
              )}
              {detailTx.fee != null && detailTx.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí</span>
                  <span className="text-slate-600">{fmtCurrency(detailTx.fee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Người gửi</span>
                <span className="text-slate-700">{detailTx.fromName || getName(detailTx.fromUserId) || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận</span>
                <span className="text-slate-700">{detailTx.toName || getName(detailTx.toUserId) || '-'}</span>
              </div>
              {detailTx.toBankInfo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài khoản nhận</span>
                  <span className="text-xs text-slate-700 text-right">
                    {detailTx.toBankInfo.bankName}<br />
                    STK: {detailTx.toBankInfo.accountNumber}<br />
                    {detailTx.toBankInfo.accountHolder}
                  </span>
                </div>
              )}
              {detailTx.resolvedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Admin xử lý</span>
                  <span className="text-slate-700">{getName(detailTx.resolvedBy) || '-'}</span>
                </div>
              )}
              {detailTx.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày xử lý</span>
                  <span className="text-slate-700">{fmtDate(detailTx.resolvedAt)}</span>
                </div>
              )}
              {detailTx.note && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ghi chú</span>
                  <span className="text-slate-700 max-w-[300px] text-right">{detailTx.note}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDetailTx(null)}>Đóng</Button>
              {(detailTx.status === 'FAILED' || detailTx.status === 'PENDING') && (
                <>
                  <Button variant="destructive" size="sm" onClick={() => { handleAction(detailTx, 'mark-failed'); setDetailTx(null) }}>
                    <Ban className="size-3.5" />Đánh dấu thất bại
                  </Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { handleAction(detailTx, 'mark-resolved'); setDetailTx(null) }}>
                    <HandCoins className="size-3.5" />Đã chuyển tay
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
