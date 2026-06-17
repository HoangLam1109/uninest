import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  GraduationCap,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAiRoomSearch } from '@/features/ai/hooks/use-ai-room-search'
import type {
  AiRoomMatch,
  AiRoomSearchResult,
  AiRoomSuggestion,
} from '@/features/ai/types/ai.type'
import { Navbar } from '@/features/home/components/navbar'
import {
  formatRoomCurrency,
  formatRoomFullLocation,
  getRoomAmenityNames,
} from '@/utils/room-display'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
  result?: AiRoomSearchResult
}

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Chào bạn, hãy mô tả phòng bạn muốn tìm. Ví dụ: phòng dưới 4 triệu, gần Đại học Bách Khoa, yên tĩnh, có máy lạnh và chỗ để xe.',
  },
]

function parseBudgetRange(value: string) {
  const normalized = value.toLowerCase()
  const hasMillionUnit = /tr|triệu|m/.test(normalized)
  const numbers =
    normalized.match(/\d+(?:[.,]\d+)*/g)?.map((token) => {
      const parts = token.split(/[.,]/)
      const isDecimalMillion =
        parts.length === 2 && parts[1].length <= 2 && Number(parts[0]) < 1000
      const numberValue = isDecimalMillion
        ? Number(token.replace(',', '.'))
        : Number(token.replace(/[.,]/g, ''))

      if (!Number.isFinite(numberValue)) return undefined
      if (numberValue < 1000 && (hasMillionUnit || numbersShouldBeMillions(normalized))) {
        return Math.round(numberValue * 1_000_000)
      }
      return Math.round(numberValue)
    }) ?? []

  const validNumbers = numbers.filter((number): number is number => typeof number === 'number')
  if (validNumbers.length === 0) return {}

  return {
    minPrice: Math.min(...validNumbers),
    maxPrice: validNumbers.length > 1 ? Math.max(...validNumbers) : undefined,
  }
}

function numbersShouldBeMillions(value: string) {
  return !/\d{6,}/.test(value.replace(/[.,\s]/g, ''))
}

function createMessageId(role: ChatMessage['role']) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function AiRoomFinderPage() {
  const aiRoomSearch = useAiRoomSearch()
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const question = draft.trim()
    if (!question || aiRoomSearch.isPending) return

    const { minPrice, maxPrice } = parseBudgetRange(question)
    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: question,
    }

    setMessages((current) => [...current, userMessage])
    setDraft('')

    try {
      const result = await aiRoomSearch.mutateAsync({
        question,
        filters: {
          minPrice,
          maxPrice,
          limit: 5,
        },
      })

      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: result.answer,
          result,
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: 'AI chưa thể xử lý yêu cầu này. Bạn thử nhập lại rõ hơn về khu vực, ngân sách hoặc tiện ích nhé.',
        },
      ])
    }
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
              Chat với AI để tìm <span className="text-primary">phòng trọ phù hợp</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#475569] sm:text-lg">
              Nhập nhu cầu của bạn bằng ngôn ngữ tự nhiên, UniNest AI sẽ phân tích và gợi ý phòng
              đang còn trống trong hệ thống.
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-2xl shadow-black/10">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="hidden bg-primary/5 p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
                <img
                  src="/ai-student-lifestyle.png"
                  alt="Sinh viên đang học tại phòng trọ"
                  className="aspect-square w-full rounded-2xl object-cover shadow-lg"
                  width={304}
                  height={304}
                />
                <div className="pt-6 text-center">
                  <h2 className="text-base font-bold text-[#1e293b]">
                    Tìm phòng bằng hội thoại
                  </h2>
                  <p className="mt-2 text-sm leading-5 text-[#64748b]">
                    Bạn có thể hỏi theo ngân sách, khu vực, tiện ích, khoảng cách tới trường hoặc
                    phong cách sống mong muốn.
                  </p>
                </div>
              </aside>

              <section className="flex min-h-[620px] flex-col bg-white">
                <div className="border-b border-primary/10 bg-primary/5 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                      <Bot className="size-5" />
                    </span>
                    <div>
                      <p className="text-base font-black text-[#0f172a]">UniNest AI</p>
                      <p className="text-sm text-[#64748b]">Trợ lý tìm phòng theo nhu cầu của bạn</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}

                  {aiRoomSearch.isPending ? (
                    <div className="flex items-start gap-3">
                      <Avatar speaker="assistant" />
                      <div className="rounded-2xl rounded-tl-sm bg-primary/5 px-4 py-3 text-sm text-[#475569]">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          AI đang tìm phòng phù hợp...
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <form className="border-t border-primary/10 bg-white p-4 sm:p-6" onSubmit={handleSubmit}>
                  <div className="flex items-end gap-3 rounded-2xl border border-primary/15 bg-[#faf9f7] p-3 focus-within:ring-2 focus-within:ring-ring">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      placeholder="Ví dụ: Mình cần phòng dưới 4 triệu, gần Quận 10, yên tĩnh, có máy lạnh..."
                      className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                      rows={1}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="size-11 shrink-0"
                      disabled={!draft.trim() || aiRoomSearch.isPending}
                      aria-label="Gửi tin nhắn"
                    >
                      {aiRoomSearch.isPending ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Send className="size-5" />
                      )}
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          </div>

          <div className="grid w-full gap-5 px-2 pt-12 text-[#475569]/70 sm:grid-cols-3 lg:px-16">
            <TrustBadge icon={<ShieldCheck className="size-5" />} text="10,000+ Gợi ý thành công" />
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

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser ? <Avatar speaker="assistant" /> : null}
      <div className={`max-w-[min(100%,680px)] ${isUser ? 'order-1' : ''}`}>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-6 text-white shadow-md shadow-primary/20'
              : 'rounded-2xl rounded-tl-sm bg-primary/5 px-4 py-3 text-sm leading-6 text-[#334155]'
          }
        >
          {message.content}
        </div>
        {message.result ? <AiSearchResult result={message.result} /> : null}
      </div>
      {isUser ? <Avatar speaker="user" /> : null}
    </div>
  )
}

function Avatar({ speaker }: { speaker: ChatMessage['role'] }) {
  return (
    <span
      className={
        speaker === 'assistant'
          ? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white'
          : 'flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[#334155]'
      }
    >
      {speaker === 'assistant' ? <Sparkles className="size-4" /> : <UserRound className="size-4" />}
    </span>
  )
}

function AiSearchResult({ result }: { result: AiRoomSearchResult }) {
  const suggestions = mergeSuggestionsWithMatches(result.rooms, result.matches)

  return (
    <section className="mt-3 space-y-3">
      {suggestions.length > 0 ? (
        <div className="grid gap-3">
          {suggestions.map((room) => (
            <AiRoomResultCard key={room.roomId} room={room} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-primary/10 bg-white p-4 text-sm text-[#64748b]">
          AI chưa tìm thấy phòng phù hợp. Hãy nhập thêm khu vực, ngân sách hoặc tiện ích bắt buộc.
        </div>
      )}

      {result.missingInfo.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-bold">Thông tin AI cần thêm</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.missingInfo.map((info) => (
              <li key={info}>{info}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

type DisplayRoomSuggestion = AiRoomSuggestion & {
  address?: string
  district?: string
  city?: string
  ward?: string
  amenityIds?: AiRoomMatch['amenityIds']
  amenities?: string[]
  ratingAvg?: number
  reviewCount?: number
}

function mergeSuggestionsWithMatches(
  rooms: AiRoomSuggestion[],
  matches: AiRoomMatch[],
): DisplayRoomSuggestion[] {
  const matchSuggestions = matches.map((room) => ({
    roomId: room._id,
    title: room.title,
    pricePerMonth: room.pricePerMonth,
    reasons: room.description ? [room.description] : ['Phù hợp với tiêu chí bạn đã nhập'],
    address: room.address,
    district: room.district,
    city: room.city,
    ward: room.ward,
    amenityIds: room.amenityIds,
    amenities: room.amenities,
    ratingAvg: room.ratingAvg,
    reviewCount: room.reviewCount,
  }))

  if (rooms.length > 0) {
    const aiSuggestions = rooms.map((room) => {
      const match = matches.find((item) => item._id === room.roomId)
      return {
        ...room,
        address: match?.address,
        district: match?.district,
        city: match?.city,
        ward: match?.ward,
        amenityIds: match?.amenityIds,
        amenities: match?.amenities,
        ratingAvg: match?.ratingAvg,
        reviewCount: match?.reviewCount,
      }
    })

    const aiRoomIds = new Set(aiSuggestions.map((room) => room.roomId))
    return [
      ...aiSuggestions,
      ...matchSuggestions.filter((room) => !aiRoomIds.has(room.roomId)),
    ]
  }

  return matchSuggestions
}

function AiRoomResultCard({ room }: { room: DisplayRoomSuggestion }) {
  const amenityNames = getRoomAmenityNames(room)

  return (
    <article className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-black text-[#0f172a]">{room.title}</h3>
          <p className="mt-1 text-sm font-bold text-primary">
            {formatRoomCurrency(room.pricePerMonth)}/tháng
          </p>
          {room.address ? (
            <p className="mt-2 text-sm leading-5 text-[#64748b]">
              {formatRoomFullLocation({
                address: room.address,
                ward: room.ward,
                district: room.district,
                city: room.city,
              })}
            </p>
          ) : null}
          {room.ratingAvg ? (
            <p className="mt-2 text-xs font-semibold text-[#64748b]">
              {room.ratingAvg.toFixed(1)}/5 sao
              {room.reviewCount ? ` · ${room.reviewCount} đánh giá` : ''}
            </p>
          ) : null}
          {amenityNames.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {amenityNames.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                >
                  {amenity}
                </span>
              ))}
              {amenityNames.length > 4 ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#64748b]">
                  +{amenityNames.length - 4}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link to={`/phong/${room.roomId}`}>
            Xem phòng
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {room.reasons.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-5 text-[#334155]">
          {room.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </article>
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
