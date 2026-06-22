import { BarChart3, Loader2, Wallet } from 'lucide-react'
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
import {
  formatCompactCurrency,
  type RevenuePoint,
  type TypeRevenuePoint,
} from '../../hooks/use-admin-dashboard'
import { SectionPanel } from './admin-dashboard-primitives'

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
    <ChartContainer
      config={typeRevenueChartConfig}
      className="h-72 w-full min-w-0"
    >
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

type AdminDashboardRevenueSectionProps = {
  isLoading: boolean
  revenueSeries: RevenuePoint[]
  typeRevenue: TypeRevenuePoint[]
}

export function AdminDashboardRevenueSection({
  isLoading,
  revenueSeries,
  typeRevenue,
}: AdminDashboardRevenueSectionProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.38fr)_minmax(320px,0.62fr)] 2xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.58fr)] 2xl:gap-5">
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
  )
}
