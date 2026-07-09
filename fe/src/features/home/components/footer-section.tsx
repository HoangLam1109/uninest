import type { ReactNode } from 'react'
import { Clock, MapPin, Phone } from 'lucide-react'
import { images } from '@/assets/images'
import { footerLinks } from '../data'

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
            <SocialLink
              href="https://www.facebook.com/profile.php?id=61590374986361"
              label="Facebook"
            >
              <FacebookIcon />
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
                S107, Vinhomes Grand Park, Thành phố Thủ Đức, Thành phố Hồ Chí Minh
                <br />
                TP.HCM
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0 text-primary" />
              0834110905
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0 text-primary" />
              08:00 - 20:00 (T2 - CN)
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
        <p>© 2026 UniNest Vietnam. Tất cả quyền được bảo lưu.</p>
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
      target="_blank"
      rel="noreferrer"
      className="flex size-8 items-center justify-center rounded-full bg-border text-muted-foreground transition-colors hover:bg-primary hover:text-white"
    >
      {children}
    </a>
  )
}
