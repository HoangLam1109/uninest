import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  staffPriorityLabels,
  staffPriorityStyles,
  staffQueues,
  staffStats,
} from '../data'
import {
  useStaffUiStore,
  type StaffPriority,
  type StaffQueue,
} from '../stores/staff-ui.store'

const queueTabs: { value: StaffQueue; label: string }[] = [
  { value: 'rooms', label: 'Hồ sơ phòng' },
  { value: 'tickets', label: 'Hỗ trợ' },
  { value: 'appointments', label: 'Lịch hẹn' },
]

const priorityOptions: StaffPriority[] = ['all', 'high', 'medium', 'low']

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function StaffDashboard() {
  const activeQueue = useStaffUiStore((state) => state.activeQueue)
  const priority = useStaffUiStore((state) => state.priority)
  const search = useStaffUiStore((state) => state.search)
  const selectedTaskId = useStaffUiStore((state) => state.selectedTaskId)
  const setActiveQueue = useStaffUiStore((state) => state.setActiveQueue)
  const setPriority = useStaffUiStore((state) => state.setPriority)
  const setSearch = useStaffUiStore((state) => state.setSearch)
  const setSelectedTaskId = useStaffUiStore((state) => state.setSelectedTaskId)

  const tasks = staffQueues[activeQueue]
  const visibleTasks = useMemo(() => {
    const keyword = normalize(search)
    return tasks.filter((task) => {
      const matchesPriority = priority === 'all' || task.priority === priority
      const matchesSearch =
        !keyword ||
        [task.title, task.owner, task.status, task.note].some((value) =>
          normalize(value).includes(keyword),
        )
      return matchesPriority && matchesSearch
    })
  }, [priority, search, tasks])

  const selectedTask =
    visibleTasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0]

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <header>
            <p className="text-sm font-semibold uppercase text-primary">Staff</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Không gian vận hành
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Quản lý hồ sơ phòng, hỗ trợ khách thuê và lịch hẹn xem phòng trong ngày.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {staffStats.map((stat) => {
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

          <section className="rounded-xl border border-primary/10 bg-white">
            <div className="flex flex-col gap-4 border-b border-primary/10 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {queueTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={cn(
                      'h-10 rounded-lg px-4 text-sm font-bold transition-colors',
                      activeQueue === tab.value
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                    onClick={() => setActiveQueue(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_160px] lg:w-[480px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                    placeholder="Tìm công việc..."
                  />
                </div>
                <select
                  className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as StaffPriority)
                  }
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {staffPriorityLabels[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2">
              {visibleTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    selectedTaskId === task.id
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/10 hover:bg-slate-50',
                  )}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{task.owner}</p>
                    </div>
                    <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', staffPriorityStyles[task.priority])}>
                      {staffPriorityLabels[task.priority]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{task.note}</p>
                  <p className="mt-3 text-xs font-semibold uppercase text-primary">
                    {task.status}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-primary/10 bg-white p-5 xl:sticky xl:top-6 xl:h-fit">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Chi tiết đang chọn
          </p>
          {selectedTask ? (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-slate-950">{selectedTask.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedTask.owner}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {selectedTask.note}
              </p>
              <div className="mt-5 flex gap-2">
                <Button type="button" className="min-w-0 flex-1">
                  Đánh dấu xong
                </Button>
                <Button type="button" variant="outline" className="min-w-0 flex-1">
                  Chuyển tiếp
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Không có công việc phù hợp với bộ lọc hiện tại.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
