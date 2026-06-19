import { api } from '@/lib/axios'
import type {
  ChatConversationListResponse,
  ChatConversationResponse,
  ChatMessageListResponse,
  CreateRoomConversationPayload,
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.type'

export const chatApi = {
  conversations: () =>
    api.get<ChatConversationListResponse>('/chats/conversations'),

  createRoomConversation: (payload: CreateRoomConversationPayload) =>
    api.post<ChatConversationResponse>('/chats/conversations', payload),

  messages: (
    conversationId: string,
    params: { page?: number; limit?: number } = {},
  ) =>
    api.get<ChatMessageListResponse>(
      `/chats/conversations/${conversationId}/messages`,
      { params },
    ),

  sendMessage: (conversationId: string, payload: SendMessagePayload) =>
    api.post<SendMessageResponse>(
      `/chats/conversations/${conversationId}/messages`,
      payload,
    ),

  markAsRead: (conversationId: string) =>
    api.patch<{ success: boolean; message?: string }>(
      `/chats/conversations/${conversationId}/read`,
    ),
}
