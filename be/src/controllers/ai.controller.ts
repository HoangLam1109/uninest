import type { Request, Response } from "express";
import mongoose from "mongoose";
import { USER_ROLES } from "../constants/role.constant.js";
import { AiFilterParserService } from "../services/ai-filter-parser.service.js";
import { RagRoomService, type RoomAiFilters } from "../services/rag-room.service.js";

function parseNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getFilters(body: any): RoomAiFilters {
  const filters = body?.filters || {};
  const parsedFilters: RoomAiFilters = {};

  if (typeof filters.city === "string") parsedFilters.city = filters.city;
  if (typeof filters.district === "string") parsedFilters.district = filters.district;
  if (typeof filters.roomType === "string") parsedFilters.roomType = filters.roomType;

  const minPrice = parseNumber(filters.minPrice);
  const maxPrice = parseNumber(filters.maxPrice);
  const minRating = parseNumber(filters.minRating);
  const limit = parseNumber(filters.limit);

  if (minPrice !== undefined) parsedFilters.minPrice = minPrice;
  if (maxPrice !== undefined) parsedFilters.maxPrice = maxPrice;
  if (minRating !== undefined) parsedFilters.minRating = minRating;
  if (limit !== undefined) parsedFilters.limit = limit;

  return parsedFilters;
}

function mergeFilters(parsedFilters: RoomAiFilters, explicitFilters: RoomAiFilters): RoomAiFilters {
  return {
    ...parsedFilters,
    ...explicitFilters,
  };
}

function isAdmin(req: Request) {
  return req.user?.role === USER_ROLES.ADMIN;
}

export const searchRoomsWithAi = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Question must be at least 3 characters",
      });
    }

    const parsedFilters = AiFilterParserService.parseRoomSearchFilters(question.trim());
    const explicitFilters = getFilters(req.body);
    const filters = mergeFilters(parsedFilters, explicitFilters);

    const result = await RagRoomService.searchRoomsWithRag(question.trim(), filters);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[AiController] searchRoomsWithAi:", err.message ?? err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const rebuildRoomEmbedding = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { roomId } = req.params;
    if (!roomId || typeof roomId !== "string" || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, message: "Invalid room id" });
    }

    await RagRoomService.rebuildRoomEmbedding(roomId);

    return res.json({
      success: true,
      message: "Room embedding rebuilt successfully",
    });
  } catch (err: any) {
    console.error("[AiController] rebuildRoomEmbedding:", err.message ?? err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const rebuildPublishedRoomIndex = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const result = await RagRoomService.rebuildPublishedRoomIndex();

    return res.json({
      success: true,
      message: "Published room index rebuild finished",
      data: result,
    });
  } catch (err: any) {
    console.error("[AiController] rebuildPublishedRoomIndex:", err.message ?? err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
