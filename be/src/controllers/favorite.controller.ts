import type { Request, Response } from "express";
import mongoose from "mongoose";
import { FavoriteService } from "../services/favorite.service.js";

/**
 * ADD FAVORITE
 */
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    let { roomId } = req.params;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!roomId || typeof roomId !== "string" || !mongoose.Types.ObjectId.isValid(roomId))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    const favorite = await FavoriteService.addFavorite(roomId as string, tenantId);

    return res.status(201).json({
      success: true,
      message: "Room added to favorites",
      data: favorite,
    });
  } catch (err: any) {
    if (err.message === "Room is already in your favorites") {
      return res.status(409).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * REMOVE FAVORITE
 */
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    let { roomId } = req.params;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!roomId || typeof roomId !== "string" || !mongoose.Types.ObjectId.isValid(roomId))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    const favorite = await FavoriteService.removeFavorite(roomId, tenantId);

    if (!favorite)
      return res.status(404).json({ success: false, message: "Favorite not found" });

    return res.json({
      success: true,
      message: "Room removed from favorites",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET TENANT'S FAVORITES
 */
export const getTenantFavorites = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { favorites, total } = await FavoriteService.getTenantFavorites(
      tenantId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: favorites,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CHECK IF ROOM IS FAVORITED
 */
export const checkIsFavorited = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    let { roomId } = req.params;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!roomId || typeof roomId !== "string" || !mongoose.Types.ObjectId.isValid(roomId))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    const isFavorited = await FavoriteService.isFavorited(roomId, tenantId);

    return res.json({
      success: true,
      data: {
        roomId,
        isFavorited: !!isFavorited,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ROOM FAVORITE COUNT
 */
export const getRoomFavoriteCount = async (req: Request, res: Response) => {
  try {
    let { roomId } = req.params;

    if (!roomId || typeof roomId !== "string" || !mongoose.Types.ObjectId.isValid(roomId))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    const count = await FavoriteService.getRoomFavoriteCount(roomId);

    return res.json({
      success: true,
      data: {
        roomId,
        favoriteCount: count,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
