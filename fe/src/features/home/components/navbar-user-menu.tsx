import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { paths } from '@/config/constants'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { useAuth } from '@/hooks/use-auth'
import type { AuthUser } from '@/types/auth'

type NavbarUserMenuProps = {
  user: AuthUser
}

export function NavbarUserMenu({ user }: NavbarUserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const logout = useLogout()
  const { dashboardPath, dashboardLabel } = useAuth()
  const showDashboardLink =
    dashboardLabel && dashboardPath !== paths.home

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full ring-offset-2 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Tài khoản ${user.fullName}`}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          {showDashboardLink ? (
            <Link
              to={dashboardPath}
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {dashboardLabel}
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface"
            disabled={logout.isPending}
            onClick={() => {
              setOpen(false)
              logout.mutate()
            }}
          >
            {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
