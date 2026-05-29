import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CtaSection() {
  return (
    <section className="bg-surface px-6 py-16 lg:px-20 lg:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-white lg:px-24 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.2),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-10 space-y-6">
          <h2 className="font-sans text-3xl font-bold tracking-normal lg:text-4xl">
            Bạn đã sẵn sàng để chuyển đến nhà mới?
          </h2>
          <p className="mx-auto max-w-xl text-base font-medium text-white/90">
            Đăng ký ngay để nhận thông báo về những căn phòng mới nhất và ưu đãi
            đặc quyền cho cư dân UniNest.
          </p>
          <form
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch"
            onSubmit={(e) => e.preventDefault()}
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
        </div>
      </div>
    </section>
  )
}
