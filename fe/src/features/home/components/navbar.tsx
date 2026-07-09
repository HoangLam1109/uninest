import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { Menu } from 'lucide-react'
import gsap from 'gsap'
import { Link, NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { images } from '@/assets/images'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/constants'
import { USER_ROLES } from '@/constants/roles'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { navLinks } from '@/features/home/data'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { NavbarUserMenu } from './navbar-user-menu'

export function Navbar() {
  const { user, isLoggedIn, dashboardLabel, dashboardPath } = useAuth()
  const logout = useLogout()
  const navbarRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const canCreateRoom = user?.role === USER_ROLES.LANDLORD
  const showDashboardLink = Boolean(
    isLoggedIn && dashboardLabel && dashboardPath !== paths.home,
  )

  useLayoutEffect(() => {
    const navbar = navbarRef.current
    if (!navbar) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-navbar-animate]', { clearProps: 'all' })
      })

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

        timeline
          .fromTo(
            '[data-navbar-brand]',
            { autoAlpha: 0, x: -16 },
            { autoAlpha: 1, x: 0, duration: 0.55 },
          )
          .fromTo(
            '[data-navbar-nav] > *',
            { autoAlpha: 0, y: -10 },
            { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 },
            '-=0.15',
          )
          .fromTo(
            '[data-navbar-actions] > *',
            { autoAlpha: 0, x: 12 },
            { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.08 },
            '-=0.25',
          )
      })

      return () => media.revert()
    }, navbar)

    return () => context.revert()
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobileMenuOpen])

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
  }

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (href !== paths.ai || user?.role === USER_ROLES.TENANT) return

    event.preventDefault()
    toast.info('Vui lòng nâng cấp gói Tenant để sử dụng tính năng AI tìm phòng')
  }

  function handleCreateRoomClick(event: MouseEvent<HTMLAnchorElement>) {
    if (canCreateRoom) return

    event.preventDefault()

    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập bằng tài khoản chủ nhà để đăng tin.')
      return
    }

    toast.info('Chỉ tài khoản chủ nhà mới có thể đăng tin.')
  }

  return (
    <header
      ref={navbarRef}
      className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md"
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:px-10 xl:px-20"
        data-navbar-animate
      >
        <Link
          to={paths.home}
          className="flex shrink-0 items-center gap-3"
          data-navbar-brand
        >
          <img
            src={images.logo}
            alt="UniNest"
            className="size-10 object-contain"
            width={40}
            height={40}
          />
          <span className="font-sans text-2xl font-black uppercase tracking-tight text-foreground">
            UniNest
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-10"
          aria-label="Chính"
          data-navbar-nav
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className={({ isActive }) =>
                cn(
                  'border-b-2 pb-1 text-sm font-semibold transition-colors hover:text-primary',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div
          className="flex items-center justify-end gap-3 lg:shrink-0"
          data-navbar-actions
        >
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex size-10 items-center justify-center rounded-xl border border-primary/15 text-primary transition-colors hover:bg-primary/10"
              aria-expanded={isMobileMenuOpen}
              aria-haspopup="menu"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="size-5" />
            </button>

            {isMobileMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 flex w-[min(18rem,calc(100vw-3rem))] flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-xl"
              >
                <div className="flex flex-col gap-1 border-b border-border pb-3">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.href}
                      onClick={(event) => {
                        closeMobileMenu()
                        handleNavClick(event, link.href)
                      }}
                      className={({ isActive }) =>
                        cn(
                          'rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                {isLoggedIn && user ? (
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl bg-surface px-3 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    {showDashboardLink ? (
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full"
                        asChild
                      >
                        <Link to={dashboardPath} onClick={closeMobileMenu}>
                          {dashboardLabel}
                        </Link>
                      </Button>
                    ) : null}

                    <Button
                      variant="outline"
                      size="default"
                      className="w-full"
                      asChild
                    >
                      <Link
                        to={paths.createRoom}
                        onClick={(event) => {
                          closeMobileMenu()
                          handleCreateRoomClick(event)
                        }}
                        aria-disabled={!canCreateRoom}
                        className={cn(
                          !canCreateRoom &&
                            'cursor-not-allowed opacity-60 hover:bg-transparent',
                        )}
                      >
                        Đăng tin
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="default"
                      className="w-full"
                      disabled={logout.isPending}
                      onClick={() => {
                        closeMobileMenu()
                        logout.mutate()
                      }}
                    >
                      {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full"
                      asChild
                    >
                      <Link
                        to={paths.createRoom}
                        onClick={(event) => {
                          closeMobileMenu()
                          handleCreateRoomClick(event)
                        }}
                        aria-disabled={!canCreateRoom}
                        className={cn(
                          !canCreateRoom &&
                            'cursor-not-allowed opacity-60 hover:bg-transparent',
                        )}
                      >
                        Đăng tin
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full"
                      asChild
                    >
                      <Link to={paths.login} onClick={closeMobileMenu}>
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button size="default" className="w-full" asChild>
                      <Link to={paths.register} onClick={closeMobileMenu}>
                        Đăng ký
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {isLoggedIn && user ? (
            <div className="hidden items-center gap-3 lg:flex">
              <Button
                variant="outline"
                size="default"
                className="min-w-0 px-4"
                asChild
              >
                <Link
                  to={paths.createRoom}
                  onClick={handleCreateRoomClick}
                  aria-disabled={!canCreateRoom}
                  className={cn(
                    !canCreateRoom &&
                      'cursor-not-allowed opacity-60 hover:bg-transparent',
                  )}
                >
                  Đăng tin
                </Link>
              </Button>
              <NavbarUserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Button
                variant="outline"
                size="default"
                className="min-w-0 px-4"
                asChild
              >
                <Link
                  to={paths.createRoom}
                  onClick={handleCreateRoomClick}
                  aria-disabled={!canCreateRoom}
                  className={cn(
                    !canCreateRoom &&
                      'cursor-not-allowed opacity-60 hover:bg-transparent',
                  )}
                >
                  Đăng tin
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="min-w-0 px-4"
                asChild
              >
                <Link to={paths.login}>Đăng nhập</Link>
              </Button>
              <Button size="default" className="min-w-0 px-4" asChild>
                <Link to={paths.register}>Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
