import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  WalletCards,
} from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { paymentApi } from '../api/payment.api'
import type {
  AdminPayment,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PaymentUser,
} from '../types/payment.type'

type StatusFilter = 'ALL' | PaymentStatus
type TypeFilter = 'ALL' | PaymentType
type MethodFilter = 'ALL' | PaymentMethod
const PAYMENTS_PER_PAGE = 10

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  COMPLETED: 'Đã thanh toán',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
}

const statusStyles: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  COMPLETED: 'bg-green-500/10 text-green-700',
  FAILED: 'bg-red-500/10 text-red-600',
  CANCELLED: 'bg-slate-500/10 text-slate-600',
  REFUNDED: 'bg-blue-500/10 text-blue-700',
}

const typeLabels: Record<PaymentType, string> = {
  RENT: 'Tiền thuê',
  DEPOSIT: 'Đặt cọc',
  UTILITY: 'Tiện ích',
  SERVICE_FEE: 'Thanh toán gói',
  TENANT_PACKAGE: 'Thanh toán gói tenant',
  LANDLORD_PACKAGE: 'Thanh toán gói landlord',
  REFUND: 'Hoàn tiền',
}

const methodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  CASH: 'Tiền mặt',
  PAYOS: 'PayOS',
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getUser(value: string | PaymentUser) {
  return typeof value === 'object' && value !== null ? value : null
}

function formatCurrency(value: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPaymentSearchFields(payment: AdminPayment) {
  const payer = getUser(payment.payerId)
  const receiver = getUser(payment.receiverId)

  return [
    payment._id,
    payment.transactionRef ?? '',
    payment.note ?? '',
    payment.type,
    payment.method ?? '',
    payment.status,
    payer?.fullName ?? '',
    payer?.email ?? '',
    payer?.phone ?? '',
    receiver?.fullName ?? '',
    receiver?.email ?? '',
    receiver?.phone ?? '',
  ]
}

export function AdminPaymentManagementPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [type, setType] = useState<TypeFilter>('ALL')
  const [method, setMethod] = useState<MethodFilter>('ALL')

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data } = await paymentApi.adminListPayments({ limit: 500 })
      return data
    },
  })

  const statsQuery = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      const { data } = await paymentApi.adminGetPaymentStats()
      return data.data
    },
  })

  const payments = paymentsQuery.data?.data ?? []
  const stats = statsQuery.data

  const visiblePayments = useMemo(() => {
    const keyword = normalize(search)

    return payments.filter((payment) => {
      const matchesSearch =
        !keyword ||
        getPaymentSearchFields(payment).some((value) =>
          normalize(String(value)).includes(keyword),
        )
      const matchesStatus = status === 'ALL' || payment.status === status
      const matchesType = type === 'ALL' || payment.type === type
      const matchesMethod = method === 'ALL' || payment.method === method

      return matchesSearch && matchesStatus && matchesType && matchesMethod
    })
  }, [method, payments, search, status, type])

  const totalPages = Math.max(1, Math.ceil(visiblePayments.length / PAYMENTS_PER_PAGE))

  const paginatedPayments = useMemo(() => {
    const startIndex = (page - 1) * PAYMENTS_PER_PAGE
    return visiblePayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE)
  }, [page, visiblePayments])

  useEffect(() => {
    setPage(1)
  }, [search, status, type, method])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  function refreshPayments() {
    paymentsQuery.refetch()
    statsQuery.refetch()
  }

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:max-w-[1360px] xl:gap-7 2xl:max-w-[1536px] 2xl:gap-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between xl:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl 2xl:text-4xl">
              Quản lý thanh toán
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base 2xl:max-w-3xl">
              Theo dõi giao dịch, trạng thái PayOS, ví và dòng tiền phát sinh trên hệ thống UniNest.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 2xl:gap-6">
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Tổng giao dịch</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-950 2xl:text-3xl">
              <WalletCards className="size-5 text-primary" />
              {stats?.totalPayments ?? payments.length}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đã thanh toán</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-green-700 2xl:text-3xl">
              <CheckCircle2 className="size-5" />
              {formatCurrency(stats?.completedAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đang chờ</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-amber-700 2xl:text-3xl">
              <Clock3 className="size-5" />
              {stats?.pendingCount ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Lỗi / hủy</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-red-600 2xl:text-3xl">
              <AlertCircle className="size-5" />
              {stats?.failedCount ?? 0}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="grid gap-3 border-b border-primary/10 p-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_170px] xl:p-5 2xl:p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                placeholder="Tìm theo người dùng, mã giao dịch, ghi chú..."
              />
            </div>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={type}
              onChange={(event) => setType(event.target.value as TypeFilter)}
            >
              <option value="ALL">Tất cả loại</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={method}
              onChange={(event) => setMethod(event.target.value as MethodFilter)}
            >
              <option value="ALL">Tất cả phương thức</option>
              {Object.entries(methodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            {paymentsQuery.isLoading ? (
              <div className="flex min-h-60 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải giao dịch...
              </div>
            ) : paymentsQuery.isError ? (
              <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                <p className="font-semibold text-red-600">
                  Không thể tải danh sách thanh toán.
                </p>
                <Button type="button" variant="outline" onClick={refreshPayments}>
                  Thử lại
                </Button>
              </div>
            ) : visiblePayments.length > 0 ? (
              <table className="w-full min-w-[1040px] table-fixed text-left xl:min-w-0">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Người thanh toán
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Phân loại
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {paginatedPayments.map((payment) => {
                    const payer = getUser(payment.payerId)
                    return (
                      <tr key={payment._id} className="align-middle">
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={payer?.fullName ?? 'U'}
                              className="bg-slate-200 text-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {payer?.fullName ?? 'Không rõ'}
                              </p>
                              <p className="truncate text-sm text-slate-500">
                                {payer?.email ?? '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-900 xl:px-5 2xl:px-6 2xl:py-5">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="font-semibold text-slate-800">
                              {typeLabels[payment.type]}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Banknote className="size-3.5" />
                              {payment.method
                                ? methodLabels[payment.method]
                                : 'Chưa chọn'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                          {formatDate(payment.paidAt ?? payment.createdAt)}
                        </td>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <span
                            className={cn(
                              'inline-flex rounded-lg px-2.5 py-1 text-xs font-bold',
                              statusStyles[payment.status],
                            )}
                          >
                            {statusLabels[payment.status]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                Không có giao dịch phù hợp bộ lọc.
              </div>
            )}
          </div>

          {!paymentsQuery.isLoading && !paymentsQuery.isError && visiblePayments.length > 0 ? (
            <div className="border-t border-primary/10 px-4 py-4 xl:px-5 2xl:px-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                isDisabled={paymentsQuery.isFetching}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
