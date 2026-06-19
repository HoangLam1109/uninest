import express from "express";
import {
  addFavorite,
  checkIsFavorited,
  getRoomFavoriteCount,
  removeFavorite,
  getTenantFavorites,
} from "../controllers/favorite.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// Get tenant favorites (most specific path first)
router.get("/", authenticateMiddleware.authenticateUser, getTenantFavorites);

// Check if specific room is favorited
router.get("/:roomId/check", authenticateMiddleware.authenticateUser, checkIsFavorited);

// Get room favorite count (public)
router.get("/:roomId/count", getRoomFavoriteCount);

// Add/Remove favorite (param routes)
router.post("/:roomId", authenticateMiddleware.authenticateUser, addFavorite);
router.delete("/:roomId", authenticateMiddleware.authenticateUser, removeFavorite);

export default router;
