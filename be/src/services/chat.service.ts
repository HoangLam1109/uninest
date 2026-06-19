import mongoose from "mongoose";
import { USER_ROLES } from "../constants/role.constant.js";
import { ChatRepository } from "../repositories/chat.repo.js";
import { RoomModel } from "../models/Room.model.js";

function getObjectId(value: any): string {
  if (!value) return "";
  if (value._id) return value._id.toString();
  return value.toString();
}

function assertConversationParticipant(conversation: any, userId: string) {
  const landlordId = getObjectId(conversation.landlordId);
  const tenantId = getObjectId(conversation.tenantId);

  if (landlordId !== userId && tenantId !== userId) {
    throw new Error("You do not have access to this conversation");
  }

  return { landlordId, tenantId };
}

export const ChatService = {
  getOrCreateConversationByRoom: async (
    roomId: string,
    tenantId: string,
    userRole?: string,
  ) => {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room id");
    }

    if (userRole && userRole !== USER_ROLES.TENANT) {
      throw new Error("Only tenants can start a room conversation");
    }

    const room = await RoomModel.findOne({ _id: roomId, deletedAt: null });
    if (!room) {
      throw new Error("Room not found");
    }

    const landlordId = room.landlordId.toString();
    if (landlordId === tenantId) {
      throw new Error("You cannot start a conversation with yourself");
    }

    const existing = await ChatRepository.findConversationByRoomAndTenant(
      roomId,
      tenantId,
    );
    if (existing) {
      return existing;
    }

    const conversation = await ChatRepository.createConversation({
      roomId,
      landlordId,
      tenantId,
    });

    return ChatRepository.findConversationById(conversation._id.toString());
  },

  listConversations: (userId: string) =>
    ChatRepository.listConversationsByUser(userId),

  getConversation: async (conversationId: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error("Invalid conversation id");
    }

    const conversation = await ChatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    assertConversationParticipant(conversation, userId);
    return conversation;
  },

  getMessages: async (
    conversationId: string,
    userId: string,
    skip: number,
    limit: number,
  ) => {
    await ChatService.getConversation(conversationId, userId);

    const [messages, total] = await Promise.all([
      ChatRepository.findMessagesByConversation(conversationId, skip, limit),
      ChatRepository.countMessagesByConversation(conversationId),
    ]);

    return {
      messages: messages.reverse(),
      total,
    };
  },

  sendMessage: async (
    conversationId: string,
    senderId: string,
    content: string,
  ) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error("Message content is required");
    }

    if (trimmedContent.length > 2000) {
      throw new Error("Message content cannot exceed 2000 characters");
    }

    const conversation = await ChatService.getConversation(
      conversationId,
      senderId,
    );
    const { landlordId, tenantId } = assertConversationParticipant(
      conversation,
      senderId,
    );
    const receiverId = senderId === landlordId ? tenantId : landlordId;

    const message = await ChatRepository.createMessage({
      conversationId,
      senderId,
      receiverId,
      content: trimmedContent,
    });

    const [populatedMessage, updatedConversation] = await Promise.all([
      ChatRepository.populateMessage(message._id.toString()),
      ChatRepository.updateConversationLastMessage(
        conversationId,
        trimmedContent,
      ),
    ]);

    return {
      message: populatedMessage,
      conversation: updatedConversation,
    };
  },

  markAsRead: async (conversationId: string, userId: string) => {
    await ChatService.getConversation(conversationId, userId);
    return ChatRepository.markMessagesAsRead(conversationId, userId);
  },
};
