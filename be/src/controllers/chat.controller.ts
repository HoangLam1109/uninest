import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ChatService } from "../services/chat.service.js";

function getChatErrorStatus(message: string) {
  if (message.includes("Unauthorized")) return 401;
  if (message.includes("Invalid")) return 400;
  if (message.includes("not found")) return 404;
  if (
    message.includes("do not have access") ||
    message.includes("Only tenants") ||
    message.includes("yourself")
  ) {
    return 403;
  }
  return 400;
}

export const getOrCreateRoomConversation = async (
  req: Request,
  res: Response,
) => {
  try {
    const tenantId = req.userId;
    if (!tenantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { roomId } = req.body;
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId as string)) {
      return res.status(400).json({ success: false, message: "Invalid room id" });
    }

    const conversation = await ChatService.getOrCreateConversationByRoom(
      roomId,
      tenantId,
      req.user?.role,
    );

    return res.status(201).json({
      success: true,
      message: "Conversation ready",
      data: conversation,
    });
  } catch (err: any) {
    return res
      .status(getChatErrorStatus(err.message))
      .json({ success: false, message: err.message });
  }
};

export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conversations = await ChatService.listConversations(userId);
    return res.json({ success: true, data: conversations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId as string)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation id" });
    }

    const { page = 1, limit = 30 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Math.min(Number(limit), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const { messages, total } = await ChatService.getMessages(
      conversationId as string,
      userId,
      skip,
      limitNumber,
    );

    return res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res
      .status(getChatErrorStatus(err.message))
      .json({ success: false, message: err.message });
  }
};

export const sendConversationMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    const { conversationId } = req.params;
    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId as string)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation id" });
    }

    const { content } = req.body;
    if (typeof content !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required" });
    }

    const data = await ChatService.sendMessage(
      conversationId as string,
      senderId,
      content,
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data,
    });
  } catch (err: any) {
    return res
      .status(getChatErrorStatus(err.message))
      .json({ success: false, message: err.message });
  }
};

export const markConversationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId as string)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation id" });
    }

    await ChatService.markAsRead(conversationId as string, userId);
    return res.json({ success: true, message: "Conversation marked as read" });
  } catch (err: any) {
    return res
      .status(getChatErrorStatus(err.message))
      .json({ success: false, message: err.message });
  }
};
