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
    </header>
  )
}
