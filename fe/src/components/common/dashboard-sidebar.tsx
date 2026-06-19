import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, type LucideIcon } from 'lucide-react'
import { images } from '@/assets/images'
import { paths } from '@/config/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type DashboardSidebarConfig = {
  baseHref: string
  label: string
  navLabel: string
  navItems: readonly DashboardNavItem[]
  ctaLabel?: string
  ctaIcon?: LucideIcon
  ctaOnClick?: () => void
  ctaHref?: string
}

type DashboardSidebarProps = {
  config: DashboardSidebarConfig
  mobileOpen: boolean
  onMobileClose: () => void
}

export function DashboardSidebar({
  config,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  const CtaIcon = config.ctaIcon

  return (
    <>
      <button
        type="button"
        aria-label="Đóng menu"
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,17rem)] flex-col border-r border-primary/10 bg-white transition-transform duration-300 ease-out md:w-64',
          'lg:z-40 lg:w-64 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4 md:p-6">
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={paths.home}
                className="flex min-w-0 items-center gap-3"
                onClick={onMobileClose}
              >
                <img
                  src={images.logo}
                  alt=""
                  className="size-9 shrink-0 object-contain"
                  width={36}
                  height={36}
                />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold leading-tight text-primary md:text-xl">
                    UniNest
                  </p>
                  <p className="truncate text-xs text-slate-500">{config.label}</p>
                </div>
              </Link>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={onMobileClose}
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1" aria-label={config.navLabel}>
              {config.navItems.map((item) => {
                const isActive =
                  item.href === config.baseHref
                    ? pathname === config.baseHref
                    : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors md:px-4 md:py-3 md:text-base',
                      isActive
                        ? 'bg-primary font-medium text-white'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <Icon
                      className="size-[18px] shrink-0"
                      strokeWidth={isActive ? 2.25 : 2}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {config.ctaLabel && CtaIcon ? (
            <div className="border-t border-primary/10 pt-4 md:pt-6">
              {config.ctaHref ? (
                <Button
                  asChild
                  className="h-auto w-full gap-2 py-2.5 text-sm shadow-lg shadow-primary/20 md:py-3 md:text-base"
                >
                  <Link to={config.ctaHref} onClick={onMobileClose}>
                    <CtaIcon className="size-4 shrink-0" />
                    <span className="text-center leading-snug">{config.ctaLabel}</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  className="h-auto w-full gap-2 py-2.5 text-sm shadow-lg shadow-primary/20 md:py-3 md:text-base"
                  onClick={config.ctaOnClick}
                >
                  <CtaIcon className="size-4 shrink-0" />
                  <span className="text-center leading-snug">{config.ctaLabel}</span>
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
