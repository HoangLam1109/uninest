import { ChevronDown } from 'lucide-react'
import { revenueMonths, utilityWeekDays } from '../data'

function UtilitiesChart() {
  return (
    <div className="relative h-40 w-full md:h-48">
      <svg
        viewBox="0 0 400 160"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="electric-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 L50 95 L100 110 L150 70 L200 85 L250 55 L300 75 L350 45 L400 60 L400 160 L0 160 Z"
          fill="url(#water-fill)"
        />
        <path
          d="M0 100 L50 80 L100 95 L150 55 L200 70 L250 40 L300 60 L350 30 L400 45"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 130 L50 105 L100 120 L150 85 L200 95 L250 65 L300 88 L350 58 L400 72 L400 160 L0 160 Z"
          fill="url(#electric-fill)"
        />
        <path
          d="M0 110 L50 90 L100 105 L150 65 L200 78 L250 48 L300 68 L350 38 L400 52"
          fill="none"
          stroke="#ff8c00"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[10px] text-slate-400 md:px-2">
        {utilityWeekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  )
}

export function LandlordCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
      <section className="rounded-2xl border border-primary/10 bg-white p-4 md:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-base font-bold text-slate-900 md:text-lg">
            Doanh thu 6 tháng gần nhất
          </h2>
          <button
            type="button"
            className="flex w-fit items-center gap-2 rounded-lg border border-primary/10 px-3 py-2 text-sm text-slate-500"
          >
            Năm 2024
            <ChevronDown className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex h-36 items-end justify-between gap-1 px-1 md:mt-6 md:h-48 md:gap-2 md:px-2">
          {revenueMonths.map((month) => (
            <div key={month} className="flex flex-1 flex-col items-center gap-1.5 md:gap-2">
              <div className="w-full max-w-8 flex-1 rounded-t-md bg-primary/10" />
              <span className="text-[10px] font-bold uppercase text-slate-500 md:text-xs">
                {month}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/10 bg-white p-4 md:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:gap-4">
          <h2 className="text-base font-bold text-slate-900 md:text-lg">
            Tiêu thụ Điện &amp; Nước
          </h2>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-primary" />
              Điện
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-blue-400" />
              Nước
            </span>
          </div>
        </div>
        <div className="mt-3 md:mt-4">
          <UtilitiesChart />
        </div>
        <div className="mt-3 flex flex-col gap-3 border-t border-primary/5 pt-3 text-sm sm:flex-row sm:justify-between md:mt-4 md:pt-4">
          <div>
            <p className="text-slate-500">Tổng phí điện</p>
            <p className="font-bold text-slate-900">12.450.000đ</p>
          </div>
          <div>
            <p className="text-slate-500">Tổng phí nước</p>
            <p className="font-bold text-slate-900">3.200.000đ</p>
          </div>
        </div>
      </section>
    </div>
  )
}
