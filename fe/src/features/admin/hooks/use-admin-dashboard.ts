import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { USER_ROLES } from '@/constants/roles'
import { paymentApi } from '@/features/payment/api/payment.api'
import type {
  AdminPayment,
  AdminPaymentStats,
  PaymentType,
} from '@/features/payment/types/payment.type'
import { userApi } from '@/features/user/api/user.api'
import type { User } from '@/features/user/types/user.type'

export type RevenuePoint = {
  label: string
  amount: number
}

export type TypeRevenuePoint = {
  type: PaymentType
  label: string
  amount: number
}

export type RoleBreakdownPoint = {
  label: string
  value: number
}

export type DashboardStat = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}

export const typeLabels: Record<PaymentType, string> = {
  RENT: 'Tiền thuê',
  DEPOSIT: 'Đặt cọc',
  UTILITY: 'Tiện ích',
  SERVICE_FEE: 'Phí dịch vụ',
  TENANT_PACKAGE: 'Gói tenant',
  LANDLORD_PACKAGE: 'Gói landlord',
  REFUND: 'Hoàn tiền',
}

const packagePaymentTypes = new Set<PaymentType>([
  'SERVICE_FEE',
  'TENANT_PACKAGE',
  'LANDLORD_PACKAGE',
])

const emptyUsers: User[] = []
const emptyPayments: AdminPayment[] = []

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatRelativePercent(value: number) {
  return `${Math.round(value)}%`
}

export function isCompletedPayment(payment: AdminPayment) {
  return payment.status === 'COMPLETED'
}

export function getPaymentDate(payment: AdminPayment) {
  const rawDate = payment.paidAt ?? payment.createdAt
  const date = rawDate ? new Date(rawDate) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export function getPaymentUserName(
  value?: string | { fullName?: string; email?: string } | null,
) {
  if (!value) return 'Người dùng UniNest'
  if (typeof value === 'string') return value
  return value.fullName ?? value.email ?? 'Người dùng UniNest'
}

function getLastSixMonthKeys() {
  const months: Array<{ key: string; label: string }> = []
  const cursor = new Date()
  cursor.setDate(1)

  for (let index = 5; index >= 0; index -= 1) {
    const month = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1)
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key,
      label: new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(month),
    })
  }

  return months
}

function buildRevenueSeries(payments: AdminPayment[]): RevenuePoint[] {
  const months = getLastSixMonthKeys()
  const totals = new Map(months.map((month) => [month.key, 0]))

  for (const payment of payments) {
    if (!isCompletedPayment(payment)) continue

    const date = getPaymentDate(payment)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!totals.has(key)) continue

    totals.set(key, (totals.get(key) ?? 0) + payment.amount)
  }

  return months.map((month) => ({
    label: month.label,
    amount: totals.get(month.key) ?? 0,
  }))
}

function buildTypeRevenue(payments: AdminPayment[]): TypeRevenuePoint[] {
  const totals = new Map<PaymentType, number>()

  for (const payment of payments) {
    if (!isCompletedPayment(payment)) continue
    totals.set(payment.type, (totals.get(payment.type) ?? 0) + payment.amount)
  }

  return Array.from(totals.entries())
    .map(([type, amount]) => ({
      type,
      label: typeLabels[type],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

function getCurrentMonthRevenue(payments: AdminPayment[]) {
  const now = new Date()
  return payments.reduce((total, payment) => {
    if (!isCompletedPayment(payment)) return total

    const date = getPaymentDate(payment)
    const sameMonth =
      date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()

    return sameMonth ? total + payment.amount : total
  }, 0)
}

function getPreviousMonthRevenue(payments: AdminPayment[]) {
  const now = new Date()
  const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
  const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  return payments.reduce((total, payment) => {
    if (!isCompletedPayment(payment)) return total

    const date = getPaymentDate(payment)
    const sameMonth =
      date.getFullYear() === previousYear && date.getMonth() === previousMonth

    return sameMonth ? total + payment.amount : total
  }, 0)
}

function buildRoleBreakdown(users: User[]): RoleBreakdownPoint[] {
  const counts = new Map<string, number>([
    ['Khách thuê', 0],
    ['Chủ nhà', 0],
    ['Nhân viên', 0],
    ['Quản trị', 0],
    ['Khách vãng lai', 0],
  ])

  for (const user of users) {
    if (user.role === USER_ROLES.TENANT) {
      counts.set('Khách thuê', (counts.get('Khách thuê') ?? 0) + 1)
      continue
    }
    if (user.role === USER_ROLES.LANDLORD) {
      counts.set('Chủ nhà', (counts.get('Chủ nhà') ?? 0) + 1)
      continue
    }
    if (user.role === USER_ROLES.STAFF) {
      counts.set('Nhân viên', (counts.get('Nhân viên') ?? 0) + 1)
      continue
    }
    if (user.role === USER_ROLES.ADMIN) {
      counts.set('Quản trị', (counts.get('Quản trị') ?? 0) + 1)
      continue
    }
    counts.set('Khách vãng lai', (counts.get('Khách vãng lai') ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
}

function getRecentPayments(payments: AdminPayment[]) {
  return [...payments]
    .sort(
      (first, second) =>
        getPaymentDate(second).getTime() - getPaymentDate(first).getTime(),
    )
    .slice(0, 5)
}

function getCompletedRevenue(
  payments: AdminPayment[],
  paymentStats?: AdminPaymentStats,
) {
  return (
    paymentStats?.completedAmount ??
    payments.reduce((total, payment) => {
      return isCompletedPayment(payment) ? total + payment.amount : total
    }, 0)
  )
}

function getPackageRevenue(payments: AdminPayment[]) {
  return payments.reduce((total, payment) => {
    if (!isCompletedPayment(payment) || !packagePaymentTypes.has(payment.type)) {
      return total
    }

    return total + payment.amount
  }, 0)
}

function buildDashboardStats(
  users: User[],
  payments: AdminPayment[],
  completedRevenue: number,
  currentMonthRevenue: number,
): DashboardStat[] {
  const activeUsers = users.filter((user) => user.isActive !== false).length
  const upgradedUsers = users.filter(
    (user) => user.role && user.role !== USER_ROLES.GUEST,
  ).length

  return [
    {
      label: 'Người dùng',
      value: users.length.toLocaleString('vi-VN'),
      detail: `${activeUsers.toLocaleString('vi-VN')} đang hoạt động`,
      icon: Users,
    },
    {
      label: 'Tài khoản nâng cấp',
      value: upgradedUsers.toLocaleString('vi-VN'),
      detail: 'Tenant, landlord, staff và admin',
      icon: UserCheck,
    },
    {
      label: 'Doanh thu hoàn tất',
      value: formatCurrency(completedRevenue),
      detail: `${formatCurrency(currentMonthRevenue)} trong tháng này`,
      icon: TrendingUp,
    },
    {
      label: 'Doanh thu gói',
      value: formatCurrency(getPackageRevenue(payments)),
      detail: 'Gói tenant, landlord và dịch vụ',
      icon: CreditCard,
    },
  ]
}

export function useAdminDashboard() {
  const usersQuery = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      const { data } = await userApi.list()
      return data.data
    },
  })

  const paymentsQuery = useQuery({
    queryKey: ['admin-dashboard-payments'],
    queryFn: async () => {
      const { data } = await paymentApi.adminListPayments({ limit: 500 })
      return data.data
    },
  })

  const statsQuery = useQuery({
    queryKey: ['admin-dashboard-payment-stats'],
    queryFn: async () => {
      const { data } = await paymentApi.adminGetPaymentStats()
      return data.data
    },
  })

  const users = usersQuery.data ?? emptyUsers
  const payments = paymentsQuery.data ?? emptyPayments
  const paymentStats = statsQuery.data

  const completedRevenue = getCompletedRevenue(payments, paymentStats)
  const currentMonthRevenue = getCurrentMonthRevenue(payments)
  const previousMonthRevenue = getPreviousMonthRevenue(payments)
  const monthGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0
        ? 100
        : 0

  const collectionRate =
    paymentStats?.totalPayments && paymentStats.totalPayments > 0
      ? (paymentStats.completedCount / paymentStats.totalPayments) * 100
      : 0

  const dashboardStats = useMemo(
    () =>
      buildDashboardStats(
        users,
        payments,
        completedRevenue,
        currentMonthRevenue,
      ),
    [completedRevenue, currentMonthRevenue, payments, users],
  )

  const revenueSeries = useMemo(() => buildRevenueSeries(payments), [payments])
  const typeRevenue = useMemo(() => buildTypeRevenue(payments), [payments])
  const roleBreakdown = useMemo(() => buildRoleBreakdown(users), [users])
  const recentPayments = useMemo(() => getRecentPayments(payments), [payments])

  return {
    users,
    payments,
    paymentStats,
    dashboardStats,
    revenueSeries,
    typeRevenue,
    roleBreakdown,
    recentPayments,
    currentMonthRevenue,
    completedRevenue,
    collectionRate,
    monthGrowth,
    isLoading:
      usersQuery.isLoading || paymentsQuery.isLoading || statsQuery.isLoading,
    hasError: usersQuery.isError || paymentsQuery.isError || statsQuery.isError,
  }
}
