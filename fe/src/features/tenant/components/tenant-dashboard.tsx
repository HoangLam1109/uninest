import { useMemo } from 'react'
import { CreditCard, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  tenantInvoices,
  tenantMaintenance,
  tenantSavedRooms,
  tenantStats,
  tenantStatusLabels,
  tenantStatusStyles,
} from '../data'
import {
  useTenantUiStore,
  type TenantStatus,
  type TenantTab,
} from '../stores/tenant-ui.store'

const tabs: { value: TenantTab; label: string }[] = [
  { value: 'invoices', label: 'Hóa đơn' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'savedRooms', label: 'Phòng đã lưu' },
]

const statusOptionsByTab: Record<TenantTab, TenantStatus[]> = {
  invoices: ['all', 'unpaid', 'pending', 'paid'],
  maintenance: ['all', 'processing', 'scheduled', 'done'],
  savedRooms: ['all', 'available', 'new', 'viewed'],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function TenantDashboard() {
  const activeTab = useTenantUiStore((state) => state.activeTab)
  const search = useTenantUiStore((state) => state.search)
  const status = useTenantUiStore((state) => state.status)
  const selectedInvoiceId = useTenantUiStore((state) => state.selectedInvoiceId)
  const setActiveTab = useTenantUiStore((state) => state.setActiveTab)
  const setSearch = useTenantUiStore((state) => state.setSearch)
  const setStatus = useTenantUiStore((state) => state.setStatus)
  const setSelectedInvoiceId = useTenantUiStore((state) => state.setSelectedInvoiceId)

  const visibleInvoices = useMemo(() => {
    const keyword = normalize(search)
    return tenantInvoices.filter((invoice) => {
      const matchesStatus = status === 'all' || invoice.status === status
      const matchesSearch =
        !keyword ||
        [invoice.code, invoice.title, invoice.amount].some((value) =>
          normalize(value).includes(keyword),
        )
      return matchesStatus && matchesSearch
    })
  }, [search, status])

  const visibleMaintenance = useMemo(() => {
    const keyword = normalize(search)
    return tenantMaintenance.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status
      const matchesSearch =
        !keyword ||
        [item.title, item.room, item.updatedAt].some((value) =>
          normalize(value).includes(keyword),
        )
      return matchesStatus && matchesSearch
    })
  }, [search, status])

  const visibleSavedRooms = useMemo(() => {
    const keyword = normalize(search)
    return tenantSavedRooms.filter((room) => {
      const matchesStatus = status === 'all' || room.status === status
      const matchesSearch =
        !keyword ||
        [room.title, room.location, room.price].some((value) =>
          normalize(value).includes(keyword),
        )
      return matchesStatus && matchesSearch
    })
  }, [search, status])

  const selectedInvoice =
    tenantInvoices.find((invoice) => invoice.id === selectedInvoiceId) ??
    tenantInvoices[0]

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Tenant</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Cổng người thuê
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Theo dõi hợp đồng, hóa đơn, yêu cầu bảo trì và các phòng đang quan tâm.
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-4">
            <p className="text-sm text-slate-500">Hợp đồng hiện tại</p>
            <p className="mt-1 text-lg font-bold text-slate-950">P.102 - UniNest Cầu Giấy</p>
            <p className="mt-1 text-sm text-slate-500">02/2024 - 02/2025</p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tenantStats.map((stat) => {
            const Icon = stat.icon
            return (
              <article
                key={stat.label}
                className="rounded-xl border border-primary/10 bg-white p-5"
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

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-xl border border-primary/10 bg-white">
            <div className="flex flex-col gap-4 border-b border-primary/10 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={cn(
                      'h-10 rounded-lg px-4 text-sm font-bold transition-colors',
                      activeTab === tab.value
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_180px] lg:w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                    placeholder="Tìm kiếm..."
                  />
                </div>
                <select
                  className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TenantStatus)}
                >
                  {statusOptionsByTab[activeTab].map((option) => (
                    <option key={option} value={option}>
                      {tenantStatusLabels[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 p-4">
              {activeTab === 'invoices'
                ? visibleInvoices.map((invoice) => (
                    <button
                      key={invoice.id}
                      type="button"
                      className={cn(
                        'rounded-xl border p-4 text-left transition-colors',
                        selectedInvoiceId === invoice.id
                          ? 'border-primary bg-primary/5'
                          : 'border-primary/10 hover:bg-slate-50',
                      )}
                      onClick={() => setSelectedInvoiceId(invoice.id)}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{invoice.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {invoice.code} · hạn {invoice.due}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-950">{invoice.amount}</p>
                          <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', tenantStatusStyles[invoice.status])}>
                            {tenantStatusLabels[invoice.status]}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                : null}

              {activeTab === 'maintenance'
                ? visibleMaintenance.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-primary/10 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.room} · {item.updatedAt}
                          </p>
                        </div>
                        <span className={cn('w-fit rounded-lg px-2.5 py-1 text-xs font-bold', tenantStatusStyles[item.status])}>
                          {tenantStatusLabels[item.status]}
                        </span>
                      </div>
                    </article>
                  ))
                : null}

              {activeTab === 'savedRooms'
                ? visibleSavedRooms.map((room) => (
                    <article
                      key={room.id}
                      className="rounded-xl border border-primary/10 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{room.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{room.location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-950">{room.price}</p>
                          <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', tenantStatusStyles[room.status])}>
                            {tenantStatusLabels[room.status]}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </section>

          <aside className="rounded-xl border border-primary/10 bg-white p-5 xl:sticky xl:top-6 xl:h-fit">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase text-slate-500">
              Thanh toán nhanh
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {selectedInvoice.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedInvoice.code} · hạn {selectedInvoice.due}
            </p>
            <p className="mt-4 text-3xl font-bold text-slate-950">
              {selectedInvoice.amount}
            </p>
            <Button type="button" className="mt-5 w-full">
              Thanh toán
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
