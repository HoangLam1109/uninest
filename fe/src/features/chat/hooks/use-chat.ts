import { useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { env } from '@/config/env'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth.store'
import { chatApi } from '../api/chat.api'
import type {
  ChatConversation,
  ChatMessage,
  ChatMessageListResponse,
} from '../types/chat.type'

type MessageSocketPayload = {
  message: ChatMessage
  conversation: ChatConversation
}

type SocketAck<T> = {
  success: boolean
  data?: T
  message?: string
}

export const chatKeys = {
  all: ['chats'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
}

function getSocketUrl() {
  return env.apiBaseUrl.replace(/\/api\/?$/, '')
}

function upsertMessage(messages: ChatMessage[], nextMessage: ChatMessage) {
  if (messages.some((message) => message._id === nextMessage._id)) {
    return messages
  }
  return [...messages, nextMessage]
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((first, second) => {
    const firstTime = first.lastMessageAt ?? first.updatedAt ?? first.createdAt ?? ''
    const secondTime = second.lastMessageAt ?? second.updatedAt ?? second.createdAt ?? ''
    return secondTime.localeCompare(firstTime)
  })
}

function syncChatPayloadToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  payload: MessageSocketPayload,
) {
  queryClient.setQueryData<ChatMessageListResponse>(
    chatKeys.messages(payload.message.conversationId),
    (current) =>
      current
        ? {
            ...current,
            data: upsertMessage(current.data, payload.message),
            pagination: {
              ...current.pagination,
              total: current.data.some(
                (message) => message._id === payload.message._id,
              )
                ? current.pagination.total
                : current.pagination.total + 1,
            },
          }
        : current,
  )

  queryClient.setQueryData<ChatConversation[]>(
    chatKeys.conversations(),
    (current) => {
      if (!current) return current

      const exists = current.some(
        (conversation) => conversation._id === payload.conversation._id,
      )
      const next = exists
        ? current.map((conversation) =>
            conversation._id === payload.conversation._id
              ? payload.conversation
              : conversation,
          )
        : [payload.conversation, ...current]

      return sortConversations(next)
    },
  )
}

export function useGetChatConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const { data } = await chatApi.conversations()
      return data.data
    },
  })
}

export function useGetChatMessages(conversationId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const { data } = await chatApi.messages(conversationId as string, {
        page: 1,
        limit: 80,
      })
      return data
    },
  })
}

export function useCreateRoomConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data } = await chatApi.createRoomConversation({ roomId })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      toast.error('Không thể mở cuộc trò chuyện', {
        description: getApiErrorMessage(error, 'Vui lòng đăng nhập bằng tài khoản người thuê.'),
      })
    },
  })
}

export function useSendChatMessage(conversationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) {
        throw new Error('Conversation id is required')
      }
      const { data } = await chatApi.sendMessage(conversationId, { content })
      return data.data
    },
    onSuccess: (data) => {
      syncChatPayloadToCache(queryClient, data)
    },
    onError: (error) => {
      toast.error('Không thể gửi tin nhắn', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}

export function useMarkConversationAsRead(conversationId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!conversationId) return
      await chatApi.markAsRead(conversationId)
    },
  })
}

export function useChatSocket(conversationId: string | null) {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const socket = io(getSocketUrl(), {
      auth: { token: accessToken },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('message:new', (payload: MessageSocketPayload) => {
      syncChatPayloadToCache(queryClient, payload)
    })

    socket.on('conversation:updated', (conversation: ChatConversation) => {
      queryClient.setQueryData<ChatConversation[]>(
        chatKeys.conversations(),
        (current) => {
          if (!current) return current
          const exists = current.some((item) => item._id === conversation._id)
          const next = exists
            ? current.map((item) => (item._id === conversation._id ? conversation : item))
            : [conversation, ...current]
          return sortConversations(next)
        },
      )
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, queryClient])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !conversationId) return

    socket.emit('conversation:join', { conversationId })
    return () => {
      socket.emit('conversation:leave', { conversationId })
    }
  }, [conversationId])

  return useMemo(
    () => ({
      sendMessage: (content: string) =>
        new Promise<MessageSocketPayload>((resolve, reject) => {
          const socket = socketRef.current
          if (!socket?.connected || !conversationId) {
            reject(new Error('Socket is not connected'))
            return
          }

          socket.emit(
            'message:send',
            { conversationId, content },
            (ack: SocketAck<MessageSocketPayload>) => {
              if (!ack.success || !ack.data) {
                reject(new Error(ack.message ?? 'Cannot send message'))
                return
              }
              syncChatPayloadToCache(queryClient, ack.data)
              resolve(ack.data)
            },
          )
        }),
    }),
    [conversationId, queryClient],
  )
}
