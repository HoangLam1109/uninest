import express from "express";
import {
  getConversationMessages,
  getMyConversations,
  getOrCreateRoomConversation,
  markConversationAsRead,
  sendConversationMessage,
} from "../controllers/chat.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.use(authenticateMiddleware.authenticateUser);

router.get("/conversations", getMyConversations);
router.post("/conversations", getOrCreateRoomConversation);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/messages", sendConversationMessage);
router.patch("/conversations/:conversationId/read", markConversationAsRead);

export default router;
