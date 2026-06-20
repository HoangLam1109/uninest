import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { chatApi } from "@/api/chat.api";
import { env } from "@/config/env";
import { getAccessToken } from "@/lib/auth-session";
import type { ChatConversation, ChatMessage } from "@/types/chat";

type MessageNewPayload = {
  message: ChatMessage;
  conversation: ChatConversation;
};

type SendAck = {
  success: boolean;
  data?: MessageNewPayload;
  message?: string;
};

export function useChatSocket(
  conversationId: string | null,
  onMessageNew?: (payload: MessageNewPayload) => void,
  onConversationUpdated?: (conversation: ChatConversation) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessageNew);
  const onConversationRef = useRef(onConversationUpdated);

  onMessageRef.current = onMessageNew;
  onConversationRef.current = onConversationUpdated;

  useEffect(() => {
    if (!conversationId) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(env.socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("conversation:join", { conversationId });

    socket.on("message:new", (payload: MessageNewPayload) => {
      if (payload.message.conversationId === conversationId) {
        onMessageRef.current?.(payload);
      }
    });

    socket.on("conversation:updated", (conversation: ChatConversation) => {
      if (conversation._id === conversationId) {
        onConversationRef.current?.(conversation);
      }
    });

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) {
        throw new Error("Chưa chọn cuộc trò chuyện");
      }

      const trimmed = content.trim();
      if (!trimmed) return null;

      const socket = socketRef.current;
      if (socket?.connected) {
        const ack = await new Promise<SendAck>((resolve) => {
          socket.emit(
            "message:send",
            { conversationId, content: trimmed },
            (response: SendAck) => resolve(response),
          );
        });

        if (ack.success && ack.data) {
          return ack.data;
        }
      }

      const response = await chatApi.sendMessage(conversationId, {
        content: trimmed,
      });
      return response.data;
    },
    [conversationId],
  );

  return { sendMessage };
}

export function getChatParticipantName(
  user: { fullName?: string; email?: string } | undefined,
) {
  return user?.fullName?.trim() || user?.email || "Người dùng";
}

export function formatChatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseBudgetFromQuestion(question: string) {
  const filters: { minPrice?: number; maxPrice?: number; limit?: number } = {
    limit: 5,
  };
  const millionMatch = question.match(/(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|m)/i);
  if (millionMatch?.[1]) {
    const value = Math.round(parseFloat(millionMatch[1].replace(",", ".")) * 1_000_000);
    if (/dưới|tối đa|<=|<\s*/i.test(question)) {
      filters.maxPrice = value;
    } else if (/trên|từ|>=|>\s*/i.test(question)) {
      filters.minPrice = value;
    } else {
      filters.minPrice = Math.round(value * 0.8);
      filters.maxPrice = Math.round(value * 1.2);
    }
  }
  return filters;
}
