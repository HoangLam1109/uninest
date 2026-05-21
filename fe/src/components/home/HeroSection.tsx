import type { ReactNode } from 'react'
import { MapPin, Search, Wallet, DoorOpen } from 'lucide-react'
import { images } from '@/assets/figma'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { budgetOptions, roomTypeOptions } from './data'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden px-4 py-20 lg:min-h-[650px]">
      <img
        src={images.hero}
        alt=""
        width={2400}
        height={1600}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#2d241a]/50 to-[#2d241a]/30"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="font-sans text-4xl font-bold leading-tight tracking-normal text-white drop-shadow-sm sm:text-5xl lg:text-7xl lg:leading-[1.1]">
            Tìm kiếm không gian sống{' '}
            <span className="text-primary">lý tưởng</span> tại TP.HCM
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/90 lg:text-xl">
            Hệ thống căn hộ dịch vụ và phòng trọ chất lượng cao dành riêng cho
            sinh viên và người đi làm hiện đại.
          </p>
        </div>

        <div className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <SearchField
              icon={<MapPin className="size-4 text-primary" />}
              label="Vị trí"
            >
              <input
                type="text"
                placeholder="Quận 1, Quận 7, Bình Thạnh..."
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </SearchField>

            <SearchField
              icon={<Wallet className="size-4 text-primary" />}
              label="Ngân sách"
              bordered
            >
              <Select defaultValue="under-5">
                <SelectTrigger className="h-auto py-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SearchField>

            <SearchField
              icon={<DoorOpen className="size-4 text-primary" />}
              label="Loại phòng"
            >
              <Select defaultValue="studio">
                <SelectTrigger className="h-auto py-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SearchField>

            <Button size="lg" className="w-full shrink-0 lg:w-auto">
              <Search className="size-[18px]" />
              Tìm ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SearchField({
  icon,
  label,
  children,
  bordered = true,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
  bordered?: boolean
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-3 px-4 py-2 ${
        bordered ? 'lg:border-r lg:border-border' : ''
      }`}
    >
      <div className="shrink-0 pt-1">{icon}</div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}
