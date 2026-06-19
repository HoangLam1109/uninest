import { useMemo } from 'react'
import { CheckCircle2, RefreshCcw, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  adminStats,
  adminStatusLabels,
  adminStatusStyles,
  adminUsers,
} from '../data'
import { useAdminUiStore, type AdminStatusFilter } from '../stores/admin-ui.store'

const statusOptions: AdminStatusFilter[] = ['all', 'verified', 'active', 'new']

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function AdminDashboard() {
  const search = useAdminUiStore((state) => state.search)
  const status = useAdminUiStore((state) => state.status)
  const selectedItemId = useAdminUiStore((state) => state.selectedItemId)
  const setSearch = useAdminUiStore((state) => state.setSearch)
  const setStatus = useAdminUiStore((state) => state.setStatus)
  const setSelectedItemId = useAdminUiStore((state) => state.setSelectedItemId)
  const resetFilters = useAdminUiStore((state) => state.resetFilters)

  const visibleUsers = useMemo(() => {
    const keyword = normalize(search)

    return adminUsers.filter((user) => {
      const matchesStatus = status === 'all' || user.status === status
      const matchesSearch =
        !keyword ||
        [user.name, user.role, user.email].some((value) =>
          normalize(value).includes(keyword),
        )

      return matchesStatus && matchesSearch
    })
  }, [search, status])

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Quản trị hệ thống
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Theo dõi người dùng, trạng thái nền tảng và các chỉ số vận hành chính.
            </p>
          </div>
          <Button type="button" onClick={resetFilters} variant="outline">
            <RefreshCcw className="size-4" />
            Đặt lại bộ lọc
          </Button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminStats.map((stat) => {
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
                <p className="mt-3 text-xs font-semibold text-green-700">
                  {stat.change}
                </p>
              </article>
            )
          })}
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="grid gap-3 border-b border-primary/10 p-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                placeholder="Tìm theo tên, email, vai trò..."
              />
            </div>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminStatusFilter)
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {adminStatusLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Người dùng</th>
                  <th className="px-4 py-3 font-semibold">Vai trò</th>
                  <th className="px-4 py-3 font-semibold">Ngày tham gia</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          className="bg-slate-200 text-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{user.role}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.joinedAt}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-bold',
                          adminStatusStyles[user.status],
                        )}
                      >
                        {adminStatusLabels[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Chọn ${user.name}`}
                        onClick={() => setSelectedItemId(user.id)}
                      >
                        <CheckCircle2
                          className={cn(
                            'size-4',
                            selectedItemId === user.id
                              ? 'text-primary'
                              : 'text-slate-400',
                          )}
                        />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
