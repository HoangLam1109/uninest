import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { Link, NavLink } from 'react-router-dom'
import gsap from 'gsap'
import { toast } from 'sonner'
import { images } from '@/assets/images'
import { paths } from '@/config/constants'
import { Button } from '@/components/ui/button'
import { USER_ROLES } from '@/constants/roles'
import { navLinks } from '@/features/home/data'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { NavbarUserMenu } from './navbar-user-menu'

export function Navbar() {
  const { user, isLoggedIn } = useAuth()
  const navbarRef = useRef<HTMLElement>(null)
  const canCreateRoom = user?.role === USER_ROLES.LANDLORD

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
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10 xl:px-20"
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
          className="hidden flex-1 items-center justify-center gap-10 md:flex"
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

        <div className="flex shrink-0 items-center gap-3" data-navbar-actions>
          <Button variant="outline" size="default" asChild>
            <Link
              to={paths.createRoom}
              onClick={handleCreateRoomClick}
              aria-disabled={!canCreateRoom}
              className={cn(
                !canCreateRoom && 'cursor-not-allowed opacity-60 hover:bg-transparent',
              )}
            >
              Đăng tin
            </Link>
          </Button>
          {isLoggedIn && user ? (
            <NavbarUserMenu user={user} />
          ) : (
            <>
              <Button
                variant="outline"
                size="default"
                className="hidden sm:inline-flex"
                asChild
              >
                <Link to={paths.login}>Đăng nhập</Link>
              </Button>
              <Button size="default" asChild>
                <Link to={paths.register}>Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
