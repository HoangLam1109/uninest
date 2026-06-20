import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import User from "./models/User.model.js";
import { ChatService } from "./services/chat.service.js";
import { verifyAccessToken } from "./utils/jwt.utils.js";

type SocketAck = (response: {
  success: boolean;
  data?: unknown;
  message?: string;
}) => void;

function getConversationRoom(conversationId: string) {
  return `chat:${conversationId}`;
}

function getHandshakeToken(socket: Socket) {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authorization = socket.handshake.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return null;
}

export function initializeChatSocket(
  httpServer: HttpServer,
  frontendOrigins: string[],
) {
  const io = new Server(httpServer, {
    cors: {
      origin: frontendOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket);
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(
        decoded.userId,
        "_id email fullName phone avatarUrl role",
      );

      if (!user) {
        next(new Error("Unauthorized"));
        return;
      }

      socket.data.userId = user._id.toString();
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on(
      "conversation:join",
      async (
        payload: { conversationId?: string },
        ack?: SocketAck,
      ) => {
        try {
          const userId = socket.data.userId as string;
          const conversationId = payload?.conversationId;

          if (!conversationId) {
            throw new Error("Conversation id is required");
          }

          const conversation = await ChatService.getConversation(
            conversationId,
            userId,
          );
          socket.join(getConversationRoom(conversationId));
          ack?.({ success: true, data: conversation });
        } catch (error: any) {
          ack?.({ success: false, message: error.message });
          socket.emit("message:error", { message: error.message });
        }
      },
    );

    socket.on(
      "conversation:leave",
      (payload: { conversationId?: string }, ack?: SocketAck) => {
        const conversationId = payload?.conversationId;
        if (conversationId) {
          socket.leave(getConversationRoom(conversationId));
        }
        ack?.({ success: true });
      },
    );

    socket.on(
      "message:send",
      async (
        payload: { conversationId?: string; content?: string },
        ack?: SocketAck,
      ) => {
        try {
          const userId = socket.data.userId as string;
          const { conversationId, content } = payload ?? {};

          if (!conversationId) {
            throw new Error("Conversation id is required");
          }

          if (typeof content !== "string") {
            throw new Error("Message content is required");
          }

          const data = await ChatService.sendMessage(
            conversationId,
            userId,
            content,
          );

          io.to(getConversationRoom(conversationId)).emit("message:new", data);
          io.to(getConversationRoom(conversationId)).emit(
            "conversation:updated",
            data.conversation,
          );
          ack?.({ success: true, data });
        } catch (error: any) {
          ack?.({ success: false, message: error.message });
          socket.emit("message:error", { message: error.message });
        }
      },
    );

    socket.on(
      "conversation:read",
      async (payload: { conversationId?: string }, ack?: SocketAck) => {
        try {
          const userId = socket.data.userId as string;
          const conversationId = payload?.conversationId;

          if (!conversationId) {
            throw new Error("Conversation id is required");
          }

          await ChatService.markAsRead(conversationId, userId);
          io.to(getConversationRoom(conversationId)).emit("conversation:read", {
            conversationId,
            userId,
          });
          ack?.({ success: true });
        } catch (error: any) {
          ack?.({ success: false, message: error.message });
          socket.emit("message:error", { message: error.message });
        }
      },
    );
  });

  return io;
}
