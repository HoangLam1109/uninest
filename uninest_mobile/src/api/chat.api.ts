import { api } from "@/lib/api-client";
import type {
  ChatConversationListResponse,
  ChatConversationResponse,
  ChatMessageListResponse,
  CreateRoomConversationPayload,
  SendMessagePayload,
  SendMessageResponse,
} from "@/types/chat";

export const chatApi = {
  conversations: () =>
    api.get<ChatConversationListResponse>("/chats/conversations"),

  createRoomConversation: (payload: CreateRoomConversationPayload) =>
    api.post<ChatConversationResponse>("/chats/conversations", payload),

  messages: (
    conversationId: string,
    params: { page?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 80));
    return api.get<ChatMessageListResponse>(
      `/chats/conversations/${conversationId}/messages?${query.toString()}`,
    );
  },

  sendMessage: (conversationId: string, payload: SendMessagePayload) =>
    api.post<SendMessageResponse>(
      `/chats/conversations/${conversationId}/messages`,
      payload,
    ),

  markAsRead: (conversationId: string) =>
    api.patch<{ success: boolean; message?: string }>(
      `/chats/conversations/${conversationId}/read`,
    ),
};
