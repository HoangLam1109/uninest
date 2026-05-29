import { Link, useLocation } from 'react-router-dom'
import { images } from '@/assets/images'
import { paths } from '@/config/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { landlordNavItems, UserPlus } from '../data'

export function LandlordSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-primary/10 bg-white">
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-8">
          <Link to={paths.home} className="flex items-center gap-3">
            <img
              src={images.logo}
              alt=""
              className="size-9 object-contain"
              width={36}
              height={36}
            />
            <div>
              <p className="text-xl font-bold leading-tight text-primary">UniNest</p>
              <p className="text-xs text-slate-500">Chủ nhà Dashboard</p>
            </div>
          </Link>

          <nav className="flex flex-col gap-1" aria-label="Điều hướng chủ nhà">
            {landlordNavItems.map((item) => {
              const isActive =
                item.href === paths.landlordDashboard
                  ? pathname === paths.landlordDashboard
                  : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-colors',
                    isActive
                      ? 'bg-primary font-medium text-white'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-primary/10 pt-6">
          <Button className="h-auto w-full gap-2 py-3 shadow-lg shadow-primary/20">
            <UserPlus className="size-4 shrink-0" />
            <span className="text-center leading-snug">
              Thêm người thuê
              <br />
              mới
            </span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
