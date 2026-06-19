import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { images } from '@/assets/images'

type DashboardMobileHeaderProps = {
  href: string
  onOpenMenu: () => void
}

export function DashboardMobileHeader({
  href,
  onOpenMenu,
}: DashboardMobileHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-primary/10 bg-white px-4 md:h-16 md:px-6 lg:hidden">
      <Link to={href} className="flex items-center gap-2.5">
        <img
          src={images.logo}
          alt=""
          className="size-8 object-contain"
          width={32}
          height={32}
        />
        <span className="text-lg font-bold text-primary">UniNest</span>
      </Link>
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex size-10 items-center justify-center rounded-xl border border-primary/10 text-slate-700 transition-colors hover:bg-slate-50"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="size-5" />
      </button>
    </header>
  )
}
