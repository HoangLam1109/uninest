import express from "express";
import {
  rebuildPublishedRoomIndex,
  rebuildRoomEmbedding,
  searchRoomsWithAi,
} from "../controllers/ai.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/search-rooms", searchRoomsWithAi);
router.post(
  "/rooms/:roomId/rebuild",
  authenticateMiddleware.authenticateUser,
  rebuildRoomEmbedding
);
router.post(
  "/rebuild-room-index",
  authenticateMiddleware.authenticateUser,
  rebuildPublishedRoomIndex
);

export default router;
