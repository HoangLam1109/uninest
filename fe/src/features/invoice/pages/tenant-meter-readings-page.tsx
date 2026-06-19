import { useMemo, useState } from 'react'
import { useGetMyMeterReadings } from '../hooks/use-invoices'
import type { MeterReading, MeterType } from '../types/invoice.type'
import {
  formatBillingMonth,
  formatMeterDate,
  meterColor,
  meterTypeLabel,
  meterUnit,
  sourceLabel,
} from '../lib/invoice-display'

type FilterType = 'ALL' | MeterType

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ELECTRICITY', label: '⚡ Điện' },
  { key: 'WATER', label: '💧 Nước' },
]

export function TenantMeterReadingsPage() {
  const [filter, setFilter] = useState<FilterType>('ALL')

  const meterType = filter === 'ALL' ? undefined : filter
  const readingsQuery = useGetMyMeterReadings(meterType ? { meterType } : undefined)

  // Group by billingMonth
  const groupedByMonth = useMemo(() => {
    const readings = readingsQuery.data?.data ?? []
    const map = new Map<
      string,
      { electricity?: MeterReading; water?: MeterReading }
    >()
    for (const r of readings) {
      const entry = map.get(r.billingMonth) ?? {}
      if (r.meterType === 'ELECTRICITY') entry.electricity = r
      if (r.meterType === 'WATER') entry.water = r
      map.set(r.billingMonth, entry)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [readingsQuery.data?.data])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 2xl:mx-0 2xl:max-w-none">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Chỉ số điện nước
          </h1>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {readingsQuery.isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Đang tải...</p>
      ) : groupedByMonth.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-500">
            Chưa có chỉ số
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Chỉ số điện nước sẽ hiển thị khi chủ nhà tạo hóa đơn đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {groupedByMonth.map(([month, entry]) => (
            <MonthCard
              key={month}
              billingMonth={month}
              electricity={entry.electricity}
              water={entry.water}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MonthCard({
  billingMonth,
  electricity,
  water,
}: {
  billingMonth: string
  electricity?: MeterReading
  water?: MeterReading
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          {formatBillingMonth(billingMonth)}
        </h3>
        {electricity?.invoiceId || water?.invoiceId ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            📎 Đã lập HĐ
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <ReadingBox type="ELECTRICITY" reading={electricity} />
        <ReadingBox type="WATER" reading={water} />
      </div>
    </div>
  )
}

function ReadingBox({
  type,
  reading,
}: {
  type: MeterType
  reading?: MeterReading
}) {
  const color = meterColor(type)

  if (!reading) {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-center">
        <p className="text-2xl">{type === 'ELECTRICITY' ? '⚡' : '💧'}</p>
        <p className="mt-1 text-sm text-slate-400">Chưa ghi</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-slate-50 p-4 text-center">
      <p className="text-sm font-semibold text-slate-500">
        {meterTypeLabel(type)}
      </p>
      <p className="mt-1 text-3xl font-bold" style={{ color }}>
        {reading.readingValue.toLocaleString('vi-VN')}
      </p>
      <p className="text-xs text-slate-400">{meterUnit(type)}</p>
      <div className="mt-3 flex flex-col gap-1">
        <span className="inline-block self-center rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {sourceLabel(reading.source)}
        </span>
        <span className="text-xs text-slate-400">
          {formatMeterDate(reading.readingDate)}
        </span>
      </div>
    </div>
  )
}
