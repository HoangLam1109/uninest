import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bot,
  GraduationCap,
  Home,
  Info,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/constants'
import { Navbar } from '@/features/home/components/navbar'
import { cn } from '@/lib/utils'

const roomStyleOptions = [
  'Yên tĩnh để học',
  'Gần trung tâm sôi động',
  'Có ban công/Cửa sổ lớn',
  'Đầy đủ nội thất',
] as const

const amenityOptions = ['Máy lạnh', 'Máy giặt riêng', 'Kệ bếp', 'Giờ giấc tự do'] as const

const distanceOptions = ['< 1km', '1 - 3km', '3 - 5km', '> 5km'] as const

export function AiRoomFinderPage() {
  const navigate = useNavigate()
  const [distance, setDistance] = useState<(typeof distanceOptions)[number]>('1 - 3km')
  const [roomStyles, setRoomStyles] = useState<Set<string>>(
    () => new Set(['Yên tĩnh để học', 'Có ban công/Cửa sổ lớn']),
  )
  const [amenities, setAmenities] = useState<Set<string>>(
    () => new Set(['Máy lạnh', 'Kệ bếp', 'Giờ giấc tự do']),
  )

  const progress = useMemo(() => {
    const selected = roomStyles.size + amenities.size + (distance ? 1 : 0)
    return Math.min(50 + selected * 6, 92)
  }, [amenities.size, distance, roomStyles.size])

  function toggleOption(value: string, setter: (next: Set<string>) => void, current: Set<string>) {
    const next = new Set(current)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setter(next)
  }

  function handleSubmit() {
    const params = new URLSearchParams({
      ai: 'true',
      distance,
      amenities: Array.from(amenities).join(','),
      roomStyles: Array.from(roomStyles).join(','),
      minPrice: '2000000',
      maxPrice: '4500000',
    })

    navigate(`${paths.rooms}?${params.toString()}`)
  }

  return (
    <div className="min-h-svh bg-[#faf9f7]">
      <Navbar />
      <main className="text-[#0f172a]">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="max-w-4xl pb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm lg:hidden">
            <Bot className="size-4" />
            UniNest AI
          </div>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-normal text-[#0f172a] sm:text-5xl">
            Tìm phòng trọ <span className="text-primary">lý tưởng</span> bằng AI
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#475569] sm:text-lg">
            Chỉ mất 2 phút để thuật toán của UniNest phân tích thói quen và sở
            thích của bạn để kết nối với những người bạn "tâm đầu ý hợp".
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-2xl shadow-black/10">
          <div className="border-b border-primary/10 bg-primary/5 px-6 py-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.06em] text-primary">
                Tiến trình khảo sát
              </p>
              <p className="text-sm font-black text-[#0f172a]">{progress}% Hoàn thành</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[396px_minmax(0,1fr)]">
            <aside className="hidden bg-primary/5 p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
              <img
                src="/ai-student-lifestyle.png"
                alt="Sinh viên đang học tại phòng trọ"
                className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                width={332}
                height={332}
              />
              <div className="pt-6 text-center">
                <h2 className="text-base font-bold text-[#1e293b]">
                  Tại sao chọn ghép đôi AI?
                </h2>
                <p className="mt-2 text-sm leading-5 text-[#64748b]">
                  Giảm thiểu xung đột, tăng cường sự gắn kết và tiết kiệm thời
                  gian tìm kiếm.
                </p>
              </div>
            </aside>

            <div className="flex flex-col gap-10 p-6 sm:p-8 lg:p-12">
              <section className="space-y-6">
                <SectionHeading
                  icon={<WalletCards className="size-5" />}
                  title="Ngân sách & Khoảng cách"
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-[#334155]">
                      Ngân sách hàng tháng (VNĐ)
                    </label>
                    <span className="text-base font-bold text-primary">2.0M - 4.5M</span>
                  </div>
                  <div className="relative h-8">
                    <div className="absolute left-0 right-0 top-3 h-2 rounded-full bg-primary/20" />
                    <div className="absolute left-[20%] right-[30%] top-3 h-2 rounded-full bg-primary" />
                    <span className="absolute left-[20%] top-1 size-5 rounded-full border-4 border-white bg-primary shadow-md" />
                    <span className="absolute left-[66%] top-1 size-5 rounded-full border-4 border-white bg-primary shadow-md" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#94a3b8]">
                    <span>0đ</span>
                    <span>10.000.000đ+</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-[#334155]">
                      Khoảng cách tới trường tối đa
                    </label>
                    <Info className="size-3 text-[#94a3b8]" aria-hidden />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {distanceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDistance(option)}
                        className={cn(
                          'h-10 rounded-lg border px-3 text-sm transition-colors',
                          option === distance
                            ? 'border-primary bg-primary font-bold text-white shadow-lg shadow-primary/20'
                            : 'border-primary/20 bg-white text-[#0f172a] hover:bg-primary/5',
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="h-px bg-[#e2e8f0]" />

              <section className="space-y-6">
                <SectionHeading icon={<Home className="size-5" />} title="Tiện ích phòng ở" />
                <div className="grid gap-6 md:grid-cols-2">
                  <ChoiceGroup
                    title="Bạn muốn một căn phòng như thế nào?"
                    options={roomStyleOptions}
                    selected={roomStyles}
                    onToggle={(value) => toggleOption(value, setRoomStyles, roomStyles)}
                  />
                  <ChoiceGroup
                    title="Tiện ích phòng bắt buộc?"
                    options={amenityOptions}
                    selected={amenities}
                    onToggle={(value) => toggleOption(value, setAmenities, amenities)}
                  />
                </div>
              </section>

              <div className="space-y-4 pt-2">
                <Button
                  type="button"
                  size="lg"
                  className="h-14 w-full rounded-xl text-lg font-black shadow-2xl shadow-primary/30"
                  onClick={handleSubmit}
                >
                  <Sparkles className="size-5" />
                  Tìm phòng cho tôi
                </Button>
                <p className="text-center text-xs text-[#94a3b8]">
                  * Thông tin của bạn được bảo mật tuyệt đối bởi UniNest AI
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full gap-5 px-2 pt-12 text-[#475569]/70 sm:grid-cols-3 lg:px-16">
          <TrustBadge icon={<ShieldCheck className="size-5" />} text="10,000+ Ghép đôi thành công" />
          <TrustBadge icon={<GraduationCap className="size-5" />} text="Đối tác 50+ Trường Đại học" />
          <TrustBadge icon={<Star className="size-5" />} text="Đánh giá 4.9/5 sao" />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-primary/10 pt-8 text-sm text-[#64748b]">
          <Link to="#" className="hover:text-primary">
            Điều khoản
          </Link>
          <Link to="#" className="hover:text-primary">
            Bảo mật
          </Link>
          <Link to="#" className="hover:text-primary">
            Liên hệ
          </Link>
          <span className="basis-full text-center">
            © 2024 UniNest Vietnam. Thiết kế cho cộng đồng sinh viên.
          </span>
        </div>
        </section>
      </main>
    </div>
  )
}

function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h2 className="text-xl font-bold text-[#0f172a]">{title}</h2>
    </div>
  )
}

function ChoiceGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: readonly string[]
  selected: Set<string>
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold leading-5 text-[#334155]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.has(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-[#e2e8f0] bg-white text-[#0f172a] hover:border-primary/40',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TrustBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-center text-base font-bold">
      <span className="text-primary">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
