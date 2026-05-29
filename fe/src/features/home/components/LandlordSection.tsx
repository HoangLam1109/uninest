import { ArrowRight, Check } from 'lucide-react'
import { images } from '@/assets/images'
import { Button } from '@/components/ui/button'
import { landlordBenefits } from '../data'

export function LandlordSection() {
  return (
    <section id="landlords" className="bg-white px-6 py-16 lg:px-20 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div
            className="absolute -left-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={images.landlord}
              alt="Chủ nhà làm việc với laptop"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-xl bg-primary px-6 py-5 text-white shadow-xl sm:-right-6">
            <p className="font-sans text-3xl font-bold leading-none">500+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest">
              Chủ nhà tin tưởng
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
            Hợp tác cùng chúng tôi
          </p>
          <h2 className="font-sans text-3xl font-bold leading-tight tracking-normal text-foreground lg:text-4xl">
            Dành cho chủ nhà &amp; nhà đầu tư
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Bạn đang sở hữu bất động sản tại TP.HCM nhưng gặp khó khăn trong
            việc quản lý hoặc tìm kiếm khách thuê chất lượng? UniNest mang đến
            giải pháp vận hành chuyên nghiệp giúp tối ưu hóa doanh thu của bạn.
          </p>
          <ul className="space-y-4">
            {landlordBenefits.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-3.5 text-primary" strokeWidth={3} />
                </span>
                <span className="font-medium text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button size="lg">
            Tìm hiểu thêm về quản lý
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
