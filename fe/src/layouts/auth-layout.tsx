import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { images } from '@/assets/images'
import { paths } from '@/config/constants'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCurrentYear(new Date().getFullYear())
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={images.authPanel}
          alt=""
          width={1600}
          height={1200}
          decoding="async"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2d241a]/55 via-[#2d241a]/40 to-primary/25"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to={paths.home} className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
              <img
                src={images.logo}
                alt="UniNest"
                className="size-full object-contain"
                width={40}
                height={40}
              />
            </span>
            <span className="font-sans text-2xl font-black uppercase tracking-tight">
              UniNest
            </span>
          </Link>
          <div className="max-w-md space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
              Nền tảng cho thuê TP.HCM
            </p>
            <p className="font-sans text-3xl font-bold leading-tight tracking-normal">
              Tìm phòng trọ và quản lý cho thuê — tất cả trong một nơi.
            </p>
          </div>
          <p className="text-sm text-white/60">
            © {currentYear} UniNest. Bảo mật thông tin của bạn.
          </p>
        </div>
      </aside>

      <main className="flex flex-col bg-surface px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <Link to={paths.home} className="flex items-center gap-2.5">
            <img
              src={images.logo}
              alt="UniNest"
              className="size-10 shrink-0 object-contain"
              width={40}
              height={40}
            />
            <span className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
              UniNest
            </span>
          </Link>
          <Link
            to={paths.home}
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="mb-8 space-y-2">
            <h1 className="font-sans text-3xl font-bold tracking-normal text-foreground">
              {title}
            </h1>
            <p className="text-base text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  )
}
