import { useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Circle,
  Home,
  MessageCircle,
  Search,
  Send,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { USER_ROLES } from '@/constants/roles'
import { LandlordDashboardHeader } from '@/features/landlord'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { formatRoomCurrency, formatRoomFullLocation } from '@/utils/room-display'
import {
  chatKeys,
  useChatSocket,
  useGetChatConversations,
  useGetChatMessages,
  useMarkConversationAsRead,
  useSendChatMessage,
} from '../hooks/use-chat'
import type { ChatConversation, ChatMessage } from '../types/chat.type'

function getUserId(value: { _id?: string; id?: string } | null | undefined) {
  return value?._id ?? value?.id ?? ''
}

function getParticipantName(conversation: ChatConversation, currentUserId: string) {
  const landlordId = getUserId(conversation.landlordId)
  const user =
    landlordId === currentUserId ? conversation.tenantId : conversation.landlordId
  return user?.fullName || user?.email || 'Người dùng UniNest'
}

function getParticipant(conversation: ChatConversation, currentUserId: string) {
  const landlordId = getUserId(conversation.landlordId)
  return landlordId === currentUserId ? conversation.tenantId : conversation.landlordId
}

function getParticipantAvatarUrl(conversation: ChatConversation, currentUserId: string) {
  const participant = getParticipant(conversation, currentUserId)
  return participant?.avatarUrl
}

const messageTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
})

const conversationDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
})

function formatMessageTime(value?: string) {
  if (!value) return ''
  return messageTimeFormatter.format(new Date(value))
}

function formatConversationTime(value?: string) {
  if (!value) return 'Mới tạo'
  const date = new Date(value)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) return formatMessageTime(value)

  return conversationDateFormatter.format(date)
}

function ChatConversationRow({
  conversation,
  currentUserId,
  selected,
  onSelect,
}: {
  conversation: ChatConversation
  currentUserId: string
  selected: boolean
  onSelect: () => void
}) {
  const name = getParticipantName(conversation, currentUserId)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] gap-3 rounded-lg p-3 text-left transition',
        selected ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-slate-50',
      )}
    >
      <Avatar
        name={name}
        src={getParticipantAvatarUrl(conversation, currentUserId)}
        className={cn(selected ? 'bg-white text-primary' : 'bg-primary/10 text-primary')}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{name}</span>
        <span
          className={cn(
            'mt-1 block truncate text-xs',
            selected ? 'text-white/80' : 'text-slate-500',
          )}
        >
          {conversation.lastMessage || conversation.roomId?.title}
        </span>
      </span>
      <span
        className={cn('pt-0.5 text-[11px]', selected ? 'text-white/75' : 'text-slate-400')}
      >
        {formatConversationTime(conversation.lastMessageAt ?? conversation.updatedAt)}
      </span>
    </button>
  )
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: ChatMessage
  currentUserId: string
}) {
  const isMine = getUserId(message.senderId) === currentUserId

  return (
    <div className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine ? (
        <Avatar
          name={message.senderId.fullName || message.senderId.email || 'UniNest'}
          src={message.senderId.avatarUrl}
          className="mt-1 size-8 bg-primary/10 text-xs text-primary"
        />
      ) : null}
      <div
        className={cn(
          'max-w-[88%] rounded-lg px-3 py-2.5 shadow-sm sm:max-w-[80%] sm:px-4 sm:py-3 xl:max-w-[42rem]',
          isMine
            ? 'bg-primary text-white shadow-primary/15'
            : 'border border-primary/10 bg-white text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-right text-[11px]',
            isMine ? 'text-white/75' : 'text-slate-400',
          )}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}

export function ChatWorkspace() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const currentUserId = user?.id ?? ''
  const conversationsQuery = useGetChatConversations()
  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  )
  const selectedConversationId = searchParams.get('conversationId')
  const selectedConversation =
    conversations.find((conversation) => conversation._id === selectedConversationId) ?? null
  const messagesQuery = useGetChatMessages(selectedConversationId)
  const sendMessageMutation = useSendChatMessage(selectedConversationId)
  const { mutate: markConversationAsRead } =
    useMarkConversationAsRead(selectedConversationId)
  const chatSocket = useChatSocket(selectedConversationId)

  const filteredConversations = useMemo(() => {
    const normalizedKeyword = deferredKeyword.trim().toLowerCase()
    if (!normalizedKeyword) return conversations

    return conversations.filter((conversation) => {
      const name = getParticipantName(conversation, currentUserId).toLowerCase()
      const roomTitle = (conversation.roomId?.title || '').toLowerCase()
      return name.includes(normalizedKeyword) || roomTitle.includes(normalizedKeyword)
    })
  }, [conversations, currentUserId, deferredKeyword])

  useEffect(() => {
    if (!selectedConversationId) return
    markConversationAsRead()
  }, [markConversationAsRead, selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messagesQuery.data?.data.length, selectedConversationId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || !selectedConversationId) return

    setDraft('')

    try {
      await chatSocket.sendMessage(content)
    } catch {
      await sendMessageMutation.mutateAsync(content)
    }

    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
  }

  function handleConversationSelect(conversationId: string) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('conversationId', conversationId)
    setSearchParams(nextParams)
  }

  function handleBackToConversations() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('conversationId')
    setSearchParams(nextParams)
  }

  const messages = messagesQuery.data?.data ?? []
  const participant = selectedConversation
    ? getParticipant(selectedConversation, currentUserId)
    : null
  const room = selectedConversation?.roomId
  const isLandlordMessagesPage = pathname.startsWith('/chu-nha/tin-nhan')
  const activeConversation =
    selectedConversation && participant && room
      ? { conversation: selectedConversation, participant, room }
      : null
  const showConversationDetail = Boolean(activeConversation)
  const showConversationList = !showConversationDetail

  return (
    <section
      className={cn(
        'flex flex-col gap-5',
        isLandlordMessagesPage
          ? 'min-h-[calc(100svh-8rem)]'
          : 'min-h-[calc(100svh-3.5rem)] p-4 md:min-h-svh md:p-6 lg:p-8',
      )}
    >
      {isLandlordMessagesPage ? (
        <LandlordDashboardHeader
          greeting="Tin nhắn"
          subtitle="Trao đổi với người thuê về lịch xem phòng, chi phí và điều kiện thuê."
        />
      ) : (
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MessageCircle className="size-4" />
              Tin nhắn
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
              Trò chuyện thuê phòng
            </h1>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to={user?.role === USER_ROLES.LANDLORD ? '/chu-nha' : '/phong'}>
              <ArrowLeft className="size-4" />
              Quay lại
            </Link>
          </Button>
        </header>
      )}

      <div className="grid min-h-[70svh] flex-1 grid-cols-1 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm xl:min-h-[680px] xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside
          className={cn(
            'min-h-0 flex-col border-primary/10 bg-white xl:flex xl:border-b-0 xl:border-r',
            showConversationList ? 'flex' : 'hidden',
          )}
        >
          <div className="border-b border-primary/10 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo người hoặc phòng"
                className="h-11 bg-slate-50 pl-11 text-sm"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            {conversationsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[4.25rem] animate-pulse rounded-lg bg-slate-100"
                />
              ))
            ) : null}

            {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/20 px-4 py-10 text-center">
                <MessageCircle className="size-10 text-primary/50" />
                <p className="mt-3 text-sm font-bold text-foreground">
                  Chưa có cuộc trò chuyện
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Người thuê có thể mở chat từ trang chi tiết phòng.
                </p>
              </div>
            ) : null}

            {filteredConversations.map((conversation) => (
              <ChatConversationRow
                key={conversation._id}
                conversation={conversation}
                currentUserId={currentUserId}
                selected={conversation._id === selectedConversationId}
                onSelect={() => handleConversationSelect(conversation._id)}
              />
            ))}
          </div>
        </aside>

        <div
          className={cn(
            'min-h-0 flex-col bg-surface xl:flex',
            showConversationDetail ? 'flex' : 'hidden xl:flex',
          )}
        >
          {activeConversation ? (
            <>
              <div className="border-b border-primary/10 bg-white p-4">
                <div className="flex flex-col gap-4">
                  <div className="xl:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-w-0 px-3"
                      onClick={handleBackToConversations}
                    >
                      <ArrowLeft className="size-4" />
                      Danh sách chat
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        name={
                          activeConversation.participant.fullName ||
                          activeConversation.participant.email ||
                          'UniNest'
                        }
                        src={activeConversation.participant.avatarUrl}
                        className="bg-primary text-white"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-bold text-foreground">
                            {activeConversation.participant.fullName ||
                              activeConversation.participant.email ||
                              'Người dùng UniNest'}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <Circle className="size-2 fill-current" />
                            Đang hoạt động
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {activeConversation.participant.phone ||
                            activeConversation.participant.email ||
                            'Liên hệ qua UniNest'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 md:max-w-sm">
                      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Home className="size-4 shrink-0 text-primary" />
                        <span className="truncate">{activeConversation.room.title}</span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {formatRoomFullLocation(activeConversation.room)} ·{' '}
                        {formatRoomCurrency(activeConversation.room.pricePerMonth)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {messagesQuery.isLoading ? (
                  <div className="space-y-4">
                    <div className="h-14 w-2/3 animate-pulse rounded-lg bg-white" />
                    <div className="ml-auto h-14 w-1/2 animate-pulse rounded-lg bg-primary/20" />
                    <div className="h-20 w-3/4 animate-pulse rounded-lg bg-white" />
                  </div>
                ) : null}

                {!messagesQuery.isLoading && messages.length === 0 ? (
                  <div className="flex h-full min-h-[22rem] flex-col items-center justify-center text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="size-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      Bắt đầu trao đổi về phòng này
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Hỏi về lịch xem phòng, chi phí, nội thất hoặc điều kiện thuê.
                    </p>
                  </div>
                ) : null}

                {messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    currentUserId={currentUserId}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-primary/10 bg-white p-3 md:p-4"
              >
                <div className="flex items-end gap-2 md:gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                    rows={1}
                    placeholder="Nhập tin nhắn..."
                    className="max-h-32 min-h-11 flex-1 resize-none rounded-lg bg-slate-50 px-3 py-3 text-sm leading-5 text-foreground outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-primary md:px-4"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || sendMessageMutation.isPending}
                    aria-label="Gửi tin nhắn"
                    className="shrink-0"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex min-h-[32rem] flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="size-7" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                Chọn một cuộc trò chuyện
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Các tin nhắn giữa người thuê và chủ phòng sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
