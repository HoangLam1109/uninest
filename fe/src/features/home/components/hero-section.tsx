import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { DoorOpen, MapPin, Search, Wallet } from 'lucide-react'
import { images } from '@/assets/images'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/constants'
import { UpgradePackageButton } from '@/features/payment'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { budgetOptions, roomTypeOptions } from '../data'

const budgetRanges = {
  'under-5': { maxPrice: 5_000_000 },
  '5-8': { minPrice: 5_000_000, maxPrice: 8_000_000 },
  '8-12': { minPrice: 8_000_000, maxPrice: 12_000_000 },
  'over-12': { minPrice: 12_000_000 },
} as const

const roomTypeValues = {
  studio: 'STUDIO',
  apartment: 'APARTMENT',
  shared: 'SHARED',
  single: 'SINGLE',
} as const

export function HeroSection() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)
  const [keyword, setKeyword] = useState('')
  const [budget, setBudget] = useState<keyof typeof budgetRanges>('under-5')
  const [roomType, setRoomType] = useState<keyof typeof roomTypeValues>('studio')

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-hero-animate]', { clearProps: 'all' })
      })

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

        timeline
          .fromTo(
            '[data-hero-image]',
            { scale: 1.08 },
            { scale: 1, duration: 1.6, ease: 'power2.out' },
          )
          .fromTo(
            '[data-hero-animate]',
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.14 },
            '-=1.1',
          )
      })

      return () => media.revert()
    }, section)

    return () => context.revert()
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()
    const trimmedKeyword = keyword.trim()
    const priceRange = budgetRanges[budget]

    if (trimmedKeyword) params.set('q', trimmedKeyword)
    if ('minPrice' in priceRange) {
      params.set('minPrice', String(priceRange.minPrice))
    }
    if ('maxPrice' in priceRange) {
      params.set('maxPrice', String(priceRange.maxPrice))
    }
    params.set('roomType', roomTypeValues[roomType])

    navigate(`${paths.rooms}?${params.toString()}`)
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[520px] items-center justify-center overflow-hidden px-4 py-20 lg:min-h-[650px]"
    >
      <img
        src={images.hero}
        alt=""
        width={2400}
        height={1600}
        decoding="async"
        fetchPriority="high"
        data-hero-image
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#2d241a]/50 to-[#2d241a]/30"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center">
        <div className="space-y-4" data-hero-animate>
          <h1 className="font-sans text-4xl font-bold leading-tight tracking-normal text-white drop-shadow-sm sm:text-5xl lg:text-7xl lg:leading-[1.1]">
            Tìm kiếm không gian sống{' '}
            <span className="text-primary">lí tưởng</span> tại TP.HCM
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/90 lg:text-xl">
            Hệ thống căn hộ dịch vụ và phòng trọ chất lượng cao dành riêng cho
            sinh viên và người đi làm hiện đại.
          </p>
        </div>

        <form
          data-hero-animate
          className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl"
          onSubmit={handleSearch}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <SearchField
              icon={<MapPin className="size-4 text-primary" />}
              label="Vi tri"
            >
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Quan 1, Quan 7, Binh Thanh..."
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </SearchField>

            <SearchField
              icon={<Wallet className="size-4 text-primary" />}
              label="Ngân sách"
              bordered
            >
              <Select
                value={budget}
                onValueChange={(value) => setBudget(value as keyof typeof budgetRanges)}
              >
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
              <Select
                value={roomType}
                onValueChange={(value) => setRoomType(value as keyof typeof roomTypeValues)}
              >
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

            <Button type="submit" size="lg" className="w-full shrink-0 lg:w-auto">
              <Search className="size-[18px]" />
              Tìm ngay
            </Button>
          </div>
        </form>

        <div data-hero-animate>
          <UpgradePackageButton />
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
