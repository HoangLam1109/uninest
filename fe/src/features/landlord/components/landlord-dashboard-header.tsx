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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-base text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm nhanh..."
            className="h-10 w-64 border border-primary/10 py-2 pl-10 pr-4 text-sm shadow-none"
          />
        </div>

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
            <Avatar name={user.fullName} className="size-10 text-xs" />
          </div>
        ) : null}
      </div>
    </header>
  )
}
