import type { Room } from "@/types/room";

export type ChatUser = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
};

export type ChatConversation = {
  _id: string;
  roomId: Pick<
    Room,
    "_id" | "title" | "address" | "city" | "district" | "ward" | "pricePerMonth"
  >;
  landlordId: ChatUser;
  tenantId: ChatUser;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: ChatUser;
  receiverId: ChatUser;
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ChatPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ChatConversationResponse = {
  success: boolean;
  data: ChatConversation;
  message?: string;
};

export type ChatConversationListResponse = {
  success: boolean;
  data: ChatConversation[];
  message?: string;
};

export type ChatMessageListResponse = {
  success: boolean;
  data: ChatMessage[];
  pagination: ChatPagination;
  message?: string;
};

export type SendMessageResponse = {
  success: boolean;
  data: {
    message: ChatMessage;
    conversation: ChatConversation;
  };
  message?: string;
};

export type CreateRoomConversationPayload = {
  roomId: string;
};

export type SendMessagePayload = {
  content: string;
};
