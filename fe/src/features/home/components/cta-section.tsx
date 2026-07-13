import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paths } from '@/config/constants'
import { useNavigate } from 'react-router-dom'
import { mobileDownloadUrl } from '../data'
import { useGsapReveal } from '../hooks/use-gsap-reveal'

export function CtaSection() {
  const sectionRef = useGsapReveal<HTMLElement>()
  const navigate = useNavigate()

  return (
    <section ref={sectionRef} className="bg-surface px-6 py-16 lg:px-20 lg:py-20">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-white lg:px-24 lg:py-14"
        data-gsap-reveal
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.2),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-10 space-y-6">
          <h2 className="font-sans text-3xl font-bold tracking-normal lg:text-4xl">
            Bạn đã sẵn sàng để chuyển đến nhà mới?
          </h2>
          <p className="mx-auto max-w-xl text-base font-medium text-white/90">
            Đăng ký ngay để nhận thông báo về những căn phòng mới nhất và ưu đãi đặc
            quyền cho cư dân UniNest.
          </p>
          <form
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(paths.register)
            }}
          >
            <Input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="h-14 flex-1"
              aria-label="Email"
            />
            <Button type="submit" variant="dark" size="lg" className="shrink-0">
              Đăng ký ngay
            </Button>
          </form>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/80">
              Hoặc tải phiên bản mobile để trải nghiệm UniNest ngay trên điện thoại.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <a href={mobileDownloadUrl} target="_blank" rel="noopener noreferrer">
                Tải ứng dụng mobile
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
