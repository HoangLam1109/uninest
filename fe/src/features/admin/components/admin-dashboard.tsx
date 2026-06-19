import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/common/chart'
import { USER_ROLES } from '@/constants/roles'
import { paymentApi } from '@/features/payment/api/payment.api'
import type {
  AdminPayment,
  PaymentType,
} from '@/features/payment/types/payment.type'
import { userApi } from '@/features/user/api/user.api'
import type { User } from '@/features/user/types/user.type'

type RevenuePoint = {
  label: string
  amount: number
}

type TypeRevenuePoint = {
  type: PaymentType
  label: string
  amount: number
}

type RoleBreakdownPoint = {
  label: string
  value: number
}

const typeLabels: Record<PaymentType, string> = {
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

const revenueChartConfig = {
  amount: {
    label: 'Doanh thu',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

const typeRevenueChartConfig = {
  amount: {
    label: 'Doanh thu theo loại',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

const emptyUsers: User[] = []
const emptyPayments: AdminPayment[] = []

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatRelativePercent(value: number) {
  return `${Math.round(value)}%`
}

function isCompletedPayment(payment: AdminPayment) {
  return payment.status === 'COMPLETED'
}

function getPaymentDate(payment: AdminPayment) {
  const rawDate = payment.paidAt ?? payment.createdAt
  const date = rawDate ? new Date(rawDate) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function getPaymentUserName(
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
      label: new Intl.DateTimeFormat('vi-VN', {
        month: 'short',
      }).format(month),
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

function LineRevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ChartContainer config={revenueChartConfig} className="h-72 w-full min-w-0">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 8, right: 8, top: 12 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={58}
          tickFormatter={formatCompactCurrency}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="amount"
          type="monotone"
          stroke="var(--color-amount)"
          strokeWidth={3}
          dot={{ r: 4, fill: 'var(--color-amount)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

function TypeRevenueBars({ data }: { data: TypeRevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500">
        Chưa có doanh thu hoàn tất
      </div>
    )
  }

  return (
    <ChartContainer config={typeRevenueChartConfig} className="h-72 w-full min-w-0">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 2, right: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={112}
        />
        <XAxis dataKey="amount" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

function StatTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const Icon = icon

  return (
    <article className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{detail}</p>
    </article>
  )
}

function InsightCard({
  title,
  value,
  detail,
  tone = 'default',
}: {
  title: string
  value: string
  detail: string
  tone?: 'default' | 'warning' | 'success'
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50'
          : tone === 'success'
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-primary/10 bg-slate-50'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </article>
  )
}

function SectionPanel({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const Icon = icon

  return (
    <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      {children}
    </article>
  )
}

export function AdminDashboard() {
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

  const completedRevenue =
    paymentStats?.completedAmount ??
    payments.reduce(
      (total, payment) =>
        isCompletedPayment(payment) ? total + payment.amount : total,
      0,
    )

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

  const dashboardStats = useMemo(() => {
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
        value: formatCurrency(
          payments.reduce((total, payment) => {
            if (
              !isCompletedPayment(payment) ||
              !packagePaymentTypes.has(payment.type)
            ) {
              return total
            }

            return total + payment.amount
          }, 0),
        ),
        detail: 'Gói tenant, landlord và dịch vụ',
        icon: CreditCard,
      },
    ]
  }, [completedRevenue, currentMonthRevenue, payments, users])

  const revenueSeries = useMemo(() => buildRevenueSeries(payments), [payments])
  const typeRevenue = useMemo(() => buildTypeRevenue(payments), [payments])
  const roleBreakdown = useMemo(() => buildRoleBreakdown(users), [users])
  const recentPayments = useMemo(() => getRecentPayments(payments), [payments])

  const isLoading =
    usersQuery.isLoading || paymentsQuery.isLoading || statsQuery.isLoading
  const hasError = usersQuery.isError || paymentsQuery.isError || statsQuery.isError

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 xl:max-w-[1440px] xl:gap-7 2xl:max-w-[1640px] 2xl:gap-8">
        <section className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(15,23,42,0.05),transparent_28%)]" />
          <div className="relative grid gap-6 p-6 md:p-7 xl:grid-cols-[minmax(0,1.18fr)_360px] xl:gap-8 2xl:grid-cols-[minmax(0,1.3fr)_420px] 2xl:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Activity className="size-3.5" />
                Admin Console
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
                Toàn cảnh vận hành, dòng tiền và sức khỏe nền tảng UniNest
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Một màn hình theo dõi dành cho admin để nhìn nhanh tăng trưởng, chất lượng thanh toán và vùng cần can thiệp trong ngày.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:mt-7 xl:gap-4 2xl:mt-8">
                <InsightCard
                  title="Tỷ lệ thu tiền"
                  value={isLoading ? '-' : formatRelativePercent(collectionRate)}
                  detail={`${paymentStats?.completedCount ?? 0}/${paymentStats?.totalPayments ?? 0} giao dịch hoàn tất`}
                  tone="success"
                />
                <InsightCard
                  title="Tăng trưởng tháng"
                  value={isLoading ? '-' : formatRelativePercent(monthGrowth)}
                  detail="So với tháng trước"
                />
                <InsightCard
                  title="Cần theo dõi"
                  value={
                    isLoading
                      ? '-'
                      : String(
                          (paymentStats?.pendingCount ?? 0) +
                            (paymentStats?.failedCount ?? 0),
                        )
                  }
                  detail="Pending và failed payments"
                  tone="warning"
                />
              </div>
            </div>

            <div className="grid gap-3 self-start xl:gap-4">
              <article className="rounded-3xl border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                      Health snapshot
                    </p>
                    <h2 className="mt-2 text-lg font-bold">Tín hiệu hệ thống</h2>
                  </div>
                  <ShieldCheck className="size-5 text-emerald-300" />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                      Doanh thu chờ xử lý
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {isLoading
                        ? '-'
                        : formatCurrency(paymentStats?.pendingAmount ?? 0)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 2xl:gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">Thanh toán lỗi</p>
                        <TriangleAlert className="size-4 text-amber-300" />
                      </div>
                      <p className="mt-3 text-2xl font-bold">
                        {isLoading ? '-' : paymentStats?.failedCount ?? 0}
                      </p>
                      <p className="mt-1 text-xs text-white/60">Cần kiểm tra lại luồng</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">Vai trò mạnh nhất</p>
                        <Users className="size-4 text-blue-300" />
                      </div>
                      <p className="mt-3 text-lg font-bold">
                        {roleBreakdown[0]?.label ?? 'Chưa có dữ liệu'}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {roleBreakdown[0]?.value?.toLocaleString('vi-VN') ?? 0} tài khoản
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {hasError ? (
          <section className="rounded-2xl border border-red-200 bg-white p-6 text-sm font-semibold text-red-600">
            Không thể tải dữ liệu dashboard. Vui lòng thử làm mới lại.
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
          {dashboardStats.map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={isLoading ? '-' : stat.value}
              detail={stat.detail}
              icon={stat.icon}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.38fr)_minmax(360px,0.62fr)] 2xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.58fr)] 2xl:gap-5">
          <SectionPanel
            eyebrow="Báo cáo doanh thu"
            title="Doanh thu 6 tháng gần nhất"
            icon={BarChart3}
          >
            {isLoading ? (
              <div className="flex h-72 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải biểu đồ...
              </div>
            ) : (
              <LineRevenueChart data={revenueSeries} />
            )}
          </SectionPanel>

          <SectionPanel
            eyebrow="Cơ cấu doanh thu"
            title="Theo loại thanh toán"
            icon={Wallet}
          >
            {isLoading ? (
              <div className="flex h-72 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải dữ liệu...
              </div>
            ) : (
              <TypeRevenueBars data={typeRevenue} />
            )}
          </SectionPanel>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)] 2xl:grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)] 2xl:gap-5">
          <SectionPanel
            eyebrow="Phân bổ người dùng"
            title="Cơ cấu vai trò trên hệ thống"
            icon={Users}
          >
            <div className="space-y-4">
              {roleBreakdown.map((item, index) => {
                const width =
                  users.length > 0 ? `${(item.value / users.length) * 100}%` : '0%'

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                          {index + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-950">
                        {item.value.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionPanel>

          <SectionPanel
            eyebrow="Thanh toán mới"
            title="5 giao dịch gần nhất"
            icon={CreditCard}
          >
            <div className="space-y-3">
              {recentPayments.length === 0 && !isLoading ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  Chưa có thanh toán gần đây.
                </div>
              ) : null}

              {recentPayments.map((payment) => (
                <article
                  key={payment._id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {getPaymentUserName(payment.payerId)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {typeLabels[payment.type]} ·{' '}
                      {new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(getPaymentDate(payment))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : payment.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {payment.status === 'COMPLETED'
                        ? 'Hoàn tất'
                        : payment.status === 'PENDING'
                          ? 'Đang chờ'
                          : payment.status === 'FAILED'
                            ? 'Thất bại'
                            : payment.status === 'REFUNDED'
                              ? 'Hoàn tiền'
                              : 'Đã hủy'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </SectionPanel>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 2xl:gap-5">
          <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">Tín hiệu tốt</p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  Luồng thu tiền đang giữ nhịp ổn định
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <TriangleAlert className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">Cần theo dõi</p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  {paymentStats?.pendingCount ?? 0} giao dịch chờ xác nhận
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ArrowUpRight className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">Nhịp tăng trưởng</p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  {formatCurrency(currentMonthRevenue)} trong tháng hiện tại
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
