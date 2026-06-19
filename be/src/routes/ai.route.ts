import express from "express";
import {
  rebuildPublishedRoomIndex,
  rebuildRoomEmbedding,
  searchRoomsWithAi,
} from "../controllers/ai.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post(
  "/search-rooms",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.TENANT),
  searchRoomsWithAi
);
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
