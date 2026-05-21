import type { ReactNode } from 'react'
import { Clock, MapPin, Phone } from 'lucide-react'
import { images } from '@/assets/figma'
import { footerLinks } from './data'

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-surface px-6 pb-10 pt-16 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="space-y-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={images.logo}
              alt=""
              className="size-6 object-contain"
              width={24}
              height={24}
            />
            <span className="text-xl font-black text-foreground">UniNest</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Chuyên trang cung cấp giải pháp nhà ở chất lượng cao cho sinh viên
            và người đi làm tại Thành phố Hồ Chí Minh.
          </p>
          <div className="flex gap-4">
            <SocialLink href="#" label="Facebook">
              <FacebookIcon />
            </SocialLink>
            <SocialLink href="#" label="Instagram">
              <InstagramIcon />
            </SocialLink>
          </div>
        </div>

        <FooterColumn title="Liên kết" links={footerLinks.explore} />
        <FooterColumn title="Thông tin" links={footerLinks.info} />

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Liên hệ
          </h4>
          <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>
                88 Nguyễn Huệ, Quận 1,
                <br />
                TP.HCM
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0 text-primary" />
              1900 6789
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0 text-primary" />
              08:00 - 20:00 (T2 - CN)
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
        <p>© 2024 UniNest Vietnam. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly string[]
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
        {title}
      </h4>
      <ul className="mt-6 space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full bg-border text-muted-foreground transition-colors hover:bg-primary hover:text-white"
    >
      {children}
    </a>
  )
}
