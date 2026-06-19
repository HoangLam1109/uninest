import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  tenantInvoices,
  tenantMaintenance,
  tenantSavedRooms,
  tenantStats,
  tenantStatusLabels,
  tenantStatusStyles,
} from '../data'

export function TenantDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 2xl:mx-0 2xl:max-w-none">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">
            Cong nguoi thue
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
            Tong quan thue phong
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
            Theo doi tien thue, hop dong, yeu cau bao tri va phong da luu.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/phong">
            Tim phong
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tenantStats.map((stat) => {
          const Icon = stat.icon
          return (
            <article
              key={stat.label}
              className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {stat.change}
              </p>
            </article>
          )
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-primary/10 p-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Hoa don gan day</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cac khoan can theo doi trong thang.
              </p>
            </div>
            <Button asChild variant="ghost" className="min-w-0 px-3">
              <Link to="/cu-dan/hoa-don">
                Xem tat ca
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ma</th>
                  <th className="px-4 py-3 font-semibold">Noi dung</th>
                  <th className="px-4 py-3 font-semibold">Han</th>
                  <th className="px-4 py-3 font-semibold">So tien</th>
                  <th className="px-4 py-3 font-semibold">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {tenantInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {invoice.code}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {invoice.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {invoice.due}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-primary">
                      {invoice.amount}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-bold',
                          tenantStatusStyles[invoice.status],
                        )}
                      >
                        {tenantStatusLabels[invoice.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Bao tri</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tinh trang cac yeu cau gan nhat.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {tenantMaintenance.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-primary/10 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.room} - {item.updatedAt}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold',
                      tenantStatusStyles[item.status],
                    )}
                  >
                    {tenantStatusLabels[item.status]}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Phong da luu</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cac phong ban dang quan tam.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/cu-dan/phong-da-luu">
              Quan ly
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {tenantSavedRooms.map((room) => (
            <article
              key={room.id}
              className="rounded-lg border border-primary/10 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-950">{room.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{room.location}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold',
                    tenantStatusStyles[room.status],
                  )}
                >
                  {tenantStatusLabels[room.status]}
                </span>
              </div>
              <p className="mt-4 font-bold text-primary">{room.price}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
