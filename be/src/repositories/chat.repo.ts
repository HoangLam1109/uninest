import { ChatConversationModel } from "../models/ChatConversation.model.js";
import { ChatMessageModel } from "../models/ChatMessage.model.js";

const conversationPopulate = [
  { path: "roomId", select: "title address city district ward pricePerMonth" },
  { path: "landlordId", select: "fullName email phone avatarUrl" },
  { path: "tenantId", select: "fullName email phone avatarUrl" },
];

const messagePopulate = [
  { path: "senderId", select: "fullName email phone avatarUrl role" },
  { path: "receiverId", select: "fullName email phone avatarUrl role" },
];

export const ChatRepository = {
  findConversationByRoomAndTenant: (roomId: string, tenantId: string) =>
    ChatConversationModel.findOne({ roomId, tenantId, deletedAt: null }).populate(
      conversationPopulate,
    ),

  findConversationById: (conversationId: string) =>
    ChatConversationModel.findOne({
      _id: conversationId,
      deletedAt: null,
    }).populate(conversationPopulate),

  createConversation: (data: {
    roomId: string;
    landlordId: string;
    tenantId: string;
  }) => ChatConversationModel.create(data),

  listConversationsByUser: (userId: string) =>
    ChatConversationModel.find({
      deletedAt: null,
      $or: [{ landlordId: userId }, { tenantId: userId }],
    })
      .populate(conversationPopulate)
      .sort({ lastMessageAt: -1, updatedAt: -1 }),

  createMessage: (data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }) => ChatMessageModel.create(data),

  findMessagesByConversation: (
    conversationId: string,
    skip: number,
    limit: number,
  ) =>
    ChatMessageModel.find({ conversationId, deletedAt: null })
      .populate(messagePopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countMessagesByConversation: (conversationId: string) =>
    ChatMessageModel.countDocuments({ conversationId, deletedAt: null }),

  populateMessage: (messageId: string) =>
    ChatMessageModel.findById(messageId).populate(messagePopulate),

  updateConversationLastMessage: (conversationId: string, content: string) =>
    ChatConversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
      { returnDocument: "after" },
    ).populate(conversationPopulate),

  markMessagesAsRead: (conversationId: string, userId: string) =>
    ChatMessageModel.updateMany(
      {
        conversationId,
        receiverId: userId,
        readAt: { $exists: false },
        deletedAt: null,
      },
      { readAt: new Date() },
    ),
};
