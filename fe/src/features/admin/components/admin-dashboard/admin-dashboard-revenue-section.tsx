import { useEffect, useState } from 'react'
import { BarChart3, Loader2, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/common/chart'
import { cn } from '@/lib/utils'
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

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const handleChange = () => setIsMobile(mediaQuery.matches)
    handleChange()

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [breakpoint])

  return isMobile
}

function truncateLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength).trim()}...`
}

function RevenueBarChart({
  data,
  isMobile,
}: {
  data: RevenuePoint[]
  isMobile: boolean
}) {
  return (
    <ChartContainer
      config={revenueChartConfig}
      className={cn(
        'h-72 w-full min-w-0 !aspect-auto overflow-hidden',
        isMobile && 'h-60',
      )}
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{
          left: isMobile ? -20 : 8,
          right: isMobile ? 0 : 8,
          top: 12,
          bottom: isMobile ? 8 : 0,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={isMobile ? 6 : 8}
          minTickGap={isMobile ? 24 : 12}
          tick={{ fontSize: isMobile ? 11 : 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={isMobile ? 6 : 8}
          width={isMobile ? 44 : 58}
          tick={{ fontSize: isMobile ? 11 : 12 }}
          tickFormatter={formatCompactCurrency}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={[8, 8, 0, 0]}
          maxBarSize={isMobile ? 28 : 40}
        />
      </BarChart>
    </ChartContainer>
  )
}

function TypeRevenueBars({
  data,
  isMobile,
}: {
  data: TypeRevenuePoint[]
  isMobile: boolean
}) {
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
      className={cn(
        'h-72 w-full min-w-0 !aspect-auto overflow-hidden',
        isMobile && 'h-64',
      )}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: isMobile ? -24 : 0,
          right: isMobile ? 12 : 8,
          top: isMobile ? 4 : 0,
          bottom: isMobile ? 4 : 0,
        }}
        barCategoryGap={isMobile ? 16 : 12}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={isMobile ? 6 : 8}
          width={isMobile ? 72 : 112}
          tick={{ fontSize: isMobile ? 11 : 12 }}
          tickFormatter={(value: string) =>
            isMobile ? truncateLabel(value, 8) : value
          }
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
  const isMobile = useIsMobile()

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
          <RevenueBarChart data={revenueSeries} isMobile={isMobile} />
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
          <TypeRevenueBars data={typeRevenue} isMobile={isMobile} />
        )}
      </SectionPanel>
    </section>
  )
}
