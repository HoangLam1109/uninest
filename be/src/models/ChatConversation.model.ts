import { Schema, model, Document, Types } from "mongoose";

export interface IChatConversation extends Document {
  roomId: Types.ObjectId;
  landlordId: Types.ObjectId;
  tenantId: Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "chat_conversations",
  },
);

ChatConversationSchema.index(
  { roomId: 1, tenantId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
ChatConversationSchema.index({ landlordId: 1, tenantId: 1 });
ChatConversationSchema.index({ deletedAt: 1 });
ChatConversationSchema.index({ lastMessageAt: -1 });

export const ChatConversationModel = model<IChatConversation>(
  "ChatConversation",
  ChatConversationSchema,
);
