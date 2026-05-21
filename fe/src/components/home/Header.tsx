import { images } from '@/assets/figma'
import { Button } from '@/components/ui/button'
import { navLinks } from './data'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10 xl:px-20">
        <a href="#" className="flex shrink-0 items-center gap-3">
          <img
            src={images.logo}
            alt=""
            className="size-10 object-contain"
            width={40}
            height={40}
          />
          <span className="font-sans text-2xl font-black uppercase tracking-tight text-foreground">
            UniNest
          </span>
        </a>

        <nav
          className="hidden flex-1 items-center justify-center gap-10 md:flex"
          aria-label="Chính"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Button variant="outline" size="default" className="hidden sm:inline-flex">
            Đăng nhập
          </Button>
          <Button size="default">Đăng ký</Button>
        </div>
      </div>
    </header>
  )
}
