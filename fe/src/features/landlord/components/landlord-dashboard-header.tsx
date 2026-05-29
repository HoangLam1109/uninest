import { Bell, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

type LandlordDashboardHeaderProps = {
  greeting?: string
  subtitle?: string
}

export function LandlordDashboardHeader({
  greeting,
  subtitle = 'Hôm nay có 3 khoản thanh toán mới cần duyệt.',
}: LandlordDashboardHeaderProps) {
  const { user } = useAuth()
  const displayName = user?.fullName?.split(' ').pop() ?? 'Admin'
  const title = greeting ?? `Chào buổi sáng, ${displayName}!`

  return (
    <header className="flex flex-col gap-4 md:gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl lg:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 md:text-base">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-4 lg:shrink-0">
        <div className="relative w-full sm:max-w-xs md:max-w-none lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm nhanh..."
            className="h-10 w-full border border-primary/10 py-2 pl-10 pr-4 text-sm shadow-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-xl border border-primary/10 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Thông báo"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          {user ? (
            <div className="rounded-full border border-primary/30 bg-primary/20 p-0.5">
              <Avatar name={user.fullName} className="size-9 text-xs md:size-10" />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
